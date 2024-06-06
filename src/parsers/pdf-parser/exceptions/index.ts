export class PdfNotParsedError extends Error {
  constructor() {
    super('The PDF file could not be parsed.')
  }
}
