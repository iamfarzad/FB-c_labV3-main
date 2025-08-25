import type { ResearchResult, CompanyContext, PersonContext } from '../types/intelligence'
import { GoogleSearchService } from '@/src/services/search/google'

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
      // Try to use real Google Search API if configured
      if (GoogleSearchService.isConfigured()) {
        console.log(`🔍 Using real Google Search API for ${email}`)
        return await this.performRealResearch(email, name, companyUrl)
      } else {
        console.log(`🔍 Google Search API not configured, using mock data for ${email}`)
        return await this.performMockResearch(email, name, companyUrl)
      }
    } catch (error) {
      console.error(`❌ Lead research failed for ${email}:`, error)
      console.log(`🔍 Falling back to mock data for ${email}`)
      return await this.performMockResearch(email, name, companyUrl)
    }
  }

  private async performRealResearch(email: string, name?: string, companyUrl?: string): Promise<ResearchResult> {
    const domain = email.split('@')[1] || ''
    const searchName = name || email.split('@')[0] || ''
    
    // Search for company information
    const companyQuery = `${domain} company information`
    const companyResults = await GoogleSearchService.search(companyQuery, { num: 5 })
    
    // Search for person information
    const personQuery = `${searchName} ${domain}`
    const personResults = await GoogleSearchService.search(personQuery, { num: 5 })
    
    // Extract company information from search results
    const companyInfo = this.extractCompanyInfo(companyResults, domain)
    const personInfo = this.extractPersonInfo(personResults, searchName, email)
    
    const result: ResearchResult = {
      company: companyInfo,
      person: personInfo,
      role: 'Professional', // Will be enhanced by role detector
      confidence: 0.8,
      citations: [
        ...companyResults.items?.map(item => item.link) || [],
        ...personResults.items?.map(item => item.link) || []
      ]
    }

    // Cache the result
    const cacheKey = `${email}-${name || ''}-${companyUrl || ''}`
    this.cache.set(cacheKey, result)
    
    console.log(`✅ Real lead research completed for ${email}`)
    return result
  }

  private async performMockResearch(email: string, name?: string, companyUrl?: string): Promise<ResearchResult> {
    const domain = email.split('@')[1] || ''
    
    const result: ResearchResult = {
      company: this.createCompanyContext(domain, companyUrl),
      person: this.createPersonContext(name || email.split('@')[0] || '', email),
      role: 'Professional', // Will be enhanced by role detector
      confidence: 0.7,
      citations: []
    }

    // Cache the result
    const cacheKey = `${email}-${name || ''}-${companyUrl || ''}`
    this.cache.set(cacheKey, result)
    
    console.log(`✅ Mock lead research completed for ${email}`)
    return result
  }

  private extractCompanyInfo(searchResults: any, domain: string): CompanyContext {
    const items = searchResults.items || []
    let summary = `Company associated with ${domain}`
    let industry = 'Technology'
    let size = 'Unknown'
    
    // Try to extract information from search results
    if (items.length > 0) {
      const firstResult = items[0]
      summary = firstResult.snippet || summary
      
      // Try to extract industry from title or snippet
      const text = `${firstResult.title} ${firstResult.snippet}`.toLowerCase()
      if (text.includes('software') || text.includes('tech')) industry = 'Technology'
      else if (text.includes('finance') || text.includes('bank')) industry = 'Finance'
      else if (text.includes('health') || text.includes('medical')) industry = 'Healthcare'
      else if (text.includes('retail') || text.includes('ecommerce')) industry = 'Retail'
    }
    
    return {
      name: domain.split('.')[0]?.replace(/[-_]/g, ' ').charAt(0).toUpperCase() + domain.split('.')[0]?.slice(1) || 'Unknown Company',
      domain,
      website: `https://${domain}`,
      summary,
      industry,
      size
    }
  }

  private extractPersonInfo(searchResults: any, name: string, email: string): PersonContext {
    const items = searchResults.items || []
    let role = 'Professional'
    
    // Try to extract role information from search results
    if (items.length > 0) {
      const text = items[0].snippet?.toLowerCase() || ''
      if (text.includes('ceo') || text.includes('founder')) role = 'Executive'
      else if (text.includes('manager') || text.includes('director')) role = 'Management'
      else if (text.includes('engineer') || text.includes('developer')) role = 'Technical'
      else if (text.includes('sales') || text.includes('marketing')) role = 'Sales/Marketing'
    }
    
    return {
      fullName: name.charAt(0).toUpperCase() + name.slice(1),
      company: email.split('@')[1] || '',
      role
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