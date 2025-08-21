const { spawn } = require('child_process');

console.log('🧪 Testing BrowserTools MCP Connection...');

// Test 1: Check if bridge server is responding
console.log('1. Testing bridge server connection...');
require('http').get('http://localhost:3025', (res) => {
  console.log(`   ✅ Bridge server responding (${res.statusCode})`);

  // Test 2: Check if MCP server is running
  console.log('2. Testing MCP server...');
  const mcpProcess = spawn('pnpm', ['dlx', '@agentdeskai/browser-tools-mcp@1.2.0'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, BROWSER_TOOLS_SERVER_URL: 'http://localhost:3025' }
  });

  let output = '';
  mcpProcess.stdout.on('data', (data) => {
    output += data.toString();
  });

  mcpProcess.stderr.on('data', (data) => {
    console.log('   MCP stderr:', data.toString());
  });

  mcpProcess.on('close', (code) => {
    console.log(`   MCP process exited with code ${code}`);
    console.log('   Output:', output.substring(0, 200) + '...');
  });

  // Send a simple JSON-RPC message
  setTimeout(() => {
    console.log('   Sending test message to MCP server...');
    mcpProcess.stdin.write(JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0.0" }
      }
    }) + '\n');

    setTimeout(() => {
      mcpProcess.kill();
      console.log('✅ Test completed');
    }, 3000);
  }, 1000);

}).on('error', (err) => {
  console.log('   ❌ Bridge server not responding:', err.message);
});
