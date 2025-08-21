import { chatService } from '@/src/core/chat/service'
import { sseFromAsyncIterable } from '@/src/core/stream/sse'
import type { ChatRequest } from '@/src/core/types/chat'

export async function handleChat(body: ChatRequest) {
  // Validate request version
  if (body?.version !== 1) {
    throw new Error('Invalid request version. Expected version 1.')
  }

  // Validate messages array
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    throw new Error('Messages array is required and must not be empty.')
  }

  // Create async iterable that yields text chunks from the chat service
  async function* textChunks() {
    for await (const chunk of chatService(body)) {
      if (chunk.type === 'text') {
        yield String(chunk.data)
      } else if (chunk.type === 'tool' && chunk.data && typeof chunk.data === 'object' && 'error' in chunk.data) {
        throw new Error(String(chunk.data.error))
      }
      // Skip 'done' chunks - they're handled by the SSE helper
    }
  }

  return sseFromAsyncIterable(textChunks())
}