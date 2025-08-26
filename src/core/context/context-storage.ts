import { createClient } from '@supabase/supabase-js'
import { MultimodalContext } from './multimodal-context'

export interface ConversationContext {
  session_id: string
  email: string
  name?: string
  company_url?: string
  company_context?: unknown
  person_context?: unknown
  role?: string
  role_confidence?: number
  intent_data?: unknown
  last_user_message?: string
  ai_capabilities_shown?: string[]
  tool_outputs?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export class ContextStorage {
  private supabase: unknown

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  async store(sessionId: string, payload: Partial<ConversationContext>): Promise<void> {
    try {
      // Prepare the data, handling multimodal context separately if needed
      const dataToStore = {
        session_id: sessionId,
        ...payload,
        updated_at: new Date().toISOString()
      }

      // If multimodal_context exists, store it as JSON string for now
      if (dataToStore.multimodal_context) {
        dataToStore.multimodal_context = JSON.stringify(dataToStore.multimodal_context)
      }

      const { error } = await this.supabase
        .from('conversation_contexts')
        .upsert(dataToStore)

      if (error) {
        // If the column doesn't exist, try without multimodal_context
        if (error.message?.includes('multimodal_context')) {
          // Warning log removed - could add proper error handling here
          const { multimodal_context, ...dataWithoutMultimodal } = dataToStore
          const { error: retryError } = await this.supabase
            .from('conversation_contexts')
            .upsert(dataWithoutMultimodal)

          if (retryError) {
            // Error: Error storing context without multimodal
            throw retryError
          }
        } else {
    console.error('Error storing context', error)
          throw error
        }
      }
    } catch (error) {
    console.error('Context storage failed', error)
      throw error
    }
  }

  async get(sessionId: string): Promise<ConversationContext | null> {
    try {
      const { data, error } = await this.supabase
        .from('conversation_contexts')
        .select('*')
        .eq('session_id', sessionId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error retrieving context', error)
        throw error
      }

      // Parse multimodal context if it exists as string
      if (data && typeof data.multimodal_context === 'string') {
        try {
          data.multimodal_context = JSON.parse(data.multimodal_context)
        } catch (parseError) {
          // Warning log removed - could add proper error handling here
          data.multimodal_context = undefined
        }
      }

      return data
    } catch (error) {
    console.error('Context retrieval failed', error)
      return null
    }
  }

  async update(sessionId: string, patch: Partial<ConversationContext>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('conversation_contexts')
        .update({
          ...patch,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)

      if (error) {
        // Error: Error updating context
        throw error
      }
    } catch (error) {
    console.error('Context update failed', error)
      throw error
    }
  }

  async delete(sessionId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('conversation_contexts')
        .delete()
        .eq('session_id', sessionId)

      if (error) {
        // Error: Error deleting context
        throw error
      }
    } catch (error) {
    console.error('Context deletion failed', error)
      throw error
    }
  }
}
