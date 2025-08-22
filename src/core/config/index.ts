// Centralized configuration management - framework agnostic
export interface AppConfig {
  supabase: {
    url?: string
    anonKey?: string
    serviceRoleKey?: string
  }
  ai: {
    gemini: {
      apiKey?: string
      model: string
      models: {
        default: string
        fastResponse: string
        analysis: string
        research: string
      }
    }
    openai: {
      apiKey?: string
      model: string
    }
  }
  email: {
    resend: {
      apiKey?: string
      webhookSecret?: string
    }
  }
  search: {
    google: {
      apiKey?: string
      engineId?: string
    }
  }
  app: {
    baseUrl: string
    environment: string
  }
}

export const config: AppConfig = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  ai: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY,
      model: "gemini-2.5-flash",
      models: {
        default: "gemini-2.5-flash",
        fastResponse: "gemini-2.5-flash-lite",
        analysis: "gemini-1.5-flash",
        research: "gemini-2.5-flash",
      }
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4",
    },
  },
  email: {
    resend: {
      apiKey: process.env.RESEND_API_KEY,
      webhookSecret: process.env.RESEND_WEBHOOK_SECRET,
    },
  },
  search: {
    google: {
      apiKey: process.env.GOOGLE_SEARCH_API_KEY,
      engineId: process.env.GOOGLE_SEARCH_ENGINE_ID,
    },
  },
  app: {
    baseUrl: process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    environment: process.env.NODE_ENV || "development",
  },
} as const

// Validation functions
export function validateConfig(): string[] {
  const errors: string[] = []

  if (!config.supabase.url) {
    errors.push('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL')
  }
  
  if (!config.supabase.anonKey) {
    errors.push('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY')
  }

  return errors
}

export function isProduction(): boolean {
  return config.app.environment === 'production'
}

export function isDevelopment(): boolean {
  return config.app.environment === 'development'
}

export function isConfigured(service: keyof AppConfig): boolean {
  switch (service) {
    case 'supabase':
      return !!(config.supabase.url && config.supabase.anonKey)
    case 'ai':
      return !!(config.ai.gemini.apiKey || config.ai.openai.apiKey)
    case 'email':
      return !!config.email.resend.apiKey
    case 'search':
      return !!(config.search.google.apiKey && config.search.google.engineId)
    default:
      return false
  }
}