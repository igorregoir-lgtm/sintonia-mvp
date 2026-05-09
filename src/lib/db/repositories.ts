import { getDb } from './schema'
import type {
  ClinicalSession,
  ScaleResult,
  Medication,
  ExamRecord,
  TrackerEntry,
  Report,
  SessionStatus,
  ScaleType,
} from './types'

function id(): string {
  return crypto.randomUUID()
}

function now(): number {
  return Date.now()
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export const sessions = {
  async create(data: Omit<ClinicalSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClinicalSession> {
    const db = await getDb()
    const record: ClinicalSession = { ...data, id: id(), createdAt: now(), updatedAt: now() }
    await db.put('sessions', record)
    return record
  },

  async get(sessionId: string): Promise<ClinicalSession | undefined> {
    return (await getDb()).get('sessions', sessionId)
  },

  async list(status?: SessionStatus): Promise<ClinicalSession[]> {
    const db = await getDb()
    if (status) return db.getAllFromIndex('sessions', 'by-status', status)
    return db.getAll('sessions')
  },

  async update(sessionId: string, patch: Partial<Omit<ClinicalSession, 'id' | 'createdAt'>>): Promise<ClinicalSession> {
    const db = await getDb()
    const existing = await db.get('sessions', sessionId)
    if (!existing) throw new Error(`Sessão não encontrada: ${sessionId}`)
    const updated: ClinicalSession = { ...existing, ...patch, updatedAt: now() }
    await db.put('sessions', updated)
    return updated
  },

  async delete(sessionId: string): Promise<void> {
    return (await getDb()).delete('sessions', sessionId)
  },
}

// ─── Scales ──────────────────────────────────────────────────────────────────

export const scales = {
  async create(data: Omit<ScaleResult, 'id' | 'appliedAt'>): Promise<ScaleResult> {
    const db = await getDb()
    const record: ScaleResult = { ...data, id: id(), appliedAt: now() }
    await db.put('scales', record)
    return record
  },

  async listBySession(sessionId: string): Promise<ScaleResult[]> {
    return (await getDb()).getAllFromIndex('scales', 'by-sessionId', sessionId)
  },

  async listByType(scaleType: ScaleType): Promise<ScaleResult[]> {
    return (await getDb()).getAllFromIndex('scales', 'by-scaleType', scaleType)
  },
}

// ─── Medications ─────────────────────────────────────────────────────────────

export const medications = {
  async create(data: Omit<Medication, 'id' | 'createdAt'>): Promise<Medication> {
    const db = await getDb()
    const record: Medication = { ...data, id: id(), createdAt: now() }
    await db.put('medications', record)
    return record
  },

  async listBySession(sessionId: string): Promise<Medication[]> {
    return (await getDb()).getAllFromIndex('medications', 'by-sessionId', sessionId)
  },

  async update(medicationId: string, patch: Partial<Omit<Medication, 'id' | 'createdAt'>>): Promise<Medication> {
    const db = await getDb()
    const existing = await db.get('medications', medicationId)
    if (!existing) throw new Error(`Medicamento não encontrado: ${medicationId}`)
    const updated: Medication = { ...existing, ...patch }
    await db.put('medications', updated)
    return updated
  },
}

// ─── Exams ───────────────────────────────────────────────────────────────────

export const exams = {
  async create(data: Omit<ExamRecord, 'id' | 'uploadedAt' | 'status'>): Promise<ExamRecord> {
    const db = await getDb()
    const record: ExamRecord = { ...data, id: id(), uploadedAt: now(), status: 'pendente' }
    await db.put('exams', record)
    return record
  },

  async get(examId: string): Promise<ExamRecord | undefined> {
    return (await getDb()).get('exams', examId)
  },

  async listBySession(sessionId: string): Promise<ExamRecord[]> {
    return (await getDb()).getAllFromIndex('exams', 'by-sessionId', sessionId)
  },

  async updateStatus(
    examId: string,
    status: ExamRecord['status'],
    extractedData?: ExamRecord['extractedData'],
    analysis?: string,
  ): Promise<ExamRecord> {
    const db = await getDb()
    const existing = await db.get('exams', examId)
    if (!existing) throw new Error(`Exame não encontrado: ${examId}`)
    const updated: ExamRecord = { ...existing, status, extractedData, analysis }
    await db.put('exams', updated)
    return updated
  },
}

// ─── Tracker ─────────────────────────────────────────────────────────────────

export const tracker = {
  async upsert(data: Omit<TrackerEntry, 'id'> & { id?: string }): Promise<TrackerEntry> {
    const db = await getDb()
    const record: TrackerEntry = { ...data, id: data.id ?? id() }
    await db.put('tracker', record)
    return record
  },

  async listByRange(fromDate: number, toDate: number): Promise<TrackerEntry[]> {
    const db = await getDb()
    const all = await db.getAllFromIndex('tracker', 'by-date', IDBKeyRange.bound(fromDate, toDate))
    return all
  },

  async getByDate(date: number): Promise<TrackerEntry | undefined> {
    const db = await getDb()
    const results = await db.getAllFromIndex('tracker', 'by-date', date)
    return results[0]
  },
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export const reports = {
  async create(data: Omit<Report, 'id' | 'generatedAt'>): Promise<Report> {
    const db = await getDb()
    const record: Report = { ...data, id: id(), generatedAt: now() }
    await db.put('reports', record)
    return record
  },

  async listBySession(sessionId: string): Promise<Report[]> {
    return (await getDb()).getAllFromIndex('reports', 'by-sessionId', sessionId)
  },

  async get(reportId: string): Promise<Report | undefined> {
    return (await getDb()).get('reports', reportId)
  },
}
