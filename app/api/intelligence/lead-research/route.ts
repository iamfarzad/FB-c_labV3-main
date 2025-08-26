import { NextRequest, NextResponse } from 'next/server'
import { handleIntelligence } from '@/src/api/intelligence/handler'
import type { ToolRunResult } from '@/types/intelligence'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, email, name, companyUrl, provider = 'google' } = body

    if (!sessionId || !email) {
      return NextResponse.json({ ok: false, error: 'Session ID and email are required' } satisfies ToolRunResult, { status: 400 })
    }

    // Use the business logic handler
    const result = await handleIntelligence({
      action: 'research-lead',
      data: { email, name, companyUrl, sessionId, provider }
    })

    if (!result.success) {
      return NextResponse.json({ ok: false, error: 'Lead research failed' } satisfies ToolRunResult, { status: 500 })
    }

    return NextResponse.json({ ok: true, output: result.research } satisfies ToolRunResult)

  } catch (error) {
    console.error('❌ Lead research failed:', error)
    return NextResponse.json({ ok: false, error: 'Lead research failed' } satisfies ToolRunResult, { status: 500 })
  }
}
