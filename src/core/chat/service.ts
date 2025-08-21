import { getProvider } from '../ai'
import type { ChatRequest, ChatChunk } from '../types/chat'

export async function* chatService(req: ChatRequest): AsyncIterable<ChatChunk> {
  const provider = getProvider()
  let chunkId = 0
  
  try {
    for await (const text of provider.generate({ messages: req.messages })) {
      yield { 
        id: String(chunkId++), 
        type: 'text', 
        data: text 
      }
    }
    
    yield { 
      id: 'done', 
      type: 'done', 
      data: null 
    }
  } catch (error) {
    yield {
      id: 'error',
      type: 'tool',
      data: { 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }
}