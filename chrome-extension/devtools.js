// DevTools panel script
function createPanel() {
  chrome.devtools.panels.create(
    "BrowserTools",
    "icons/icon16.png",
    "panel.html",
    function(panel) {
      console.log("BrowserTools panel created");
    }
  );
}

createPanel();

// Listen for network events
chrome.devtools.network.onRequestFinished.addListener((request) => {
  console.log('Network request:', request.request.url);
});
