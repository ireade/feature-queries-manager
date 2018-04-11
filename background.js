let portToPanelScript = null;

// Connect to port from panel.js
browser.runtime.onConnect.addListener((port) => {

  portToPanelScript = port;
  portToPanelScript.onMessage.addListener((request) => {

    if (!request.tabId) return;

    // Send message from panel.js to content.js
    // and return response to panel.js
    browser.tabs.sendMessage(request.tabId, request).then(portToPanelScript.postMessage);
  });
  
});

// Listen for page change
browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
  if (portToPanelScript && changeInfo.status === 'complete') {
    portToPanelScript.postMessage({ action: 'restart' });
  }
});
