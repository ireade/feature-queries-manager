let portToPanelScript = null;

browser.runtime.onConnect.addListener((port) => {
  portToPanelScript = port;
  portToPanelScript.onMessage.addListener((request) => {

    if (!request.tabId) return;

    // Send message from panel.js -> content.js
    // and return response from content.js -> panel.js
    browser.tabs.sendMessage(request.tabId, request)
      .then((res) => portToPanelScript.postMessage(res));
  });
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
  if (portToPanelScript && changeInfo.status === 'complete') {
    portToPanelScript.postMessage({ action: 'restart' });
  }
});
