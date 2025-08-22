# BrowserTools Chrome Extension

This extension enables BrowserTools functionality in Chromium-based browsers, allowing real-time monitoring of console logs, errors, network requests, and more.

## Installation

1. Open Chrome/Edge/Chromium browser
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `chrome-extension` folder from this repository
6. The extension should appear in your browser toolbar

## Features

- **Real-time Console Monitoring**: Captures and forwards console.log, console.error, etc.
- **Error Tracking**: Monitors JavaScript errors and runtime exceptions
- **Network Monitoring**: Tracks fetch requests and responses
- **DevTools Panel**: Provides a dedicated panel for viewing logs and taking screenshots
- **Screenshot Capture**: Take screenshots directly from the DevTools panel

## Usage

1. After installing, open any webpage
2. Open DevTools (F12 or right-click → Inspect)
3. Look for the "BrowserTools" tab in DevTools
4. The panel will show real-time logs and connection status
5. Use the buttons to clear logs or take screenshots

## Connection Status

- ✅ Green status: Connected to BrowserTools bridge
- ❌ Red status: Bridge server not available (check if `pnpm mcp:bridge` is running)

## Troubleshooting

- **Extension not loading**: Ensure all files are present in the chrome-extension folder
- **Bridge connection failed**: Make sure the bridge server is running on port 3025
- **No logs appearing**: Check that the content script is injected (look for console messages)
- **DevTools panel not showing**: Try refreshing the extensions page and reloading DevTools

## Development

To modify the extension:

1. Make changes to the source files
2. Go to `chrome://extensions/`
3. Click "Reload" on the BrowserTools extension
4. Refresh any open tabs to reload the content script
