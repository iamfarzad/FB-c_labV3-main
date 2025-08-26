// Test the SSE helper directly
import { sseFromAsyncIterable } from './src/core/stream/sse.js';

async function testSSE() {
  console.log('Testing SSE helper...');

  // Create a simple async generator that yields some text
  async function* simpleGenerator() {
    console.log('Generator started');
    yield 'Hello';
    yield ' ';
    yield 'world';
    console.log('Generator finished');
  }

  console.log('Creating SSE response...');
  const response = sseFromAsyncIterable(simpleGenerator());
  console.log('SSE response created');

  // Read the response
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  console.log('Reading SSE response...');
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    console.log('SSE chunk:', chunk);
  }

  console.log('SSE test completed');
}

testSSE().catch(console.error);
