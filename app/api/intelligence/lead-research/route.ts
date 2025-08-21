import { NextRequest, NextResponse } from 'next/server'
import type { ToolRunResult } from '@/types/intelligence'
import { ConversationalIntelligence } from '@/lib/intelligence/conversational-intelligence'
import { ContextStorage } from '@/lib/context/context-storage'
import { embedTexts } from '@/lib/embeddings/gemini'
import { upsertEmbeddings } from '@/lib/embeddings/query'

const conversationalIntelligence = new ConversationalIntelligence()
const contextStorage = new ContextStorage()

export async function POST(request: NextRequest) {
  try {
    const { sessionId, email, name, companyUrl, provider = 'google' } = await request.json()

    if (!sessionId || !email) return NextResponse.json({ ok: false, error: 'Session ID and email are required' } satisfies ToolRunResult, { status: 400 })

    console.info('🔍 Lead research started:', {
      sessionId,
      email,
      name,
      companyUrl,
      provider
    })

    // Perform lead research
    const researchResult = await conversationalIntelligence.researchLead({ sessionId, email, name, companyUrl })

    // Store in context
    await contextStorage.update(sessionId, {
      company_context: researchResult.company,
      person_context: researchResult.person,
      role: researchResult.role,
      role_confidence: researchResult.confidence
    })

    // Optional: store embeddings for memory when enabled
    if (process.env.EMBEDDINGS_ENABLED === 'true') {
      const texts: string[] = []
      if (researchResult.company?.summary) texts.push(String(researchResult.company.summary))
      if (researchResult.person?.summary) texts.push(String(researchResult.person.summary))
      const vectors = texts.length ? await embedTexts(texts, 1536) : []
      if (vectors.length) await upsertEmbeddings(sessionId, 'lead_research', texts, vectors)
    }

    console.info('✅ Lead research completed:', {
      company: researchResult.company,
      person: researchResult.person,
      role: researchResult.role,
      scores: { confidence: researchResult.confidence },
      citations: researchResult.citations?.length || 0
    })

    return NextResponse.json({ ok: true, output: {
      company: researchResult.company,
      person: researchResult.person,
      role: researchResult.role,
      scores: { confidence: researchResult.confidence },
      citations: researchResult.citations || []
    } } satisfies ToolRunResult)

  } catch (error) {
    console.error('❌ Lead research failed:', error)
    return NextResponse.json({ ok: false, error: 'Lead research failed' } satisfies ToolRunResult, { status: 500 })
  }
}
