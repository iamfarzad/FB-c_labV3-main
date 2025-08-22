# 🚀 **Quick Start Guide - Post-Refactor**

## ✅ **All Systems Verified and Working!**

After the major refactor, all original functions are correctly connected and working. Here's how to get everything running:

## 🏃‍♂️ **Quick Start (5 minutes)**

### **1. Install Dependencies**
```bash
cd /workspace
pnpm install
```

### **2. Set Environment Variables**
```bash
# Copy the provided .env.local (already created with mock values)
# For production, update with real API keys:
# - GEMINI_API_KEY
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
```

### **3. Start All Servers**
```bash
# Option 1: Start everything at once
pnpm dev:all

# Option 2: Start separately
pnpm dev          # Next.js on port 3000
pnpm server       # WebSocket on port 3001
```

### **4. Test the Application**
```bash
# Test main chat API
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"version":1,"messages":[{"role":"user","content":"Hello"}]}'

# Test intelligence API  
curl -X POST http://localhost:3000/api/intelligence-v2 \
  -H "Content-Type: application/json" \
  -d '{"action":"analyze-message","data":{"message":"I need help"}}'

# Test WebSocket (using Node.js)
node -e "
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3001');
ws.on('open', () => {
  console.log('✅ WebSocket connected');
  ws.send(JSON.stringify({type: 'start', languageCode: 'en-US'}));
  setTimeout(() => ws.close(), 2000);
});
ws.on('message', (data) => console.log('📨', JSON.parse(data.toString())));
"
```

## 🌐 **Access Points**

- **Main App**: http://localhost:3000
- **Chat Page**: http://localhost:3000/chat  
- **WebSocket**: ws://localhost:3001

## 🔧 **Architecture Overview**

### **Clean Architecture Achieved**
```
src/                      # Business Logic (Framework-agnostic)
├── core/                 # Domain logic
├── services/            # External integrations  
└── api/                 # Pure API handlers

app/api/                 # Next.js routes (thin wrappers)
components/              # UI components
hooks/                   # React hooks
ui/hooks/               # Unified hooks
server/                 # WebSocket server
```

## ✅ **What's Working**

### **Core Features**
- ✅ **Chat System**: Real-time SSE streaming
- ✅ **Intelligence**: Intent detection, lead research
- ✅ **Voice**: WebSocket-based voice communication
- ✅ **Authentication**: Admin/public modes
- ✅ **Real-time**: Multi-user collaboration

### **Technical Features**
- ✅ **TypeScript**: Full type safety
- ✅ **Error Handling**: Graceful fallbacks
- ✅ **Mock Providers**: Development without API keys
- ✅ **Clean Architecture**: Framework-independent business logic

## 🎯 **Key Endpoints**

| Endpoint | Purpose | Status |
|----------|---------|--------|
| `POST /api/chat` | Main chat with streaming | ✅ Working |
| `POST /api/admin/chat` | Admin chat with auth | ✅ Working |
| `POST /api/intelligence-v2` | Intelligence operations | ✅ Working |
| `ws://localhost:3001` | Voice WebSocket | ✅ Working |

## 🔍 **Testing Checklist**

Run through this checklist to verify everything is working:

- [ ] Next.js starts on port 3000
- [ ] WebSocket server starts on port 3001  
- [ ] Chat API returns SSE streaming responses
- [ ] Intelligence API returns JSON responses
- [ ] WebSocket accepts connections and messages
- [ ] Frontend loads without errors
- [ ] Mock providers work without API keys

## 🚨 **Troubleshooting**

### **Port Issues**
```bash
# Kill processes on ports if needed
for p in 3000 3001 3025; do 
  PID=$(lsof -ti tcp:$p 2>/dev/null)
  [ -n "$PID" ] && kill -9 $PID || true
done
```

### **Dependencies Issues**
```bash
# Clean install
rm -rf node_modules .next
pnpm install
```

### **Environment Issues**
```bash
# Check environment variables are loaded
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

## 🎉 **Success Indicators**

You'll know everything is working when:

1. **Next.js**: Shows "Ready" message
2. **WebSocket**: Shows "Live WebSocket server running on port 3001"
3. **Chat API**: Returns streaming `data: "text"` responses
4. **Intelligence API**: Returns `{"success":true,...}` JSON
5. **WebSocket**: Accepts connections and returns session data

## 🚀 **Ready for Development!**

The refactored system is fully functional with:
- **Clean architecture** ✅
- **All original features** ✅  
- **Better maintainability** ✅
- **Full type safety** ✅
- **Easy testing** ✅

**Happy coding!** 🎉