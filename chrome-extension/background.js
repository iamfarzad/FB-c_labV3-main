chrome.runtime.onInstalled.addListener(() => {
  console.log('BrowserTools Extension installed');
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.tabs.sendMessage(tabId, {
      type: 'PAGE_LOADED',
      url: tab.url
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BRIDGE_CONNECT') {
    // Connect to the bridge server
    connectToBridge().then(sendResponse);
    return true;
  }
});

async function connectToBridge() {
  try {
    const response = await fetch('http://localhost:3025/health');
    if (response.ok) {
      return { success: true, message: 'Connected to bridge' };
    }
  } catch (error) {
    return { success: false, message: 'Bridge not available' };
  }
}
