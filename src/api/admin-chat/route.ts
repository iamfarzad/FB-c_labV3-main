import { NextRequest } from 'next/server'
import { handleAdminChat } from './handler'
import type { ChatRequest } from '@/src/core/types/chat'

// Simple auth check - in production you'd use proper middleware
async function checkAdminAuth(req: NextRequest): Promise<{ authorized: boolean; userId?: string }> {
  // For now, just check for a basic auth header or session
  // This should be replaced with your actual auth logic
  const authHeader = req.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false }
  }

  // In production, validate the token properly
  // For demo purposes, accept any Bearer token
  return { authorized: true, userId: 'admin-user' }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const auth = await checkAdminAuth(req)
    if (!auth.authorized) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access' }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const body: ChatRequest = await req.json()
    return await handleAdminChat(body, { userId: auth.userId })
  } catch (error) {
    console.error('Admin chat API error:', error)
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