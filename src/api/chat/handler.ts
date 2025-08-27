import { chatService } from '@/core/chat/service'
import { sseFromAsyncIterable } from '@/core/stream/sse'
import { chatRequestSchema } from '@/core/validation'
import type { ChatRequest } from '@/core/types/chat'

export async function handleChat(body: unknown) {
  // Validate request using new validation schema
  const request = chatRequestSchema.parse(body)

  // Create async iterable that yields text chunks from the chat service
  async function* textChunks() {
    for await (const chunk of chatService(request)) {
      if (chunk.type === 'text') {
        const textData = String(chunk.data)
        yield textData
      } else if (chunk.type === 'tool' && chunk.data && typeof chunk.data === 'object' && 'error' in chunk.data) {
        throw new Error(String(chunk.data.error))
      }
      // Skip 'done' chunks - they're handled by the SSE helper
    }
  }

  return sseFromAsyncIterable(textChunks())
}