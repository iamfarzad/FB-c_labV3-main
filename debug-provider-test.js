// Test if we can import and use the provider directly
import { getProvider } from './src/core/ai/index.ts';

async function testProvider() {
  console.log('Testing provider import...');

  try {
    const provider = getProvider();
    console.log('Provider obtained successfully:', typeof provider);

    // Test the generate method
    const messages = [{ role: 'user', content: 'Test message' }];
    console.log('Testing generate method...');

    let count = 0;
    for await (const chunk of provider.generate({ messages })) {
      count++;
      console.log(`Chunk ${count}: ${chunk}`);
      if (count > 5) break; // Limit for testing
    }

    console.log(`Total chunks: ${count}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

testProvider();
