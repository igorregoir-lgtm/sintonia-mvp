// Roda exclusivamente no browser — não importar em Server Components
// DÍVIDA[mvp]: worker do PDF.js carregado de CDN (unpkg); auto-hospedar em v1.0
// DÍVIDA[mvp]: sem callback de progresso — usuário não vê status do OCR

export interface ExtractionResult {
  text: string
  method: 'pdfjs' | 'tesseract'
  pageCount: number
}

const MIN_DIGITAL_TEXT_LENGTH = 100

async function extractWithPdfJs(file: File): Promise<{ text: string; pageCount: number }> {
  const { getDocument, GlobalWorkerOptions, version } = await import('pdfjs-dist')

  if (!GlobalWorkerOptions.workerSrc) {
    GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`
  }

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await getDocument({ data: arrayBuffer }).promise
  const pages: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    pages.push(pageText)
  }

  return { text: pages.join('\n\n'), pageCount: pdf.numPages }
}

async function extractWithTesseract(file: File): Promise<{ text: string; pageCount: number }> {
  const { getDocument, GlobalWorkerOptions, version } = await import('pdfjs-dist')
  const { createWorker } = await import('tesseract.js')

  if (!GlobalWorkerOptions.workerSrc) {
    GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`
  }

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await getDocument({ data: arrayBuffer }).promise
  const ocrWorker = await createWorker(['por', 'eng'])
  const pages: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    // scale 2.0 melhora qualidade OCR em laudos com texto pequeno
    const viewport = page.getViewport({ scale: 2.0 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')!
    await page.render({ canvasContext: ctx, viewport, canvas }).promise
    const { data } = await ocrWorker.recognize(canvas.toDataURL('image/png'))
    pages.push(data.text)
  }

  await ocrWorker.terminate()
  return { text: pages.join('\n\n'), pageCount: pdf.numPages }
}

export async function extractTextFromPdf(file: File): Promise<ExtractionResult> {
  const { text: digitalText, pageCount } = await extractWithPdfJs(file)

  if (digitalText.trim().length >= MIN_DIGITAL_TEXT_LENGTH) {
    return { text: digitalText, method: 'pdfjs', pageCount }
  }

  const { text: ocrText } = await extractWithTesseract(file)
  return { text: ocrText, method: 'tesseract', pageCount }
}
