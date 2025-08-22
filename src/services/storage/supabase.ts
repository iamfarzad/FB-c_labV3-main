import { createClient } from '@supabase/supabase-js'

export interface StorageConfig {
  url: string
  anonKey: string
  serviceRoleKey?: string
}

export interface StorageResult<T = any> {
  data: T | null
  error: Error | null
}

export class SupabaseStorage {
  private client: any
  private serviceClient: any

  constructor(config: StorageConfig) {
    // Create regular client
    this.client = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })

    // Create service role client if available
    if (config.serviceRoleKey) {
      this.serviceClient = createClient(config.url, config.serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    }
  }

  static isConfigured(): boolean {
    return !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }

  static createFromEnv(): SupabaseStorage {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !anonKey) {
      throw new Error('Missing required Supabase environment variables')
    }

    return new SupabaseStorage({ url, anonKey, serviceRoleKey })
  }

  // Basic CRUD operations
  async select(table: string, options?: { 
    columns?: string
    filter?: Record<string, any>
    limit?: number
    orderBy?: { column: string; ascending?: boolean }
  }): Promise<StorageResult> {
    try {
      let query = this.client.from(table).select(options?.columns || '*')
      
      if (options?.filter) {
        for (const [key, value] of Object.entries(options.filter)) {
          query = query.eq(key, value)
        }
      }
      
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true })
      }
      
      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const result = await query
      return { data: result.data, error: result.error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async insert(table: string, data: any): Promise<StorageResult> {
    try {
      const result = await this.client.from(table).insert(data).select()
      return { data: result.data, error: result.error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async update(table: string, data: any, filter: Record<string, any>): Promise<StorageResult> {
    try {
      let query = this.client.from(table).update(data)
      
      for (const [key, value] of Object.entries(filter)) {
        query = query.eq(key, value)
      }

      const result = await query.select()
      return { data: result.data, error: result.error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  async delete(table: string, filter: Record<string, any>): Promise<StorageResult> {
    try {
      let query = this.client.from(table).delete()
      
      for (const [key, value] of Object.entries(filter)) {
        query = query.eq(key, value)
      }

      const result = await query
      return { data: result.data, error: result.error }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Service role operations (admin only)
  getServiceClient() {
    if (!this.serviceClient) {
      throw new Error('Service role client not available - missing SUPABASE_SERVICE_ROLE_KEY')
    }
    return this.serviceClient
  }
}

// Create and export default instance
let defaultInstance: SupabaseStorage | null = null

export function getSupabaseStorage(): SupabaseStorage {
  if (!defaultInstance) {
    if (!SupabaseStorage.isConfigured()) {
      throw new Error('Supabase not configured - missing environment variables')
    }
    defaultInstance = SupabaseStorage.createFromEnv()
  }
  return defaultInstance
}

function createMockClient() {
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: new Error('Mock client') }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: new Error('Mock client') }),
      signOut: () => Promise.resolve({ error: null })
    },
    from: (table: string) => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: new Error('Mock client') }),
      update: () => ({ data: null, error: new Error('Mock client') }),
      delete: () => ({ data: null, error: new Error('Mock client') }),
      eq: function(column: string, value: any) { return this },
      order: function(column: string, options?: any) { return this },
      limit: function(count: number) { return this }
    })
  }
}

// Create and export instances
const config = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
}

export const supabaseStorage = new SupabaseStorage(config)

// Legacy exports for compatibility
export const getSupabase = () => supabaseStorage.client
export const supabaseService = supabaseStorage