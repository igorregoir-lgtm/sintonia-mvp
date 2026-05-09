// Roda exclusivamente no browser (acessa IndexedDB)
// DÍVIDA[mvp]: parser de referência é heurístico — pode falhar em formatos incomuns (D006)

import { exams } from './repositories'
import type { LabResult } from './types'

export interface AnalyteTrendPoint {
  date: number
  value: number
  flag: 'alto' | 'baixo' | 'normal' | null
  referenceMin: number | null
  referenceMax: number | null
  examId: string
  fileName: string
}

export interface AnalyteTrend {
  name: string
  unit: string
  points: AnalyteTrendPoint[]
  hasOutOfRange: boolean
  latestReferenceMin: number | null
  latestReferenceMax: number | null
}

// Parseia strings de referência como "3.5–5.0", "70-100", "< 100", "> 60", "Até 40", "0.5 a 1.5"
function parseReferenceRange(raw: string | undefined): { min: number | null; max: number | null } {
  if (!raw) return { min: null, max: null }

  const clean = raw.trim().replace(',', '.')

  // "< N" ou "Até N" ou "menor que N"
  const upperOnly = clean.match(/^(?:<|até|menor\s+que)\s*([\d.]+)/i)
  if (upperOnly) return { min: null, max: parseFloat(upperOnly[1]) }

  // "> N" ou "maior que N" ou "acima de N"
  const lowerOnly = clean.match(/^(?:>|maior\s+que|acima\s+de)\s*([\d.]+)/i)
  if (lowerOnly) return { min: parseFloat(lowerOnly[1]), max: null }

  // "N – M" ou "N - M" ou "N a M" (range completo)
  const range = clean.match(/([\d.]+)\s*(?:–|-|a)\s*([\d.]+)/)
  if (range) return { min: parseFloat(range[1]), max: parseFloat(range[2]) }

  return { min: null, max: null }
}

function normalizeAnalyteName(name: string): string {
  return name.trim().toLowerCase()
}

export async function getAnalyteTrends(sessionId?: string): Promise<AnalyteTrend[]> {
  let resolvedExams
  if (sessionId) {
    resolvedExams = await exams.listBySession(sessionId)
  } else {
    const { getDb } = await import('./schema')
    const db = await getDb()
    resolvedExams = await db.getAll('exams')
  }

  const map = new Map<string, { unit: string; points: AnalyteTrendPoint[] }>()

  for (const exam of resolvedExams) {
    if (exam.extractedData?.type !== 'laboratorial') continue

    for (const result of exam.extractedData.results) {
      const { value, unit } = parseLabResult(result)
      if (value === null) continue

      const key = normalizeAnalyteName(result.name)
      const { min, max } = parseReferenceRange(result.referenceRange ?? undefined)

      const point: AnalyteTrendPoint = {
        date: exam.uploadedAt,
        value,
        flag: result.flag ?? null,
        referenceMin: min,
        referenceMax: max,
        examId: exam.id,
        fileName: exam.fileName,
      }

      if (!map.has(key)) {
        map.set(key, { unit: unit ?? result.unit ?? '', points: [] })
      }
      map.get(key)!.points.push(point)
    }
  }

  const trends: AnalyteTrend[] = []

  for (const [key, { unit, points }] of map.entries()) {
    const sorted = points.sort((a, b) => a.date - b.date)
    const last = sorted[sorted.length - 1]
    const hasOutOfRange = sorted.some(p => p.flag === 'alto' || p.flag === 'baixo')

    trends.push({
      name: key,
      unit,
      points: sorted,
      hasOutOfRange,
      latestReferenceMin: last?.referenceMin ?? null,
      latestReferenceMax: last?.referenceMax ?? null,
    })
  }

  // Analitos com alteração primeiro
  return trends.sort((a, b) => (b.hasOutOfRange ? 1 : 0) - (a.hasOutOfRange ? 1 : 0))
}

export async function getAnalyteTrend(analyteName: string): Promise<AnalyteTrend | null> {
  const all = await getAnalyteTrends()
  return all.find(t => t.name === normalizeAnalyteName(analyteName)) ?? null
}

function parseLabResult(result: LabResult): { value: number | null; unit: string | null } {
  const raw = result.value?.trim().replace(',', '.')
  if (!raw) return { value: null, unit: null }
  const num = parseFloat(raw)
  return { value: isNaN(num) ? null : num, unit: result.unit ?? null }
}
