export class PdfNotParsedError extends Error {
  constructor() {
    super('The PDF file could not be parsed. It may not contain plain text or information in text format.')
  }
}