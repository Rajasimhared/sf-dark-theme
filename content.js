// Check if dark theme is enabled
chrome.storage.sync.get(['darkThemeEnabled'], function(result) {
  const isEnabled = result.darkThemeEnabled !== false; // Default to true
  if (!isEnabled) {
    removeDarkTheme();
  }
  
  // Listen for toggle changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.darkThemeEnabled) {
      if (changes.darkThemeEnabled.newValue) {
        applyDarkTheme();
      } else {
        removeDarkTheme();
      }
    }
  });
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'enable') {
    applyDarkTheme();
  } else if (request.action === 'disable') {
    removeDarkTheme();
  }
  sendResponse({ success: true });
});

function applyDarkTheme() {
  // Remove override style to re-enable theme
  const override = document.getElementById('sf-dark-theme-override');
  if (override) {
    override.remove();
  }
}

function removeDarkTheme() {
  // Override manifest CSS to disable theme
  if (!document.getElementById('sf-dark-theme-override')) {
    const override = document.createElement('style');
    override.id = 'sf-dark-theme-override';
    override.textContent = `
      html { filter: none !important; background: initial !important; }
      body { background-color: initial !important; }
      img, video, svg, canvas { filter: none !important; }
      .slds-icon { filter: none !important; }
      .slds-spinner, .slds-spinner_container, .oneLoading, .loading,
      [class*="loading"], [id*="loading"] { filter: none !important; }
      body, p, span, div, a { text-shadow: initial !important; }
      * { transition: initial !important; }
    `;
    (document.head || document.documentElement).appendChild(override);
  }
}

