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

// ─── Tipos estruturados de dados extraídos de exames (D001) ──────────────────

export interface LabResult {
  name: string
  value: string
  unit: string
  referenceRange?: string
  flag?: 'alto' | 'baixo' | 'normal'
}

export interface ExtractedLabData {
  type: 'laboratorial'
  examDate?: string
  laboratoryName?: string
  requestingDoctor?: string
  results: LabResult[]
  observations?: string
}

export interface ExtractedImageData {
  type: 'imagem'
  examDate?: string
  modality?: 'RX' | 'TC' | 'RM' | 'US' | 'PET' | 'outro'
  bodyRegion?: string
  radiologist?: string
  findings: string
  conclusion?: string
}

export interface ExtractedPolysomnographyData {
  type: 'polissonografia'
  examDate?: string
  iah?: number
  sleepEfficiency?: number
  remPercentage?: number
  findings: string
}

export interface ExtractedOtherData {
  type: 'outro'
  rawText?: string
}

export type ExtractedExamData =
  | ExtractedLabData
  | ExtractedImageData
  | ExtractedPolysomnographyData
  | ExtractedOtherData

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
  status: ExamStatus
  extractedData?: ExtractedExamData
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
