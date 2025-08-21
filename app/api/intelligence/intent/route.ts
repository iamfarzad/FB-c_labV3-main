import { NextRequest, NextResponse } from 'next/server'
import type { ToolRunResult } from '@/types/intelligence'
import { z } from 'zod'
import { ConversationalIntelligence } from '@/lib/intelligence/conversational-intelligence'
import { ContextStorage } from '@/lib/context/context-storage'
import { withApiGuard } from '@/lib/api/withApiGuard'
import type { ContextSnapshot } from '@/lib/context/context-schema'

const contextStorage = new ContextStorage()

const Body = z.object({ sessionId: z.string().min(1), userMessage: z.string().min(1) })

export const POST = withApiGuard({
  schema: Body,
  requireSession: false,
  rateLimit: { windowMs: 5000, max: 5 },
  handler: async ({ body }) => {
    try {
      const message = String(body.userMessage)
      const intelligence = new ConversationalIntelligence()

      // Get context snapshot
      const raw = await contextStorage.get(body.sessionId)
      const context: ContextSnapshot = raw ? {
        lead: { email: raw.email, name: raw.name },
        company: raw.company_context ?? undefined,
        person: raw.person_context ?? undefined,
        role: raw.role ?? undefined,
        roleConfidence: raw.role_confidence ?? undefined,
        intent: raw.intent_data ?? undefined,
        capabilities: raw.ai_capabilities_shown || [],
      } : {
        lead: undefined,
        company: undefined,
        person: undefined,
        role: undefined,
        roleConfidence: undefined,
        intent: undefined,
        capabilities: [],
      }

      const intent = await intelligence.detectIntent(message, context)
      await contextStorage.update(body.sessionId, { intent_data: intent as any, last_user_message: message })
      // Back-compat: include top-level fields alongside ToolRunResult
      return NextResponse.json({ ok: true, output: intent, ...intent } satisfies any)
    } catch (e: any) {
      return NextResponse.json({ ok: false, error: 'server_error', details: e?.message || 'unknown' } satisfies ToolRunResult, { status: 500 })
    }
  }
})


