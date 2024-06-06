import { Injectable } from '@nestjs/common'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { Document } from 'langchain/document'
import { PdfNotParsedError } from './exceptions'

@Injectable()
export class PdfParserService {
  constructor() {}
  async parsePdf(file: Buffer): Promise<Document<Record<string, any>>[]> {
    const blobFile = new Blob([file])
    const loader = new PDFLoader(blobFile, {
      splitPages: true
    })
    const docs = await loader.load()
    if (docs.length === 0) {
      throw new PdfNotParsedError()
    }
    return docs
  }
}
