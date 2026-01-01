/**
 * The Dark Mode - Popup Script
 * Handles user interface for toggling dark mode
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'darkThemeEnabled';
  const toggle = document.getElementById('themeToggle');
  const status = document.getElementById('status');

  if (!toggle || !status) {
    console.error('Required UI elements not found');
    return;
  }

  // Load current preference
  chrome.storage.sync.get([STORAGE_KEY], (result) => {
    const isEnabled = result[STORAGE_KEY] !== false; // Default to enabled
    toggle.checked = isEnabled;
    updateStatus(isEnabled);
  });

  // Handle toggle changes
  toggle.addEventListener('change', () => {
    const isEnabled = toggle.checked;
    
    chrome.storage.sync.set({ [STORAGE_KEY]: isEnabled }, () => {
      if (chrome.runtime.lastError) {
        console.error('Storage error:', chrome.runtime.lastError);
        return;
      }

      updateStatus(isEnabled);
      notifyTabs(isEnabled);
    });
  });

  /**
   * Update status text and color
   */
  function updateStatus(isEnabled) {
    status.textContent = isEnabled ? 'Enabled' : 'Disabled';
    status.style.color = isEnabled ? '#4CAF50' : '#666';
  }

  /**
   * Notify all tabs about the change
   */
  function notifyTabs(isEnabled) {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(
          tab.id,
          { action: isEnabled ? 'enable' : 'disable' }
        ).catch(() => {
          // Ignore errors (tab may not have content script)
        });
      });
    });
  }
})();

