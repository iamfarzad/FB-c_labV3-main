export interface TextProvider {
  generate(input: { messages: { role: string; content: string }[] }): AsyncIterable<string>
}

export function getProvider(): TextProvider {
  console.log('getProvider called, GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY)

  // Development mock when no API key
  if (!process.env.GEMINI_API_KEY) {
    console.log('Using mock provider')
    return createMockProvider()
  }

  console.log('Using Gemini provider')
  return createGeminiProvider()
}

function createMockProvider(): TextProvider {
  console.log('createMockProvider called')

  const provider: TextProvider = {
    async *generate({ messages }) {
      console.log('Mock provider generate called with messages:', messages)

      const lastMessage = messages[messages.length - 1]?.content || 'Hello'
      console.log('Last message:', lastMessage)

      // Simulate realistic streaming response
      const response = `Thank you for your message: "${lastMessage}". This is a mock response for development. I'm here to help you with your business analysis and automation strategies.`
      console.log('Mock response:', response)

      const words = response.split(' ')
      console.log(`Will yield ${words.length} words`)

      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50)) // Simulate network delay
        const word = i === 0 ? words[i] : ' ' + words[i]
        console.log(`Yielding word ${i + 1}: "${word}"`)
        yield word
      }

      console.log('Mock provider finished yielding')
    }
  }

  return provider
}

function createGeminiProvider(): TextProvider {
  return {
    async *generate({ messages }) {
      const { GoogleGenAI } = await import('@google/genai')
      
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is not set')
      }

      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
      
      // Convert messages to Gemini format
      const geminiMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))

      const response = await genAI.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: geminiMessages,
        config: {
          maxOutputTokens: 2048,
          temperature: 0.7
        }
      })

      for await (const chunk of response) {
        if (chunk.text && typeof chunk.text === 'function') {
          const text = chunk.text()
          if (text) {
            yield text
          }
        }
      }
    }
  }
}