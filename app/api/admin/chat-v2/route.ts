import { NextRequest } from 'next/server'
import { handleAdminChat } from '@/src/api/admin-chat/handler'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Convert Next.js headers to plain object
    const headers: Record<string, string | null> = {}
    req.headers.forEach((value, key) => {
      headers[key] = value
    })

    const result = await handleAdminChat(body, { headers })
    return result
  } catch (error) {
    console.error('Admin chat API error:', error)
    
    // Handle auth errors specifically
    if (error instanceof Error && error.message.startsWith('Unauthorized')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access' }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ 
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