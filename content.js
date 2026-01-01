/**
 * Dark Inverter - Content Script
 * Applies dark theme to web pages using CSS filters
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'darkThemeEnabled';
  const OVERRIDE_ID = 'dark-mode-override';

  // Initialize dark theme based on user preference
  chrome.storage.sync.get([STORAGE_KEY], (result) => {
    if (result[STORAGE_KEY] === false) {
      disableDarkMode();
    }
  });

  // Listen for preference changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes[STORAGE_KEY]) {
      changes[STORAGE_KEY].newValue ? enableDarkMode() : disableDarkMode();
    }
  });

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
      if (request.action === 'enable') {
        enableDarkMode();
      } else if (request.action === 'disable') {
        disableDarkMode();
      }
      sendResponse({ success: true });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
    return true; // Keep channel open for async response
  });

  /**
   * Enable dark mode by removing override style
   */
  function enableDarkMode() {
    const override = document.getElementById(OVERRIDE_ID);
    if (override) {
      override.remove();
    }
  }

  /**
   * Disable dark mode by injecting override style
   */
  function disableDarkMode() {
    if (document.getElementById(OVERRIDE_ID)) return;

    const override = document.createElement('style');
    override.id = OVERRIDE_ID;
    override.textContent = `
      html, iframe { filter: none !important; background: initial !important; }
      body { background-color: initial !important; }
      img, video, svg, canvas { filter: none !important; }
      .slds-icon, .slds-spinner, .slds-spinner_container, .oneLoading, .loading,
      [class*="loading"], [id*="loading"] { filter: none !important; }
      body, p, span, div, a { text-shadow: initial !important; }
      * { transition: initial !important; }
    `;

    (document.head || document.documentElement).appendChild(override);
  }
})();

