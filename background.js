// ─── MangaScroll Pro — background.js (Service Worker) ────────────────────────

// Re-inject content script when tab reloads so scroll state persists
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
    chrome.storage.local.get({ isScrolling: false }, ({ isScrolling }) => {
      if (isScrolling) {
        chrome.scripting.executeScript({
          target: { tabId },
          files: ['content.js']
        }).catch(() => {});
      }
    });
  }
});

// Forward messages between popup and content script
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action === 'statusUpdate') {
    chrome.storage.local.set({ isScrolling: msg.isScrolling });
  }
});
