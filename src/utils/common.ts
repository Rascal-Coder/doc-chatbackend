import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Document } from 'langchain/document'
// import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama'
// import { Chroma } from '@langchain/community/vectorstores/chroma'
export const splitDocsIntoChunks = async (docs: Document[]) => {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 200
  })
  const allSplits = await textSplitter.splitDocuments(docs)
  return allSplits
}
// export const embedDocuments = async (docs: Document[], embeddings: OllamaEmbeddings, dbConfig) => {
//   await Chroma.fromDocuments(docs, embeddings, dbConfig)
// }
