import { ApiProperty, IntersectionType } from '@nestjs/swagger'

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
  content: string
}

export class PdfParserUploadResultDto extends IntersectionType(PdfParserResultDto, UploadResultDto) {}
