#!/bin/bash

echo "BrowserTools Chrome Extension Setup"
echo "=================================="

# Check if Chrome/Chromium is available
if command -v google-chrome &> /dev/null; then
    BROWSER="google-chrome"
    BROWSER_NAME="Google Chrome"
elif command -v chromium-browser &> /dev/null; then
    BROWSER="chromium-browser"
    BROWSER_NAME="Chromium"
elif command -v microsoft-edge &> /dev/null; then
    BROWSER="microsoft-edge"
    BROWSER_NAME="Microsoft Edge"
else
    echo "❌ No Chromium-based browser found."
    echo "Please install Chrome, Chromium, or Edge to use this extension."
    exit 1
fi

echo "✅ Found $BROWSER_NAME"

# Check if bridge server is running
if curl -s http://localhost:3025 > /dev/null 2>&1; then
    echo "✅ Bridge server is running on port 3025"
else
    echo "❌ Bridge server is not running"
    echo "Please start it with: pnpm mcp:bridge"
    exit 1
fi

# Open extensions page
echo "Opening $BROWSER_NAME extensions page..."
$BROWSER "chrome://extensions/" 2>/dev/null &

echo ""
echo "📋 Next steps:"
echo "1. Enable 'Developer mode' (toggle in top right of extensions page)"
echo "2. Click 'Load unpacked'"
echo "3. Navigate to: $(pwd)/chrome-extension"
echo "4. Select the folder to load the extension"
echo ""
echo "🎉 Extension should now be installed!"
echo "Look for the BrowserTools icon in your browser toolbar."
