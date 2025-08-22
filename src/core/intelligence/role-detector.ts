import type { RoleDetectionResult, CompanyContext, PersonContext } from '../types/intelligence'

export interface ResearchResultLike {
  company?: { summary?: string; industry?: string }
  person?: { fullName?: string; role?: string; seniority?: string }
  role?: string
}

export function detectRoleFromText(text: string): RoleDetectionResult {
  // Simple regex-based role detection
  const roleMatch = text.match(/\b(ceo|cto|cfo|founder|director|manager|lead|head|vp|vice president)\b/i)
  return {
    role: roleMatch ? normalizeRole(roleMatch[1]) : 'Unknown',
    confidence: roleMatch ? 0.6 : 0.2
  }
}

export async function detectRole(research: ResearchResultLike): Promise<{ role: string; confidence: number }> {
  // Priority: explicit role > person role > text analysis
  if (research.role) {
    return { role: normalizeRole(research.role), confidence: 0.9 }
  }
  
  if (research.person?.role) {
    return { role: normalizeRole(research.person.role), confidence: 0.8 }
  }
  
  // Fallback to text analysis of company summary
  if (research.company?.summary) {
    return detectRoleFromText(research.company.summary)
  }
  
  return { role: 'Professional', confidence: 0.3 }
}

function normalizeRole(input: string): string {
  const role = input.toLowerCase().trim()
  
  // Role normalization mapping
  const roleMap: Record<string, string> = {
    'ceo': 'CEO',
    'chief executive officer': 'CEO',
    'cto': 'CTO', 
    'chief technology officer': 'CTO',
    'cfo': 'CFO',
    'chief financial officer': 'CFO',
    'founder': 'Founder',
    'co-founder': 'Co-Founder',
    'director': 'Director',
    'manager': 'Manager',
    'lead': 'Lead',
    'head': 'Head',
    'vp': 'VP',
    'vice president': 'VP'
  }
  
  return roleMap[role] || input.charAt(0).toUpperCase() + input.slice(1)
}