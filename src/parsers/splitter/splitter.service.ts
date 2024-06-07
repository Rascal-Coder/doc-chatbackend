import { Injectable } from '@nestjs/common'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Document } from 'langchain/document'
@Injectable()
export class SplitterService {
  constructor() {}
  async splitDocsIntoChunks(docs: Document[]) {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 200
    })
    return await textSplitter.splitDocuments(docs)
  }
}
