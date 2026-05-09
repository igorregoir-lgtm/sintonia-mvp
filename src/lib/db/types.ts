export type SessionStatus = 'active' | 'completed' | 'archived'
export type SessionPhase = 1 | 2 | 3 | 4 | 5 | 6

export interface ConversationTurn {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface ClinicalSession {
  id: string
  createdAt: number
  updatedAt: number
  status: SessionStatus
  phase: SessionPhase
  transcript: ConversationTurn[]
  summary?: string
}

export type ScaleType = 'PHQ-9' | 'GAD-7' | 'ASRS-v1.1' | 'PCL-5' | 'ISI' | 'AUDIT' | 'CAGE' | 'outro'
export type MedicationResponse = 'positiva' | 'negativa' | 'parcial' | 'desconhecida'
export type ExamType = 'laboratorial' | 'imagem' | 'polissonografia' | 'outro'
export type ExamStatus = 'pendente' | 'processado' | 'erro'
export type ReportFormat = 'docx' | 'pdf'

export interface ScaleResult {
  id: string
  sessionId: string
  scaleType: ScaleType
  appliedAt: number
  answers: number[]
  score: number
  classification: string
  interpretation: string
}

export interface Medication {
  id: string
  sessionId?: string
  name: string
  dose: string
  frequency: string
  startDate?: number
  endDate?: number
  response: MedicationResponse
  notes: string
  createdAt: number
}

export interface ExamRecord {
  id: string
  sessionId?: string
  uploadedAt: number
  type: ExamType
  fileName: string
  fileBlob: Blob
  status: ExamStatus
  // DÍVIDA[mvp]: extractedData é any — tipar melhor quando o parser de exames estiver definido
  extractedData?: Record<string, unknown>
  analysis?: string
}

export interface TrackerEntry {
  id: string
  date: number
  mood: 1 | 2 | 3 | 4 | 5
  energy: 1 | 2 | 3 | 4 | 5
  sleepHours: number
  symptoms: string[]
  medicationsTaken: string[]
  notes: string
}

export interface Report {
  id: string
  sessionId: string
  generatedAt: number
  format: ReportFormat
  fileBlob: Blob
}
