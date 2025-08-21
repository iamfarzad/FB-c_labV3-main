import { z } from 'zod'

// ============================================================================
// ENVIRONMENT SCHEMA & VALIDATION
// ============================================================================

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // AI Providers
  GEMINI_API_KEY: z.string().optional(),
  VITE_GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  // Email
  RESEND_API_KEY: z.string().optional(),
  RESEND_WEBHOOK_SECRET: z.string().optional(),

  // Application
  BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Intelligence Features
  URL_CONTEXT_ENABLED: z.string().transform(val => val === 'true').default('false'),
  URL_CONTEXT_MAX_URLS: z.string().transform(Number).default('10'),
  URL_CONTEXT_ALLOWED_DOMAINS: z.string().optional(),
  URL_CONTEXT_TIMEOUT_MS: z.string().transform(Number).default('8000'),
  URL_CONTEXT_MAX_BYTES: z.string().transform(Number).default('5000000'),

  PROVIDER_TIMEOUT_MS: z.string().transform(Number).default('30000'),
  EMBED_DIM: z.string().transform(Number).default('768'),
  LIVE_ENABLED: z.string().transform(val => val === 'true').default('false'),
  GEMINI_GROUNDING_ENABLED: z.string().transform(val => val === 'true').default('false'),

  // Development & Testing
  FBC_USE_MOCKS: z.string().optional(),
  NEXT_PUBLIC_USE_MOCKS: z.string().optional(),
})

type EnvVars = z.infer<typeof envSchema>

// Parse and validate environment variables
function parseEnv(): EnvVars {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    console.error('❌ Environment validation failed:', error)
    throw new Error(`Invalid environment configuration: ${error}`)
  }
}

const env = parseEnv()

// ============================================================================
// CONFIGURATION OBJECT
// ============================================================================

export const config = {
  // Supabase Configuration
  supabase: {
    url: env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // AI Provider Configuration
  ai: {
    gemini: {
      apiKey: env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY,
      model: "gemini-2.5-flash",
      models: {
        default: "gemini-2.5-flash",          // Current cost-effective model
        fastResponse: "gemini-2.5-flash-lite", // For latency-sensitive operations
        analysis: "gemini-1.5-flash",         // For image analysis
        research: "gemini-2.5-flash",         // For deep research tasks
      }
    },
    openai: {
      apiKey: env.OPENAI_API_KEY,
      model: "gpt-4",
    },
  },

  // Email Configuration
  email: {
    resend: {
      apiKey: env.RESEND_API_KEY,
      webhookSecret: env.RESEND_WEBHOOK_SECRET,
    },
  },

  // Application Configuration
  app: {
    baseUrl: env.BASE_URL || env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    environment: env.NODE_ENV,
  },

  // Intelligence Configuration (previously in separate file)
  intelligence: {
    urlContext: {
      enabled: env.URL_CONTEXT_ENABLED,
      maxUrls: env.URL_CONTEXT_MAX_URLS,
      allowedDomains: env.URL_CONTEXT_ALLOWED_DOMAINS?.split(',').map(d => d.trim()).filter(Boolean) || [],
      timeoutMs: env.URL_CONTEXT_TIMEOUT_MS,
      maxBytes: env.URL_CONTEXT_MAX_BYTES,
    },
    providerTimeout: env.PROVIDER_TIMEOUT_MS,
    embedDimension: env.EMBED_DIM,
    liveEnabled: env.LIVE_ENABLED,
    groundingEnabled: env.GEMINI_GROUNDING_ENABLED,
  },

  // Development & Testing
  mocks: {
    enabled: isMockEnabled(),
  }
} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Helper to check if we're in development
export const isDevelopment = config.app.environment === "development"
export const isProduction = config.app.environment === "production"
export const isTest = config.app.environment === "test"

// Mock control (previously in separate file)
export function isMockEnabled(): boolean {
  const v = (env.FBC_USE_MOCKS || env.NEXT_PUBLIC_USE_MOCKS || '').toString().trim().toLowerCase()
  return v === '1' || v === 'true' || v === 'yes'
}

// Configuration validation
export function validateConfig(): void {
  const errors: string[] = []

  // Required configurations
  if (!config.supabase.url) {
    errors.push("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL")
  }

  if (!config.supabase.anonKey) {
    errors.push("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY")
  }

  if (!config.ai.gemini.apiKey) {
    errors.push("Missing GEMINI_API_KEY or VITE_GEMINI_API_KEY")
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join("\n")}`)
  }
}

// Development warning for missing variables
export function checkDevelopmentConfig(): void {
  if (isDevelopment) {
    const missingVars: string[] = []

    if (!config.supabase.url) missingVars.push("NEXT_PUBLIC_SUPABASE_URL")
    if (!config.supabase.anonKey) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    if (!config.supabase.serviceRoleKey) missingVars.push("SUPABASE_SERVICE_ROLE_KEY")

    if (missingVars.length > 0) {
      console.warn(`⚠️ Supabase environment variables missing for full test execution: ${missingVars.join(", ")}`)
    }
  }
}

// Environment-specific configurations
export const envConfig = {
  development: {
    enableDebugLogging: true,
    strictMode: false,
    mockData: true,
  },
  production: {
    enableDebugLogging: false,
    strictMode: true,
    mockData: false,
  },
  test: {
    enableDebugLogging: false,
    strictMode: false,
    mockData: true,
  }
} as const

export const currentEnvConfig = envConfig[config.app.environment]

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Config = typeof config
export type AppEnvironment = 'development' | 'production' | 'test'
export type AIProvider = keyof typeof config.ai
