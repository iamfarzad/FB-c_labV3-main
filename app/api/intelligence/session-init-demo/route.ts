import { NextRequest, NextResponse } from 'next/server'
import { withApiGuard } from '@/lib/api/withApiGuard'
import { ContextStorage } from '@/lib/context/context-storage'
import { z } from 'zod'

const contextStorage = new ContextStorage()

const Body = z.object({})

export const POST = withApiGuard({
  schema: Body,
  requireSession: false,
  handler: async ({ req }) => {
    const sessionId = `demo-${Date.now()}`
    const demoContext = {
      email: 'demo@example.com',
      name: 'Demo User',
      company_context: {
        name: 'DemoCorp',
        summary: 'A demonstration company for testing purposes.',
        industry: 'Technology',
      },
      person_context: {
        fullName: 'Demo User',
        role: 'Tester',
      },
      intent_data: { type: 'greeting', confidence: 1.0, slots: {} },
      ai_capabilities_shown: [],
      last_user_message: 'Hello!',
    }

    await contextStorage.update(sessionId, demoContext)

    const response = NextResponse.json({ ok: true, sessionId })
    response.cookies.set('intelligence-session-id', sessionId, { path: '/', httpOnly: true, sameSite: 'lax' })
    response.cookies.set('fbc-consent', JSON.stringify({ allow: true }), { path: '/', sameSite: 'lax' })

    return response
  },
})
