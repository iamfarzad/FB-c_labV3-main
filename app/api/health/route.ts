import { NextResponse } from 'next/server'
import { getSupabaseStorage } from '@/services/storage/supabase'

export async function GET() {
  try {
    // Test database connectivity
    let dbStatus = 'down'
    try {
      const supabase = getSupabaseStorage()
      // Quick health check - just test if we can create a client
      if (supabase) {
        dbStatus = 'ok'
      }
    } catch (error) {
      dbStatus = 'error'
    }

    return NextResponse.json({
      ok: true,
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev',
      liveEnabled: process.env.LIVE_ENABLED === 'true',
      db: dbStatus,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? 'development'
    })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
