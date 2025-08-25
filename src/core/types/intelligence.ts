// Core intelligence types - consolidated from multiple files
export type Stage = 'GREETING' | 'NAME_COLLECTION' | 'EMAIL_CAPTURE' | 'BACKGROUND_RESEARCH' | 'PROBLEM_DISCOVERY' | 'SOLUTION_PRESENTATION' | 'CALL_TO_ACTION'

export interface CompanyContext {
  name: string
  domain: string
  industry?: string
  size?: string
  summary?: string
  website?: string
  linkedin?: string
}

export interface PersonContext {
  fullName: string
  role?: string
  seniority?: string
  profileUrl?: string
  company?: string
}

export interface ContextSnapshot {
  lead: { email: string; name: string }
  capabilities: string[]
  role?: string
  roleConfidence?: number
  company?: CompanyContext
  person?: PersonContext
  intent?: IntentResult
}

export interface IntentResult {
  type: 'consulting' | 'workshop' | 'other'
  confidence: number
  slots: Record<string, any>
}

export interface Suggestion {
  id: string
  label: string
  capability: string
  description?: string
  priority?: number
}

export interface RoleDetectionResult {
  role: string
  confidence: number
}

export interface ResearchResult {
  company: CompanyContext
  person: PersonContext
  role: string
  confidence: number
  citations?: Array<{
    uri: string
    title?: string
    description?: string
  }>
}