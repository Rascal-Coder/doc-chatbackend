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
import { splitDocsIntoChunks } from '@/utils'
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama'
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'

import { Ollama } from '@langchain/community/llms/ollama'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents'
import { BaseMessage } from '@langchain/core/messages'
import { createRetrievalChain } from 'langchain/chains/retrieval'
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever'
import { createClient } from '@supabase/supabase-js'
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
  description: "The API key in request's header is missing or invalid"
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
      const rawDocs = await this.pdfParserService.parsePdf(file.buffer)
      const docs = await splitDocsIntoChunks(rawDocs)
      const llm = new Ollama({
        model: 'qwen:4b'
      })
      const embedding = new OllamaEmbeddings({
        model: 'nomic-embed-text'
      })
      const vectorStore = await SupabaseVectorStore.fromDocuments(docs, embedding, {
        client: createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || ''),
        tableName: 'documents'
      })
      // Contextualize question
      const contextualizeQSystemPrompt = `
      Given a chat history and the latest user question
      which might reference context in the chat history,
      formulate a standalone question which can be understood
      without the chat history. Do NOT answer the question, just
      reformulate it if needed and otherwise return it as is.`
      const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
        ['system', contextualizeQSystemPrompt],
        new MessagesPlaceholder('chat_history'),
        ['human', '{input}']
      ])
      const historyAwareRetriever = await createHistoryAwareRetriever({
        llm,
        retriever: vectorStore.asRetriever(),
        rephrasePrompt: contextualizeQPrompt
      })

      // Answer question
      const qaSystemPrompt = `
                You are an assistant for question-answering tasks. Use
                the following pieces of retrieved context to answer the
                question. If you don't know the answer, just say that you
                don't know. Use three sentences maximum and keep the answer
                concise.
                \n\n
              {context}`
      const qaPrompt = ChatPromptTemplate.fromMessages([
        ['system', qaSystemPrompt],
        new MessagesPlaceholder('chat_history'),
        ['human', '{input}']
      ])
      // Below we use createStuffDocuments_chain to feed all retrieved context
      // into the LLM. Note that we can also use StuffDocumentsChain and other
      // instances of BaseCombineDocumentsChain.
      const questionAnswerChain = await createStuffDocumentsChain({
        llm,
        prompt: qaPrompt
      })

      const ragChain = await createRetrievalChain({
        retriever: historyAwareRetriever,
        combineDocsChain: questionAnswerChain
      })

      // Usage:
      const chat_history: BaseMessage[] = []
      const response = await ragChain.invoke({
        chat_history,
        input: '请问魏佳是谁'
      })

      return {
        originalFileName: file.originalname,
        docs: docs,
        vectorStore: response
      }
    } catch (e) {
      throw new UnprocessableEntityException(e.message)
    }
  }
}
