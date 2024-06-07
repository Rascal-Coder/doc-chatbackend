import { ApiProperty, IntersectionType } from '@nestjs/swagger'
import { Document } from 'langchain/document'
// import { ChainValues } from '@langchain/community/chains'
class UploadResultDto {
  @ApiProperty({
    description: 'Original file name of the uploaded file'
  })
  originalFileName: string
}

export class PdfParserResultDto {
  @ApiProperty({
    description: 'Parsed and post-processed content of the PDF file'
  })
  docs: Document[]
  vectorStore: any
}

export class PdfParserUploadResultDto extends IntersectionType(PdfParserResultDto, UploadResultDto) {}
