import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import Poppler from 'node-poppler'
import { PdfNotParsedError } from './exceptions'

@Injectable()
export class PdfParserService {
  constructor(private configService: ConfigService) {}
  async parsePdf(file: Buffer) {
    const poppler = new Poppler()
    const output = await poppler.pdfToText(file, null, {
      maintainLayout: true,
      quiet: true
    })
    if (output.length === 0) {
      throw new PdfNotParsedError()
    }

    return this.postProcessText(output)
  }

  private postProcessText(text: string) {
    const processedText = text
      .split('\n')
      //trim each line
      .map(line => line.trim())
      //keep only one line if multiple lines are empty
      .filter((line, index, arr) => line !== '' || arr[index - 1] !== '')
      //remove whitespace in lines if there are more than 3 spaces
      .map(line => line.replace(/\s{3,}/g, '   '))
      .join('\n')

    return processedText
  }
}
