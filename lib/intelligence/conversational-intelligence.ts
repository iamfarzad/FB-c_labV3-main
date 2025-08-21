import { GoogleGroundingProvider } from './providers/search/google-grounding'
import type { ContextSnapshot } from '@/lib/context/context-schema'
import { getContextSnapshot, updateContext } from '@/lib/context/context-manager'
import type { IntentResult, Suggestion } from '@/types/intelligence'

export class ConversationalIntelligence {
  private grounding = new GoogleGroundingProvider()

  async initSession(input: { sessionId: string; email: string; name?: string; companyUrl?: string }): Promise<ContextSnapshot | null> {
    const { sessionId, email, name, companyUrl } = input
    
    // Import services dynamically to avoid circular dependencies
    const { LeadResearchService } = await import('./lead-research')
    const { detectRole } = await import('./role-detector')
    
    const research = new LeadResearchService()
    const researchResult = await research.researchLead(email, name, companyUrl, sessionId)
    const role = await detectRole({
      company: { summary: researchResult.company?.summary, industry: researchResult.company?.industry },
      person: { role: researchResult.person?.role, seniority: researchResult.person?.seniority },
      role: researchResult.role,
    })
    await updateContext(sessionId, {
      company: researchResult.company,
      person: researchResult.person,
      role: role.role,
      roleConfidence: role.confidence,
    })
    return await getContextSnapshot(sessionId)
  }

  async researchLead(input: { sessionId: string; email: string; name?: string; companyUrl?: string }) {
    const { LeadResearchService } = await import('./lead-research')
    const research = new LeadResearchService()
    return research.researchLead(input.email, input.name, input.companyUrl, input.sessionId)
  }

  async detectRoleFromResearch(research: any) {
    const { detectRole } = await import('./role-detector')
    return detectRole(research)
  }

  async detectIntent(text: string, context: ContextSnapshot): Promise<IntentResult> {
    // Import the intent detector dynamically to avoid circular dependencies
    const { detectIntent } = await import('./intent-detector')
    return detectIntent(text)
  }

  async suggestTools(context: ContextSnapshot, intent: IntentResult, stage: string): Promise<Suggestion[]> {
    const { suggestTools } = await import('./tool-suggestion-engine')
    return suggestTools(context, intent)
  }
}


