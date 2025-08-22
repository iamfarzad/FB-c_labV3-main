import { NextRequest } from 'next/server'
import { handleIntelligence } from '@/src/api/intelligence/handler'
import type { IntelligenceRequest } from '@/src/api/intelligence/handler'

export async function POST(req: NextRequest) {
  try {
    const body: IntelligenceRequest = await req.json()
    const result = await handleIntelligence(body)
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Intelligence API error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error' 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'