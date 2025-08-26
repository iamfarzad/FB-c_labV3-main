import type { ChatRequest, ChatChunk } from '../types/chat'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Define the TextProvider interface locally to avoid import issues
interface TextProvider {
  generate(input: { messages: { role: string; content: string }[] }): AsyncIterable<string>
}

function createMockProvider(): TextProvider {
  return {
    async *generate({ messages }) {
      const lastMessage = messages[messages.length - 1]?.content || 'Hello'

      // Simulate realistic streaming response
      const response = `Thank you for your message: "${lastMessage}". This is a mock response for development. I'm here to help you with your business analysis and automation strategies.`

      const words = response.split(' ')
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50)) // Simulate network delay
        yield i === 0 ? words[i] : ' ' + words[i]
      }
    }
  }
}

export async function* chatService(req: ChatRequest): AsyncIterable<ChatChunk> {
  const useGemini = Boolean(process.env.GEMINI_API_KEY)
  const provider = useGemini ? null : createMockProvider()
  let chunkId = 0

  try {
    if (useGemini) {
      const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
      const model = client.getGenerativeModel({ model: 'gemini-2.0-flash-exp' }) as any
      const contents = req.messages.map(m => ({ role: m.role, parts: [{ text: m.content }] }))
      const stream = await model.generateContentStream({ contents })
      // Stream incremental text
      for await (const event of (stream as any).stream) {
        const text = typeof event?.text === 'function' ? event.text() : event?.text || ''
        if (!text) continue
        yield { id: String(chunkId++), type: 'text', data: text }
      }
    } else {
      for await (const text of provider!.generate({ messages: req.messages })) {
        yield { id: String(chunkId++), type: 'text', data: text }
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