import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase/server'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  keyPrefix?: string
}

export interface ApiMiddlewareConfig {
  rateLimit?: RateLimitConfig
  auth?: 'required' | 'optional' | 'none'
  idempotency?: boolean
  cors?: boolean
  logging?: boolean
}

export interface AuthResult {
  success: boolean
  userId?: string
  error?: string
  isAnonymous?: boolean
}

export interface MiddlewareContext {
  req: NextRequest
  sessionId?: string
  userId?: string
  correlationId: string
}

// ============================================================================
// RATE LIMITING
// ============================================================================

// In-memory rate limiting store (for production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs })
    return { allowed: true, remaining: config.maxRequests - 1, resetTime: now + config.windowMs }
  }

  if (record.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }

  record.count++
  return { allowed: true, remaining: config.maxRequests - record.count, resetTime: record.resetTime }
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

export async function authenticateRequest(req: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = req.headers.get('authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return { success: false, error: 'Missing or invalid authorization header' }
    }

    const token = authHeader.substring(7)
    const supabase = getSupabase()

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return { success: false, error: 'Invalid or expired token' }
    }

    return { success: true, userId: user.id }
  } catch (error) {
    return { success: false, error: 'Authentication service unavailable' }
  }
}

// ============================================================================
// IDEMPOTENCY
// ============================================================================

const idempotencyStore = new Map<string, { expires: number; body: any }>()

export function checkIdempotency(idempotencyKey: string): { cached: boolean; body?: any } {
  if (!idempotencyKey) return { cached: false }

  const cached = idempotencyStore.get(idempotencyKey)
  if (cached && cached.expires > Date.now()) {
    return { cached: true, body: cached.body }
  }

  return { cached: false }
}

export function storeIdempotencyResponse(idempotencyKey: string, body: any, ttlMs: number = 5 * 60 * 1000): void {
  if (!idempotencyKey) return

  idempotencyStore.set(idempotencyKey, {
    expires: Date.now() + ttlMs,
    body
  })
}

// ============================================================================
// LOGGING
// ============================================================================

export function logApiActivity(
  level: 'info' | 'warn' | 'error',
  message: string,
  context: MiddlewareContext,
  metadata?: any
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    correlationId: context.correlationId,
    sessionId: context.sessionId,
    userId: context.userId,
    url: context.req.url,
    method: context.req.method,
    userAgent: context.req.headers.get('user-agent'),
    ...metadata
  }

  console[level](JSON.stringify(logEntry))
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export function createErrorResponse(
  error: string | Error,
  status: number = 500,
  correlationId?: string
): NextResponse {
  const errorMessage = error instanceof Error ? error.message : error

  return NextResponse.json(
    {
      error: errorMessage,
      correlationId,
      timestamp: new Date().toISOString()
    },
    { status }
  )
}

export function createSuccessResponse(
  data: any,
  correlationId?: string
): NextResponse {
  return NextResponse.json(
    {
      ...data,
      correlationId,
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  )
}

// ============================================================================
// MAIN MIDDLEWARE FUNCTION
// ============================================================================

export async function withApiMiddleware(
  req: NextRequest,
  config: ApiMiddlewareConfig,
  handler: (context: MiddlewareContext) => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now()
  const correlationId = Math.random().toString(36).substring(7)
  const sessionId = req.headers.get('x-intelligence-session-id') || req.cookies.get('demo-session-id')?.value
  const idempotencyKey = req.headers.get('x-idempotency-key') || undefined

  const context: MiddlewareContext = {
    req,
    sessionId,
    correlationId
  }

  try {
    // Rate limiting
    if (config.rateLimit) {
      const rateLimitKey = `${config.rateLimit.keyPrefix || 'api'}:${sessionId || req.headers.get('x-forwarded-for') || 'anonymous'}`
      const rateLimitResult = checkRateLimit(rateLimitKey, config.rateLimit)

      if (!rateLimitResult.allowed) {
        logApiActivity('warn', 'Rate limit exceeded', context, {
          key: rateLimitKey,
          maxRequests: config.rateLimit.maxRequests
        })

        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          {
            status: 429,
            headers: {
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
              'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
            }
          }
        )
      }
    }

    // Authentication
    if (config.auth && config.auth !== 'none') {
      const authResult = await authenticateRequest(req)

      if (config.auth === 'required' && !authResult.success) {
        logApiActivity('warn', 'Authentication failed', context, { error: authResult.error })
        return createErrorResponse(authResult.error || 'Authentication required', 401, correlationId)
      }

      if (authResult.success) {
        context.userId = authResult.userId
      }

      // Log authentication result
      logApiActivity('info', 'Authentication processed', context, {
        authRequired: config.auth === 'required',
        authSuccess: authResult.success,
        isAnonymous: authResult.isAnonymous
      })
    }

    // Idempotency check
    if (config.idempotency && idempotencyKey) {
      const idempotencyResult = checkIdempotency(idempotencyKey)
      if (idempotencyResult.cached) {
        logApiActivity('info', 'Idempotency cache hit', context, { idempotencyKey })
        return NextResponse.json(idempotencyResult.body)
      }
    }

    // Log request start
    logApiActivity('info', 'API request started', context, {
      idempotencyKey: idempotencyKey || undefined
    })

    // Execute handler
    const response = await handler(context)

    // Store idempotency response
    if (config.idempotency && idempotencyKey && response.status < 400) {
      try {
        const responseBody = await response.clone().json()
        storeIdempotencyResponse(idempotencyKey, responseBody)
      } catch {
        // If response is not JSON, don't store for idempotency
      }
    }

    // Log successful completion
    logApiActivity('info', 'API request completed', context, {
      status: response.status,
      duration: Date.now() - startTime
    })

    return response

  } catch (error) {
    // Log error
    logApiActivity('error', 'API request failed', context, {
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime
    })

    // Return error response
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      correlationId
    )
  }
}

// ============================================================================
// PRESET CONFIGURATIONS
// ============================================================================

export const API_CONFIGS = {
  // Public endpoints with basic rate limiting
  public: {
    rateLimit: { maxRequests: 10, windowMs: 60000 }, // 10 per minute
    auth: 'none' as const,
    logging: true
  },

  // Authenticated endpoints
  authenticated: {
    rateLimit: { maxRequests: 100, windowMs: 60000 }, // 100 per minute
    auth: 'required' as const,
    logging: true
  },

  // Optional auth (falls back to anonymous)
  optionalAuth: {
    rateLimit: { maxRequests: 50, windowMs: 60000 }, // 50 per minute
    auth: 'optional' as const,
    logging: true
  },

  // High-volume endpoints
  highVolume: {
    rateLimit: { maxRequests: 1000, windowMs: 60000 }, // 1000 per minute
    auth: 'none' as const,
    logging: true
  },

  // Critical endpoints with idempotency
  critical: {
    rateLimit: { maxRequests: 20, windowMs: 60000 }, // 20 per minute
    auth: 'required' as const,
    idempotency: true,
    logging: true
  }
} as const
