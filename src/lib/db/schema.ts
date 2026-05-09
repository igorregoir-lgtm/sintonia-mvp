import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type {
  ClinicalSession,
  ScaleResult,
  Medication,
  ExamRecord,
  TrackerEntry,
  Report,
} from './types'

interface SintoniaDB extends DBSchema {
  sessions: {
    key: string
    value: ClinicalSession
    indexes: { 'by-status': string; 'by-createdAt': number }
  }
  scales: {
    key: string
    value: ScaleResult
    indexes: { 'by-sessionId': string; 'by-scaleType': string }
  }
  medications: {
    key: string
    value: Medication
    indexes: { 'by-sessionId': string }
  }
  exams: {
    key: string
    value: ExamRecord
    indexes: { 'by-sessionId': string; 'by-status': string }
  }
  tracker: {
    key: string
    value: TrackerEntry
    indexes: { 'by-date': number }
  }
  reports: {
    key: string
    value: Report
    indexes: { 'by-sessionId': string }
  }
}

const DB_NAME = 'sintonia'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<SintoniaDB>> | null = null

export function getDb(): Promise<IDBPDatabase<SintoniaDB>> {
  if (!dbPromise) {
    dbPromise = openDB<SintoniaDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const sessions = db.createObjectStore('sessions', { keyPath: 'id' })
        sessions.createIndex('by-status', 'status')
        sessions.createIndex('by-createdAt', 'createdAt')

        const scales = db.createObjectStore('scales', { keyPath: 'id' })
        scales.createIndex('by-sessionId', 'sessionId')
        scales.createIndex('by-scaleType', 'scaleType')

        const medications = db.createObjectStore('medications', { keyPath: 'id' })
        medications.createIndex('by-sessionId', 'sessionId')

        const exams = db.createObjectStore('exams', { keyPath: 'id' })
        exams.createIndex('by-sessionId', 'sessionId')
        exams.createIndex('by-status', 'status')

        const tracker = db.createObjectStore('tracker', { keyPath: 'id' })
        tracker.createIndex('by-date', 'date')

        const reports = db.createObjectStore('reports', { keyPath: 'id' })
        reports.createIndex('by-sessionId', 'sessionId')
      },
    })
  }
  return dbPromise
}
