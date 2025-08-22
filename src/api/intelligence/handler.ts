import { intelligenceService } from '@/src/core/intelligence'
import { sessionInitSchema } from '@/src/core/validation'
import type { ContextSnapshot } from '@/src/core/types/intelligence'

export interface IntelligenceRequest {
  action: 'init-session' | 'analyze-message' | 'research-lead'
  data: Record<string, unknown>
}

export async function handleIntelligence(body: IntelligenceRequest): Promise<any> {
  const { action, data } = body

  switch (action) {
    case 'init-session': {
      const validated = sessionInitSchema.parse(data)
      const context = await intelligenceService.initSession(validated)
      return { success: true, context }
    }

    case 'analyze-message': {
      const { message, context } = data as { message: string; context?: ContextSnapshot }
      const intent = await intelligenceService.analyzeMessage(message, context)
      return { success: true, intent }
    }

    case 'research-lead': {
      const { email, name, companyUrl } = data as { email: string; name?: string; companyUrl?: string }
      const result = await intelligenceService.researchLead(email, name, companyUrl)
      return { success: true, research: result }
    }

    default:
      throw new Error(`Unknown intelligence action: ${action}`)
  }
}