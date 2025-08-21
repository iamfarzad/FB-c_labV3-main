import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { getSupabase } from '@/lib/supabase/server';

const PORT = process.env.LIVE_SERVER_PORT || 3001;

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server is running\n');
});

const wss = new WebSocketServer({ server });

interface WebSocketMessage {
  type: string;
  sessionId?: string;
  data?: any;
}

const clients = new Map<string, WebSocket>();

wss.on('connection', (ws: WebSocket, req) => {
  const sessionId = new URL(req.url || '', `http://${req.headers.host}`).searchParams.get('sessionId') || `anon-${Date.now()}`;
  clients.set(sessionId, ws);

  console.log(`🔗 WebSocket client connected: ${sessionId}`);

  ws.on('message', (message: string) => {
    try {
      const data: WebSocketMessage = JSON.parse(message);
      console.log(`📨 WebSocket message from ${sessionId}:`, data.type);

      // Handle different message types
      switch (data.type) {
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;

        case 'voice_start':
          console.log(`🎤 Voice session started for ${sessionId}`);
          // Handle voice session start
          break;

        case 'voice_end':
          console.log(`🎤 Voice session ended for ${sessionId}`);
          // Handle voice session end
          break;

        case 'audio_chunk':
          // Handle audio chunk processing
          console.log(`🎵 Audio chunk received from ${sessionId}`);
          break;

        default:
          console.log(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(sessionId);
    console.log(`🔌 WebSocket client disconnected: ${sessionId}`);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for ${sessionId}:`, error);
    clients.delete(sessionId);
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    sessionId,
    timestamp: Date.now()
  }));
});

// Health check endpoint
server.on('request', (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      clients: clients.size,
      timestamp: new Date().toISOString()
    }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down WebSocket server...');
  wss.clients.forEach((client) => {
    client.terminate();
  });
  server.close(() => {
    console.log('✅ WebSocket server shut down');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down WebSocket server...');
  wss.clients.forEach((client) => {
    client.terminate();
  });
  server.close(() => {
    console.log('✅ WebSocket server shut down');
    process.exit(0);
  });
});


