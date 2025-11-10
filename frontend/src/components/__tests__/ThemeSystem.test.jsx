// @TEST:TAG-THEME-SYSTEM-001
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemeProvider, { useTheme, ThemeContext } from '../ThemeProvider';

// Test component to consume theme context
const TestComponent = () => {
  const { theme, setTheme, availableThemes } = useTheme();

  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('high-contrast')}>Set High Contrast</button>
      <span data-testid="available-themes">{availableThemes.join(',')}</span>
    </div>
  );
};

describe('ThemeProvider - Multi-theme Architecture', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear any inline styles
    document.documentElement.removeAttribute('style');
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  it('should provide default light theme on initial render', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
  });

  it('should provide all available themes', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const themes = screen.getByTestId('available-themes').textContent;
    expect(themes).toContain('light');
    expect(themes).toContain('dark');
    expect(themes).toContain('high-contrast');
    expect(themes).toContain('custom-blue');
  });

  it('should switch themes when setTheme is called', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Initially light theme
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

    // Switch to dark theme
    fireEvent.click(screen.getByText('Set Dark'));
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

    // Switch to high contrast theme
    fireEvent.click(screen.getByText('Set High Contrast'));
    expect(screen.getByTestId('current-theme')).toHaveTextContent('high-contrast');
  });

  it('should apply CSS custom properties for theme colors', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Check if CSS custom properties are set
    const rootStyles = getComputedStyle(document.documentElement);

    // Light theme colors should be present
    expect(rootStyles.getPropertyValue('--color-primary')).toBeTruthy();
    expect(rootStyles.getPropertyValue('--color-background')).toBeTruthy();
    expect(rootStyles.getPropertyValue('--color-text')).toBeTruthy();
  });

  it('should update CSS custom properties when theme changes', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Get initial light theme colors
    const lightStyles = getComputedStyle(document.documentElement);
    const lightBgColor = lightStyles.getPropertyValue('--color-background');

    // Switch to dark theme
    fireEvent.click(screen.getByText('Set Dark'));

    // Dark theme should have different colors
    const darkStyles = getComputedStyle(document.documentElement);
    const darkBgColor = darkStyles.getPropertyValue('--color-background');

    expect(darkBgColor).not.toBe(lightBgColor);
  });

  it('should handle invalid theme names gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const InvalidThemeComponent = () => {
      const { setTheme } = useTheme();
      return <button onClick={() => setTheme('invalid-theme')}>Set Invalid Theme</button>;
    };

    render(
      <ThemeProvider>
        <InvalidThemeComponent />
      </ThemeProvider>
    );

    // Try to set an invalid theme
    fireEvent.click(screen.getByText('Set Invalid Theme'));

    expect(consoleSpy).toHaveBeenCalledWith(
      "Invalid theme: invalid-theme. Available themes:",
      ["light", "dark", "high-contrast", "custom-blue"]
    );

    consoleSpy.mockRestore();
  });

  it('should provide theme transition support', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const rootStyles = getComputedStyle(document.documentElement);
    const transition = rootStyles.getPropertyValue('--theme-transition');

    expect(transition).toContain('background-color');
    expect(transition).toContain('color');
    expect(transition).toContain('border-color');
  });

  it('should support theme-specific component styles', () => {
    render(
      <ThemeProvider>
        <div data-testid="test-element" className="theme-component">Test</div>
      </ThemeProvider>
    );

    const element = screen.getByTestId('test-element');
    const styles = getComputedStyle(element);

    // Should have theme-dependent styling
    expect(styles.backgroundColor || styles.background).toBeTruthy();
  });

  it('should handle system preference detection', () => {
    // Mock system prefers dark
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Should still use default light theme unless system preference is enabled
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

    // Restore original matchMedia
    window.matchMedia = originalMatchMedia;
  });
});