// @CODE:TAG-THEME-SYSTEM-001
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define theme configurations
const THEMES = {
  light: {
    name: 'light',
    displayName: 'Light',
    colors: {
      primary: '#3b82f6',
      'primary-hover': '#2563eb',
      'primary-light': '#dbeafe',
      secondary: '#6b7280',
      'secondary-hover': '#4b5563',
      background: '#ffffff',
      'background-secondary': '#f9fafb',
      'background-tertiary': '#f3f4f6',
      text: '#111827',
      'text-secondary': '#6b7280',
      'text-tertiary': '#9ca3af',
      border: '#e5e7eb',
      'border-hover': '#d1d5db',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      surface: '#ffffff',
      'surface-hover': '#f9fafb',
      shadow: 'rgba(0, 0, 0, 0.1)',
      'shadow-hover': 'rgba(0, 0, 0, 0.15)',
    },
  },
  dark: {
    name: 'dark',
    displayName: 'Dark',
    colors: {
      primary: '#60a5fa',
      'primary-hover': '#3b82f6',
      'primary-light': '#1e3a8a',
      secondary: '#9ca3af',
      'secondary-hover': '#6b7280',
      background: '#111827',
      'background-secondary': '#1f2937',
      'background-tertiary': '#374151',
      text: '#f9fafb',
      'text-secondary': '#d1d5db',
      'text-tertiary': '#9ca3af',
      border: '#374151',
      'border-hover': '#4b5563',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
      surface: '#1f2937',
      'surface-hover': '#374151',
      shadow: 'rgba(0, 0, 0, 0.3)',
      'shadow-hover': 'rgba(0, 0, 0, 0.4)',
    },
  },
  'high-contrast': {
    name: 'high-contrast',
    displayName: 'High Contrast',
    colors: {
      primary: '#0000ff',
      'primary-hover': '#0000cc',
      'primary-light': '#e6e6ff',
      secondary: '#666666',
      'secondary-hover': '#333333',
      background: '#ffffff',
      'background-secondary': '#f0f0f0',
      'background-tertiary': '#e0e0e0',
      text: '#000000',
      'text-secondary': '#333333',
      'text-tertiary': '#666666',
      border: '#000000',
      'border-hover': '#333333',
      success: '#008000',
      warning: '#ff8c00',
      error: '#ff0000',
      info: '#0000ff',
      surface: '#ffffff',
      'surface-hover': '#f0f0f0',
      shadow: 'rgba(0, 0, 0, 0.5)',
      'shadow-hover': 'rgba(0, 0, 0, 0.7)',
    },
  },
  'custom-blue': {
    name: 'custom-blue',
    displayName: 'Ocean Blue',
    colors: {
      primary: '#0ea5e9',
      'primary-hover': '#0284c7',
      'primary-light': '#e0f2fe',
      secondary: '#64748b',
      'secondary-hover': '#475569',
      background: '#f0f9ff',
      'background-secondary': '#e0f2fe',
      'background-tertiary': '#bae6fd',
      text: '#0c4a6e',
      'text-secondary': '#075985',
      'text-tertiary': '#0369a1',
      border: '#7dd3fc',
      'border-hover': '#38bdf8',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#0ea5e9',
      surface: '#ffffff',
      'surface-hover': '#f0f9ff',
      shadow: 'rgba(14, 165, 233, 0.15)',
      'shadow-hover': 'rgba(14, 165, 233, 0.25)',
    },
  },
};

// Theme context
const ThemeContext = createContext();

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('light');
  const [isLoaded, setIsLoaded] = useState(false);

  // Apply theme CSS custom properties
  const applyTheme = (themeName) => {
    const themeConfig = THEMES[themeName];
    if (!themeConfig) {
      console.warn(`Invalid theme: ${themeName}. Available themes:`, Object.keys(THEMES));
      return;
    }

    const root = document.documentElement;

    // Apply theme colors as CSS custom properties
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Set theme transition properties
    root.style.setProperty('--theme-transition', 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease');

    // Set theme class on body for additional CSS targeting
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${themeName}`);
  };

  // Load theme from localStorage
  const loadTheme = () => {
    try {
      const savedTheme = localStorage.getItem('todo-app-theme');
      if (savedTheme && THEMES[savedTheme]) {
        return savedTheme;
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    }
    return 'light'; // Default theme
  };

  // Save theme to localStorage
  const saveTheme = (themeName) => {
    try {
      localStorage.setItem('todo-app-theme', themeName);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  };

  // Set theme with persistence
  const setTheme = (themeName) => {
    if (!THEMES[themeName]) {
      console.warn(`Invalid theme: ${themeName}. Available themes:`, Object.keys(THEMES));
      return;
    }

    setThemeState(themeName);
    applyTheme(themeName);
    saveTheme(themeName);
  };

  // Get available themes
  const availableThemes = Object.keys(THEMES);
  const currentThemeConfig = THEMES[theme];

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = loadTheme();
    setThemeState(savedTheme);
    applyTheme(savedTheme);
    setIsLoaded(true);
  }, []);

  // Listen for system theme changes (optional enhancement)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      // Only auto-switch if user hasn't explicitly set a preference
      if (!localStorage.getItem('todo-app-theme')) {
        const systemTheme = e.matches ? 'dark' : 'light';
        setThemeState(systemTheme);
        applyTheme(systemTheme);
      }
    };

    // Add listener (with compatibility for older browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      // Clean up listener
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  const value = {
    theme,
    setTheme,
    availableThemes,
    currentTheme: currentThemeConfig,
    isLoaded,
    themes: THEMES,
  };

  // Prevent flash of unstyled content
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;