import { NextRequest } from 'next/server'
import { handleChat } from '@/src/api/chat/handler'
import type { ChatRequest } from '@/src/core/types/chat'

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json()
    return await handleChat(body)
  } catch (error) {
    console.error('Chat API error:', error)
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
