import type { ResearchResult, CompanyContext, PersonContext } from '../types/intelligence'

export class LeadResearchService {
  private cache = new Map<string, ResearchResult>()
  private cacheTTL = 24 * 60 * 60 * 1000 // 24 hours

  async researchLead(email: string, name?: string, companyUrl?: string, sessionId?: string): Promise<ResearchResult> {
    const cacheKey = `${email}-${name || ''}-${companyUrl || ''}`
    
    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached) {
      console.log(`🎯 Using cached research for ${email}`)
      return cached
    }

    console.log(`🔍 Starting lead research for: ${email}`)

    try {
      // For now, create a simplified research result
      // In full implementation, this would call external APIs
      const domain = email.split('@')[1] || ''
      
      const result: ResearchResult = {
        company: this.createCompanyContext(domain, companyUrl),
        person: this.createPersonContext(name || email.split('@')[0] || '', email),
        role: 'Professional', // Will be enhanced by role detector
        confidence: 0.7,
        citations: []
      }

      // Cache the result
      this.cache.set(cacheKey, result)
      
      // Clean up old cache entries
      setTimeout(() => this.cleanCache(), this.cacheTTL)
      
      console.log(`✅ Lead research completed for ${email}`)
      return result

    } catch (error) {
      console.error(`❌ Lead research failed for ${email}:`, error)
      
      // Return fallback result
      return {
        company: this.createCompanyContext(email.split('@')[1] || ''),
        person: this.createPersonContext(name || email.split('@')[0] || '', email),
        role: 'Professional',
        confidence: 0.3,
        citations: []
      }
    }
  }

  private createCompanyContext(domain: string, companyUrl?: string): CompanyContext {
    // Extract company name from domain
    const companyName = domain.split('.')[0]?.replace(/[-_]/g, ' ') || 'Unknown Company'
    
    return {
      name: companyName.charAt(0).toUpperCase() + companyName.slice(1),
      domain,
      website: companyUrl || `https://${domain}`,
      summary: `Company associated with ${domain}`,
      industry: 'Technology', // Placeholder - would be enhanced with real API
      size: 'Unknown'
    }
  }

  private createPersonContext(name: string, email: string): PersonContext {
    return {
      fullName: name.charAt(0).toUpperCase() + name.slice(1),
      company: email.split('@')[1] || '',
      role: 'Professional' // Will be enhanced by role detector
    }
  }

  private cleanCache() {
    // Simple cache cleanup - in production you'd use TTL-based cleanup
    if (this.cache.size > 1000) {
      this.cache.clear()
      console.log('🧹 Lead research cache cleaned')
    }
  }

  clearCache() {
    this.cache.clear()
    console.log('🧹 Lead research cache cleared manually')
  }
}