import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { ExtractedExamData } from '@/lib/db/types'

// DÍVIDA[mvp]: sem rate limiting — adicionar em v1.0 antes de expor a usuários externos
// DÍVIDA[mvp]: sem autenticação da requisição — qualquer origem pode chamar esta rota

const client = new Anthropic()

const SYSTEM_PROMPT = `Você é especialista em extração estruturada de dados de laudos médicos brasileiros.

Analise o texto fornecido e retorne SOMENTE um JSON válido, sem markdown, sem explicações.

Detecte o tipo de exame e use o schema correspondente:

LABORATORIAL:
{
  "type": "laboratorial",
  "examDate": "YYYY-MM-DD ou null",
  "laboratoryName": "nome ou null",
  "requestingDoctor": "nome ou null",
  "results": [
    {
      "name": "nome do analito",
      "value": "valor como string",
      "unit": "unidade ou vazio",
      "referenceRange": "ex: 3.5–5.0 ou null",
      "flag": "alto" | "baixo" | "normal" | null
    }
  ],
  "observations": "texto de observações gerais ou null"
}

IMAGEM (RX, TC, RM, US, PET):
{
  "type": "imagem",
  "examDate": "YYYY-MM-DD ou null",
  "modality": "RX" | "TC" | "RM" | "US" | "PET" | "outro",
  "bodyRegion": "região anatômica ou null",
  "radiologist": "nome do médico laudador ou null",
  "findings": "achados descritos no laudo",
  "conclusion": "conclusão/impressão diagnóstica ou null"
}

POLISSONOGRAFIA:
{
  "type": "polissonografia",
  "examDate": "YYYY-MM-DD ou null",
  "iah": número decimal ou null,
  "sleepEfficiency": porcentagem 0–100 ou null,
  "remPercentage": porcentagem 0–100 ou null,
  "findings": "resumo dos achados principais"
}

OUTROS (não identificado ou não se enquadra acima):
{
  "type": "outro",
  "rawText": "primeiros 2000 caracteres do texto original"
}

Regras:
- flag "alto" se valor acima do limite superior de referência
- flag "baixo" se valor abaixo do limite inferior
- flag "normal" se dentro do intervalo
- flag null se não houver valor de referência para comparar
- Preserve números exatamente como aparecem no laudo
- Em caso de dúvida sobre o tipo, use "outro"`

function buildUserMessage(text: string, fileName: string): string {
  return `Nome do arquivo: ${fileName}\n\nConteúdo extraído do PDF:\n\n${text.slice(0, 12000)}`
}

function safeParseJson(raw: string): ExtractedExamData | null {
  try {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
    return JSON.parse(cleaned) as ExtractedExamData
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  let text: string
  let fileName: string

  try {
    const body = await request.json()
    text = typeof body.text === 'string' ? body.text : ''
    fileName = typeof body.fileName === 'string' ? body.fileName : 'exame.pdf'
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido' }, { status: 400 })
  }

  if (!text.trim()) {
    return NextResponse.json({ error: 'Texto do exame não pode ser vazio' }, { status: 400 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY não configurada' }, { status: 500 })
  }

  let rawContent: string
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserMessage(text, fileName) }],
    })
    const block = message.content[0]
    rawContent = block.type === 'text' ? block.text : ''
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: `Falha na análise: ${msg}` }, { status: 502 })
  }

  const parsed = safeParseJson(rawContent)

  if (parsed) {
    return NextResponse.json(parsed)
  }

  // Claude retornou algo não parseável — fallback com texto bruto
  const fallback: ExtractedExamData = { type: 'outro', rawText: text.slice(0, 2000) }
  return NextResponse.json(fallback)
}
