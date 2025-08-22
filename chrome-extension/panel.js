let ws;
let logsContainer;

function init() {
  logsContainer = document.getElementById('logs-container');

  // Connect to WebSocket for real-time updates
  connectWebSocket();

  // Set up button handlers
  document.getElementById('clear-logs').addEventListener('click', clearLogs);
  document.getElementById('take-screenshot').addEventListener('click', takeScreenshot);

  // Check bridge connection
  checkBridgeConnection();
}

async function checkBridgeConnection() {
  try {
    const response = await fetch('http://localhost:3025/health');
    if (response.ok) {
      document.getElementById('connection-status').textContent = '✅ Connected to bridge';
      document.getElementById('connection-status').style.color = 'green';
    } else {
      throw new Error('Bridge not responding');
    }
  } catch (error) {
    document.getElementById('connection-status').textContent = '❌ Bridge not available';
    document.getElementById('connection-status').style.color = 'red';
  }
}

function connectWebSocket() {
  ws = new WebSocket('ws://localhost:3025');

  ws.onopen = () => {
    console.log('Connected to bridge WebSocket');
    addLog('info', 'Connected to BrowserTools bridge');
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handleBridgeMessage(data);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
    addLog('warning', 'Disconnected from bridge');
    // Attempt to reconnect after 5 seconds
    setTimeout(connectWebSocket, 5000);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    addLog('error', 'WebSocket connection error');
  };
}

function handleBridgeMessage(data) {
  switch (data.type) {
    case 'console_log':
      addLog('info', `Console: ${data.message}`);
      break;
    case 'error':
      addLog('error', `Error: ${data.message} at ${data.filename}:${data.lineno}`);
      break;
    case 'network_request':
      addLog('info', `Network: ${data.method} ${data.url} (${data.status}) - ${data.duration}ms`);
      break;
    default:
      addLog('info', JSON.stringify(data));
  }
}

function addLog(type, message) {
  const logEntry = document.createElement('div');
  logEntry.className = `log-entry ${type}`;
  logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  logsContainer.appendChild(logEntry);
  logsContainer.scrollTop = logsContainer.scrollHeight;
}

function clearLogs() {
  logsContainer.innerHTML = '';
}

async function takeScreenshot() {
  try {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      // Create a link to download the screenshot
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `screenshot-${Date.now()}.png`;
      link.click();
      addLog('info', 'Screenshot captured and downloaded');
    });
  } catch (error) {
    addLog('error', `Screenshot failed: ${error.message}`);
  }
}

init();
