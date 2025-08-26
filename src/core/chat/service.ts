import type { ChatRequest, ChatChunk } from '../types/chat'

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
  const provider = createMockProvider()
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