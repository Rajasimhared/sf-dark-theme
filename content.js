// CSS is now injected via manifest.css for immediate application
// This script controls enabling/disabling the theme

// Global observer for dynamically added elements
let themeObserver = null;

// Check if dark theme is enabled and adjust accordingly
chrome.storage.sync.get(['darkThemeEnabled'], function(result) {
  const isEnabled = result.darkThemeEnabled !== false; // Default to true
  
  if (!isEnabled) {
    removeDarkTheme();
  } else {
    // Theme CSS is already applied via manifest.css
    // Just ensure it stays applied
    applyDarkTheme();
  }
  
  // Listen for toggle changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
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
  // Check if already applied
  if (document.getElementById('sf-dark-theme')) {
    return;
  }
  
  const style = document.createElement('style');
  style.id = 'sf-dark-theme';
  style.textContent = `
    /* Invert entire Salesforce UI - apply immediately */
    html {
      filter: invert(1) hue-rotate(180deg) !important;
      background: #111 !important;
    }

    /* Re-invert images, videos, and icons so they look normal */
    img,
    video,
    svg,
    canvas {
      filter: invert(1) hue-rotate(180deg) !important;
    }

    /* Fix Lightning icons */
    .slds-icon {
      filter: invert(1) hue-rotate(180deg) !important;
    }

    /* Target Salesforce loading screens and spinners */
    .slds-spinner,
    .slds-spinner_container,
    .oneLoading,
    .loading,
    [class*="loading"],
    [id*="loading"] {
      filter: invert(1) hue-rotate(180deg) !important;
    }

    /* Optional: soften harsh whites */
    body {
      background-color: #121212 !important;
    }
  `;
  
  // Inject immediately - try multiple methods for early injection
  const injectStyle = () => {
    if (!document.getElementById('sf-dark-theme')) {
      if (document.head) {
        // Insert at the beginning of head for highest priority
        document.head.insertBefore(style, document.head.firstChild);
      } else if (document.documentElement) {
        document.documentElement.appendChild(style);
      } else {
        // Last resort: insert before first script or at start of body
        const firstScript = document.getElementsByTagName('script')[0];
        if (firstScript) {
          firstScript.parentNode.insertBefore(style, firstScript);
        }
      }
    }
  };
  
  // Try to inject immediately
  if (document.head || document.documentElement) {
    injectStyle();
  }
  
  // Also inject when DOM is ready (backup)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStyle);
  }
  
  // Also try on next tick
  setTimeout(injectStyle, 0);
  
  // Watch for dynamically added elements (like loading screens) - only create once
  if (!themeObserver && document.documentElement) {
    themeObserver = new MutationObserver(function(mutations) {
      // Ensure theme style is still present
      if (!document.getElementById('sf-dark-theme')) {
        injectStyle();
      }
    });
    
    themeObserver.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }
}

function removeDarkTheme() {
  const style = document.getElementById('sf-dark-theme');
  if (style) {
    style.remove();
  }
  // Stop observing when theme is removed
  if (themeObserver) {
    themeObserver.disconnect();
    themeObserver = null;
  }
}

