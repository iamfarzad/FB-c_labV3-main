export interface TextProvider {
  generate(input: { messages: { role: string; content: string }[] }): AsyncIterable<string>
}

export function getProvider(): TextProvider {
  // Action logged

  // Development mock when no API key
  if (!process.env.GEMINI_API_KEY) {
    // Action logged
    return createMockProvider()
  }

  // Action logged
  return createGeminiProvider()
}

function createMockProvider(): TextProvider {
  // Action logged

  const provider: TextProvider = {
    async *generate({ messages }) {
      // Action logged

      const lastMessage = messages[messages.length - 1]?.content || 'Hello'
      // Action logged

      // Simulate realistic streaming response
      const response = `Thank you for your message: "${lastMessage}". This is a mock response for development. I'm here to help you with your business analysis and automation strategies.`
      // Action logged

      const words = response.split(' ')
      // Action logged

      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50)) // Simulate network delay
        const word = i === 0 ? words[i] : ' ' + words[i]
        // Action logged
        yield word
      }

      // Action logged
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