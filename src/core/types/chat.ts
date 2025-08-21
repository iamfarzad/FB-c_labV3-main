export type Role = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id?: string
  role: Role
  content: string
  meta?: Record<string, unknown>
}

export interface ChatRequest {
  version: 1
  messages: ChatMessage[]
}

export type ChunkType = 'text' | 'tool' | 'done'

export interface ChatChunk {
  id: string
  type: ChunkType
  data: unknown
}