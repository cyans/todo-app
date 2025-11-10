// @CODE:UI-UX-DEPLOY-005:THEME - Theme Context and Provider
import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// Create the theme context
const ThemeContext = createContext(null);

/**
 * Custom hook to use the theme context
 * @returns {Object} Theme context value
 * @throws {Error} If used outside ThemeProvider
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Theme Provider Component
 * Manages theme state and persistence
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('light');
  const [isInitialized, setIsInitialized] = useState(false);

  // Get system preference
  const getSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Get stored theme or system preference
  const getInitialTheme = () => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored && ['light', 'dark'].includes(stored)) {
        return stored;
      }
    } catch (error) {
      console.warn('Failed to read theme from localStorage:', error);
    }
    return getSystemTheme();
  };

  // Apply theme to document
  const applyTheme = (newTheme) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;

      if (newTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  // Save theme to localStorage
  const saveTheme = (newTheme) => {
    try {
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  };

  // Set theme with side effects
  const setTheme = (newTheme) => {
    if (['light', 'dark'].includes(newTheme)) {
      setThemeState(newTheme);
      applyTheme(newTheme);
      saveTheme(newTheme);
    }
  };

  // Toggle between themes
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Initialize theme on mount
  useEffect(() => {
    const initialTheme = getInitialTheme();
    setThemeState(initialTheme);
    applyTheme(initialTheme);
    setIsInitialized(true);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (!isInitialized) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      // Only auto-change if user hasn't explicitly set a preference
      try {
        const stored = localStorage.getItem('theme');
        if (!stored) {
          const systemTheme = e.matches ? 'dark' : 'light';
          setTheme(systemTheme);
        }
      } catch (error) {
        console.warn('Failed to check localStorage for theme:', error);
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [isInitialized]);

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    systemTheme: getSystemTheme(),
    isInitialized
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default ThemeContext;