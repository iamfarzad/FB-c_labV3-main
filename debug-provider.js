// Debug script to test the provider directly
import { getProvider } from './src/core/ai/index.js';

const testProvider = async () => {
  console.log('Testing provider...');

  try {
    const provider = getProvider();
    console.log('Provider type:', provider.constructor.name);

    const messages = [
      {
        role: 'user',
        content: 'Hello, this is a test message'
      }
    ];

    console.log('Starting generation...');
    let chunkCount = 0;

    for await (const chunk of provider.generate({ messages })) {
      chunkCount++;
      console.log(`Chunk ${chunkCount}:`, chunk);
    }

    console.log(`Total chunks: ${chunkCount}`);
  } catch (error) {
    console.error('Provider error:', error);
  }
};

testProvider();
