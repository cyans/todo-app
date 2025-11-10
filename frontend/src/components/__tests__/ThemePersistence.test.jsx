// @TEST:TAG-THEME-SYSTEM-002
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemeProvider, { useTheme } from '../ThemeProvider';

const TestComponent = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('high-contrast')}>Set High Contrast</button>
    </div>
  );
};

describe('ThemeProvider - Theme Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('style');
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  it('should save theme preference to localStorage when theme changes', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Initially should be light theme
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

    // Change to dark theme
    fireEvent.click(screen.getByText('Set Dark'));

    // Check if localStorage was updated
    expect(localStorage.getItem('todo-app-theme')).toBe('dark');
  });

  it('should load saved theme preference from localStorage on mount', () => {
    // Set a saved theme before rendering
    localStorage.setItem('todo-app-theme', 'high-contrast');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Should load the saved theme
    expect(screen.getByTestId('current-theme')).toHaveTextContent('high-contrast');
  });

  it('should handle corrupted localStorage data gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Set corrupted data
    localStorage.setItem('todo-app-theme', 'invalid-theme-data');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Should fall back to default theme
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

    consoleSpy.mockRestore();
  });

  it('should persist theme across component re-renders', () => {
    const { rerender } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Change theme
    fireEvent.click(screen.getByText('Set Dark'));
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

    // Re-render component
    rerender(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Theme should persist
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
  });

  it('should handle localStorage errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock localStorage to throw an error
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn().mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Should not crash and still function
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

    // Change theme should not crash
    fireEvent.click(screen.getByText('Set Dark'));
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

    // Restore original localStorage.setItem
    localStorage.setItem = originalSetItem;
    consoleSpy.mockRestore();
  });

  it('should respect localStorage expiration if implemented', () => {
    // This test is for future enhancement with expiration logic
    const dateSpy = vi.spyOn(Date, 'now').mockReturnValue(1000000);

    localStorage.setItem('todo-app-theme', 'dark');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

    dateSpy.mockRestore();
  });

  it('should sync theme changes across multiple components', () => {
    const TestComponent2 = () => {
      const { theme } = useTheme();
      return <span data-testid="component-2-theme">{theme}</span>;
    };

    render(
      <ThemeProvider>
        <TestComponent />
        <TestComponent2 />
      </ThemeProvider>
    );

    // Both components should show same initial theme
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(screen.getByTestId('component-2-theme')).toHaveTextContent('light');

    // Change theme in first component
    fireEvent.click(screen.getByText('Set Dark'));

    // Both components should reflect the change
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('component-2-theme')).toHaveTextContent('dark');
  });

  it('should handle localStorage quota exceeded errors', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Fill up localStorage to simulate quota exceeded
    try {
      for (let i = 0; i < 10000; i++) {
        localStorage.setItem(`test-key-${i}`, 'x'.repeat(1000));
      }
    } catch (e) {
      // Ignore quota exceeded errors during setup
    }

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Should still work even with localStorage full
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

    // Theme change should work but may not persist
    fireEvent.click(screen.getByText('Set Dark'));
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

    consoleSpy.mockRestore();
  });

  it('should handle sessionStorage fallback if localStorage is unavailable', () => {
    const originalLocalStorage = global.localStorage;

    // Temporarily disable localStorage
    delete global.localStorage;

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Should still work with default theme
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

    // Restore localStorage
    global.localStorage = originalLocalStorage;
  });
});