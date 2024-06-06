import {
  Controller,
  HttpCode,
  ParseFilePipeBuilder,
  Post,
  UnprocessableEntityException,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse
} from '@nestjs/swagger'
import { PdfParserUploadResultDto } from './dto/pdf-parser-result.dto'
import { PdfParserService } from './pdf-parser.service'
const uploadSchema = {
  type: 'object',
  properties: {
    file: {
      type: 'string',
      format: 'binary'
    }
  }
}
const pdfPipe = new ParseFilePipeBuilder()
  .addFileTypeValidator({
    fileType: 'pdf'
  })
  .addMaxSizeValidator({
    maxSize: 1024 * 1024 * 5 // 5 MB
  })
  .build({
    fileIsRequired: true
  })

@ApiUnauthorizedResponse({
  description: "The API ket in request's header is missing or invalid"
})
@ApiBadRequestResponse({
  description: 'The request body or the uploaded file is invalid or missing'
})
@ApiUnprocessableEntityResponse({
  description: 'The PDF does not contain plain text or information in text format.'
})
@ApiSecurity('apiKey')
@ApiTags('parsers')
@Controller({ path: 'parser/pdf', version: '1' })
export class PdfParserController {
  constructor(private readonly pdfParserService: PdfParserService) {}

  @ApiOperation({
    summary: 'Return text from uploaded PDF file',
    description: `This endpoint retrieves the content of an uploaded PDF file and returns it as a text.\n
    The file must be a PDF parsable text context, with a maximum size of 5MB.
   `
  })
  @ApiOkResponse({
    type: PdfParserUploadResultDto,
    description: 'The PDF was parsed and post-processed successfully. Its content is returned as text.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: uploadSchema, description: 'PDF file to be parsed' })
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(200)
  @Post('upload')
  async parsePdfFromUpload(@UploadedFile(pdfPipe) file: Express.Multer.File): Promise<PdfParserUploadResultDto> {
    try {
      const docs = await this.pdfParserService.parsePdf(file.buffer)
      return {
        originalFileName: file.originalname,
        docs: docs
      }
    } catch (e) {
      throw new UnprocessableEntityException(e.message)
    }
  }
}
