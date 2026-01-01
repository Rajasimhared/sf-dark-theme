// Get the toggle element
const toggle = document.getElementById('themeToggle');
const status = document.getElementById('status');

// Load current state
chrome.storage.sync.get(['darkThemeEnabled'], function(result) {
  const isEnabled = result.darkThemeEnabled !== false; // Default to true
  toggle.checked = isEnabled;
  updateStatus(isEnabled);
});

// Handle toggle change
toggle.addEventListener('change', function() {
  const isEnabled = toggle.checked;
  
  chrome.storage.sync.set({ darkThemeEnabled: isEnabled }, function() {
    updateStatus(isEnabled);
    
    // Notify all tabs to update
    chrome.tabs.query({}, function(tabs) {
      tabs.forEach(function(tab) {
        chrome.tabs.sendMessage(tab.id, { 
          action: isEnabled ? 'enable' : 'disable' 
        }).catch(() => {
          // Ignore errors for tabs that don't have the content script
        });
      });
    });
  });
});

function updateStatus(isEnabled) {
  status.textContent = isEnabled ? 'Enabled' : 'Disabled';
  status.style.color = isEnabled ? '#4CAF50' : '#666';
}

