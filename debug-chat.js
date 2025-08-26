// Debug script to test chat functionality
const testChatAPI = async () => {
  console.log('Testing chat API...');

  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 1,
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a test message'
          }
        ]
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        console.log('Received chunk:', chunk);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

testChatAPI();
