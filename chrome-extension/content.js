// Content script for BrowserTools
console.log('BrowserTools content script loaded');

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PAGE_LOADED') {
    console.log('Page loaded:', message.url);
    initializePageMonitoring();
  }
});

function initializePageMonitoring() {
  // Monitor console logs
  const originalConsoleLog = console.log;
  console.log = function(...args) {
    originalConsoleLog.apply(console, args);
    sendToBridge('console_log', { args: args.map(arg => JSON.stringify(arg)) });
  };

  // Monitor errors
  window.addEventListener('error', (event) => {
    sendToBridge('error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  // Monitor network requests (basic implementation)
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const startTime = Date.now();
    return originalFetch.apply(this, args).then(response => {
      sendToBridge('network_request', {
        url: args[0],
        method: args[1]?.method || 'GET',
        status: response.status,
        duration: Date.now() - startTime
      });
      return response;
    }).catch(error => {
      sendToBridge('network_error', {
        url: args[0],
        error: error.message
      });
      throw error;
    });
  };
}

async function sendToBridge(type, data) {
  try {
    await fetch('http://localhost:3025/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        timestamp: new Date().toISOString(),
        data
      })
    });
  } catch (error) {
    // Bridge might not be running, silently fail
  }
}

// Initialize immediately
initializePageMonitoring();
