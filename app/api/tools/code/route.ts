import { NextRequest, NextResponse } from 'next/server'
import { recordCapabilityUsed } from '@/lib/context/capabilities'
import { withApiMiddleware, API_CONFIGS, type MiddlewareContext } from '@/lib/api-middleware'

// Code generation handler with middleware
async function handleCodeGeneration(context: MiddlewareContext): Promise<NextResponse> {
  const { req, sessionId } = context

  try {
    const body = await req.json().catch(() => ({}))
    const { spec } = body || {}

    const blueprint = typeof spec === 'string' && spec.trim().length > 0
      ? spec.trim().slice(0, 8000)
      : 'No spec provided. This is a placeholder output for code/blueprint generation.'

    const response = { ok: true, output: blueprint }

    if (sessionId) {
      try { await recordCapabilityUsed(String(sessionId), 'code', { size: blueprint.length }) } catch {}
    }

    return NextResponse.json(response)
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Unknown error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  // Use high-volume config since code generation can be resource intensive
  return withApiMiddleware(req, {
    rateLimit: { maxRequests: 10, windowMs: 60000, keyPrefix: 'code' },
    auth: 'none',
    idempotency: true, // Enable idempotency for code generation
    logging: true
  }, handleCodeGeneration)
}


