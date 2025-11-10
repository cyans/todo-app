// @CODE:TAG-UX-ACCESSIBILITY-001
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

// Accessibility context
const AccessibilityContext = createContext();

// Default accessibility preferences
const DEFAULT_PREFERENCES = {
  highContrast: false,
  reducedMotion: false,
  largeText: false,
  screenReader: false,
  keyboardNavigation: true,
  focusVisible: true,
  announceChanges: true,
};

// Custom hook to use accessibility
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

// AccessibilityProvider component
export const AccessibilityProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [skipLinks, setSkipLinks] = useState([]);
  const [shortcuts, setShortcuts] = useState(new Map());
  const [focusTrap, setFocusTrap] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  const announcementRef = useRef(null);
  const focusElementRef = useRef(null);

  // Load preferences from localStorage and detect system preferences
  useEffect(() => {
    const loadPreferences = () => {
      try {
        // Load saved preferences
        const saved = localStorage.getItem('accessibility-preferences');
        if (saved) {
          const parsedPreferences = JSON.parse(saved);
          setPreferences(prev => ({ ...prev, ...parsedPreferences }));
        }

        // Detect system preferences
        const systemPreferences = {
          reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          highContrast: window.matchMedia('(prefers-contrast: high)').matches,
          darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
        };

        setPreferences(prev => ({ ...prev, ...systemPreferences }));
      } catch (error) {
        console.warn('Failed to load accessibility preferences:', error);
      }
    };

    loadPreferences();
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback((newPreferences) => {
    try {
      localStorage.setItem('accessibility-preferences', JSON.stringify(newPreferences));
    } catch (error) {
      console.warn('Failed to save accessibility preferences:', error);
    }
  }, []);

  // Update preferences
  const updatePreferences = useCallback((updates) => {
    setPreferences(prev => {
      const newPreferences = { ...prev, ...updates };
      savePreferences(newPreferences);

      // Apply preferences to document
      document.documentElement.className = document.documentElement.className
        .replace(/accessibility-\w+/g, '');

      Object.entries(newPreferences).forEach(([key, value]) => {
        if (value) {
          document.documentElement.classList.add(`accessibility-${key}`);
        }
      });

      return newPreferences;
    });
  }, [savePreferences]);

  // Announce to screen readers
  const announceToScreenReader = useCallback((message, priority = 'polite') => {
    const announcement = {
      id: Date.now(),
      message,
      priority,
      timestamp: new Date().toISOString(),
    };

    setAnnouncements(prev => [...prev, announcement]);

    // Clean up old announcements
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
    }, 1000);
  }, []);

  // Set focus to element
  const setFocus = useCallback((elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      announceToScreenReader(`Focus moved to ${element.textContent || element.id}`);
    }
  }, [announceToScreenReader]);

  // Set focus to element reference
  const setFocusElement = useCallback((element) => {
    if (element && element.focus) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      announceToScreenReader(`Focus moved to ${element.textContent || 'element'}`);
    }
  }, [announceToScreenReader]);

  // Register skip link
  const registerSkipLink = useCallback((targetId, label) => {
    const skipLink = {
      id: `skip-${targetId}`,
      targetId,
      label,
    };
    setSkipLinks(prev => [...prev, skipLink]);
  }, []);

  // Register keyboard shortcut
  const registerShortcut = useCallback((keys, handler, description) => {
    const shortcut = {
      keys: Array.isArray(keys) ? keys : [keys],
      handler,
      description,
      id: Date.now(),
    };

    setShortcuts(prev => new Map(prev).set(shortcut.id, shortcut));

    // Return cleanup function
    return () => {
      setShortcuts(prev => {
        const newMap = new Map(prev);
        newMap.delete(shortcut.id);
        return newMap;
      });
    };
  }, []);

  // Trap focus within container
  const trapFocus = useCallback((containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }

      if (e.key === 'Escape') {
        releaseFocus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement.focus();

    setFocusTrap({
      containerId,
      handleKeyDown,
      firstElement,
      lastElement,
    });

    announceToScreenReader('Focus trapped within dialog');
  }, [announceToScreenReader]);

  // Release focus trap
  const releaseFocus = useCallback(() => {
    if (focusTrap) {
      const { container, handleKeyDown } = focusTrap;
      container?.removeEventListener('keydown', handleKeyDown);
      setFocusTrap(null);
      announceToScreenReader('Focus trap released');
    }
  }, [focusTrap, announceToScreenReader]);

  // Validate accessibility
  const validateAccessibility = useCallback(() => {
    const issues = [];

    // Check for missing alt text on images
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      issues.push({
        type: 'missing-alt',
        count: images.length,
        message: `${images.length} images missing alt text`,
      });
    }

    // Check for missing labels on form elements
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    const unlabeledInputs = Array.from(inputs).filter(input =>
      !input.labels || input.labels.length === 0
    );
    if (unlabeledInputs.length > 0) {
      issues.push({
        type: 'missing-label',
        count: unlabeledInputs.length,
        message: `${unlabeledInputs.length} form elements missing labels`,
      });
    }

    // Check for proper heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const hasH1 = Array.from(headings).some(h => h.tagName === 'H1');
    if (!hasH1) {
      issues.push({
        type: 'missing-h1',
        message: 'Page missing H1 heading',
      });
    }

    // Check for proper ARIA attributes
    const elementsWithAria = document.querySelectorAll('[aria-*]');
    const invalidAria = Array.from(elementsWithAria).filter(element => {
      // Check for common ARIA issues
      return element.hasAttribute('aria-label') && !element.textContent.trim();
    });

    if (invalidAria.length > 0) {
      issues.push({
        type: 'invalid-aria',
        count: invalidAria.length,
        message: `${invalidAria.length} elements with invalid ARIA attributes`,
      });
    }

    return issues;
  }, []);

  // Setup keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Skip if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Check registered shortcuts
      shortcuts.forEach(shortcut => {
        const keysMatch = shortcut.keys.some(key => {
          if (typeof key === 'string') {
            return key === e.key;
          }
          if (typeof key === 'object') {
            return key.key === e.key && key.ctrl === e.ctrlKey &&
                   key.alt === e.altKey && key.shift === e.shiftKey;
          }
          return false;
        });

        if (keysMatch) {
          e.preventDefault();
          shortcut.handler(e);
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  // Setup system preference listeners
  useEffect(() => {
    const mediaQueries = [
      { query: '(prefers-reduced-motion: reduce)', preference: 'reducedMotion' },
      { query: '(prefers-contrast: high)', preference: 'highContrast' },
      { query: '(prefers-color-scheme: dark)', preference: 'darkMode' },
    ];

    const handlers = mediaQueries.map(({ query, preference }) => {
      const mediaQuery = window.matchMedia(query);

      const handleChange = (e) => {
        updatePreferences({ [preference]: e.matches });
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else {
        mediaQuery.addListener(handleChange);
      }

      return { mediaQuery, handleChange };
    });

    return () => {
      handlers.forEach(({ mediaQuery, handleChange }) => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleChange);
        } else {
          mediaQuery.removeListener(handleChange);
        }
      });
    };
  }, [updatePreferences]);

  // Apply preferences to document on mount and changes
  useEffect(() => {
    Object.entries(preferences).forEach(([key, value]) => {
      if (value) {
        document.documentElement.classList.add(`accessibility-${key}`);
      } else {
        document.documentElement.classList.remove(`accessibility-${key}`);
      }
    });
  }, [preferences]);

  const value = {
    // State
    preferences,
    skipLinks,
    shortcuts,
    focusTrap,
    announcements,

    // Methods
    updatePreferences,
    announceToScreenReader,
    setFocus,
    setFocusElement,
    registerSkipLink,
    registerShortcut,
    trapFocus,
    releaseFocus,
    validateAccessibility,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {/* Screen reader announcements */}
      <div
        ref={announcementRef}
        aria-live="polite"
        aria-atomic="true"
        className="screen-reader-only"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {announcements.map(announcement => (
          <div key={announcement.id}>
            {announcement.message}
          </div>
        ))}
      </div>

      {/* Skip links */}
      {skipLinks.map(skipLink => (
        <a
          key={skipLink.id}
          href={`#${skipLink.targetId}`}
          className="skip-link"
          style={{
            position: 'absolute',
            top: '-40px',
            left: '6px',
            background: 'var(--color-primary, #000)',
            color: 'white',
            padding: '8px',
            textDecoration: 'none',
            borderRadius: '4px',
            zIndex: 10000,
            transition: 'top 0.3s',
          }}
          onFocus={(e) => {
            e.target.style.top = '6px';
          }}
          onBlur={(e) => {
            e.target.style.top = '-40px';
          }}
        >
          {skipLink.label}
        </a>
      ))}

      {children}
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityProvider;