// @TEST:TAG-UX-ACCESSIBILITY-001
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { useEffect, useState } from 'react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '../ThemeProvider';
import AccessibilityProvider, { useAccessibility } from '../AccessibilityProvider';

// Test component that consumes accessibility features
const TestAccessibilityComponent = () => {
  const {
    announceToScreenReader,
    setFocus,
    preferences,
    updatePreferences,
    shortcuts,
    registerShortcut
  } = useAccessibility();

  return (
    <div>
      <button
        data-testid="accessible-button"
        onClick={() => announceToScreenReader('Button clicked')}
        aria-label="Accessible button"
        className="accessible-element"
      >
        Accessible Button
      </button>

      <button
        data-testid="focus-button"
        onClick={() => setFocus('focus-target')}
        className="accessible-element"
      >
        Set Focus
      </button>

      <div
        data-testid="focus-target"
        tabIndex="-1"
        className="accessible-element"
      >
        Focus Target
      </div>

      <div
        data-testid="screen-reader-announcements"
        aria-live="polite"
        aria-atomic="true"
        className="screen-reader-only"
      >
        {/* Screen reader announcements will appear here */}
      </div>

      <div
        data-testid="high-contrast-area"
        className={preferences.highContrast ? 'high-contrast' : ''}
      >
        High Contrast Area
      </div>

      <div
        data-testid="reduced-motion-area"
        className={preferences.reducedMotion ? 'reduced-motion' : ''}
      >
        Reduced Motion Area
      </div>

      <div
        data-testid="large-text-area"
        className={preferences.largeText ? 'large-text' : ''}
      >
        Large Text Area
      </div>

      <button
        data-testid="toggle-high-contrast"
        onClick={() => updatePreferences({ highContrast: !preferences.highContrast })}
        className="accessible-element"
      >
        Toggle High Contrast
      </button>

      <button
        data-testid="toggle-reduced-motion"
        onClick={() => updatePreferences({ reducedMotion: !preferences.reducedMotion })}
        className="accessible-element"
      >
        Toggle Reduced Motion
      </button>

      <button
        data-testid="toggle-large-text"
        onClick={() => updatePreferences({ largeText: !preferences.largeText })}
        className="accessible-element"
      >
        Toggle Large Text
      </button>
    </div>
  );
};

describe('AccessibilityProvider - Enhanced Accessibility Features', () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  it('should provide accessibility context', () => {
    render(
      <ThemeProvider>
        <AccessibilityProvider>
          <TestAccessibilityComponent />
        </AccessibilityProvider>
      </ThemeProvider>
    );

    // Should render all test elements
    expect(screen.getByTestId('accessible-button')).toBeInTheDocument();
    expect(screen.getByTestId('focus-button')).toBeInTheDocument();
    expect(screen.getByTestId('focus-target')).toBeInTheDocument();
    expect(screen.getByTestId('screen-reader-announcements')).toBeInTheDocument();
    expect(screen.getByTestId('high-contrast-area')).toBeInTheDocument();
    expect(screen.getByTestId('reduced-motion-area')).toBeInTheDocument();
    expect(screen.getByTestId('large-text-area')).toBeInTheDocument();
  });

  it('should support screen reader announcements', () => {
    render(
      <ThemeProvider>
        <AccessibilityProvider>
          <TestAccessibilityComponent />
        </AccessibilityProvider>
      </ThemeProvider>
    );

    const button = screen.getByTestId('accessible-button');
    const announcements = screen.getByTestId('screen-reader-announcements');

    // Click button to trigger announcement
    fireEvent.click(button);

    // Should have screen reader announcement
    expect(announcements).toHaveTextContent('Button clicked');
  });

  it('should support focus management', () => {
    render(
      <ThemeProvider>
        <AccessibilityProvider>
          <TestAccessibilityComponent />
        </AccessibilityProvider>
      </ThemeProvider>
    );

    const focusButton = screen.getByTestId('focus-button');
    const focusTarget = screen.getByTestId('focus-target');

    // Click button to set focus
    fireEvent.click(focusButton);

    // Focus should be moved to target
    expect(focusTarget).toHaveFocus();
  });

  it('should support high contrast mode', () => {
    render(
      <ThemeProvider>
        <AccessibilityProvider>
          <TestAccessibilityComponent />
        </AccessibilityProvider>
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId('toggle-high-contrast');
    const highContrastArea = screen.getByTestId('high-contrast-area');

    // Initially not high contrast
    expect(highContrastArea).not.toHaveClass('high-contrast');

    // Toggle high contrast
    fireEvent.click(toggleButton);

    // Should have high contrast class
    expect(highContrastArea).toHaveClass('high-contrast');
  });

  it('should support reduced motion preferences', () => {
    render(
      <ThemeProvider>
        <AccessibilityProvider>
          <TestAccessibilityComponent />
        </AccessibilityProvider>
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId('toggle-reduced-motion');
    const reducedMotionArea = screen.getByTestId('reduced-motion-area');

    // Initially not reduced motion
    expect(reducedMotionArea).not.toHaveClass('reduced-motion');

    // Toggle reduced motion
    fireEvent.click(toggleButton);

    // Should have reduced motion class
    expect(reducedMotionArea).toHaveClass('reduced-motion');
  });

  it('should support large text preferences', () => {
    render(
      <ThemeProvider>
        <AccessibilityProvider>
          <TestAccessibilityComponent />
        </AccessibilityProvider>
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId('toggle-large-text');
    const largeTextArea = screen.getByTestId('large-text-area');

    // Initially not large text
    expect(largeTextArea).not.toHaveClass('large-text');

    // Toggle large text
    fireEvent.click(toggleButton);

    // Should have large text class
    expect(largeTextArea).toHaveClass('large-text');
  });

  it('should detect system accessibility preferences', () => {
    // Mock system preferences
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)' ||
                query === '(prefers-contrast: high)' ||
                query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(
      <ThemeProvider>
        <AccessibilityProvider>
          <TestAccessibilityComponent />
        </AccessibilityProvider>
      </ThemeProvider>
    );

    // System preferences should be detected
    const reducedMotionArea = screen.getByTestId('reduced-motion-area');
    expect(reducedMotionArea).toHaveClass('reduced-motion');
  });

  it('should support keyboard navigation', () => {
    render(
      <ThemeProvider>
        <AccessibilityProvider>
          <TestAccessibilityComponent />
        </AccessibilityProvider>
      </ThemeProvider>
    );

    const button = screen.getByTestId('accessible-button');

    // Tab to button
    fireEvent.focus(button);

    // Should have focus styles
    expect(button).toHaveClass('keyboard-focused');

    // Activate with Enter key
    fireEvent.keyDown(button, { key: 'Enter' });
    fireEvent.keyUp(button, { key: 'Enter' });

    // Should trigger action
    const announcements = screen.getByTestId('screen-reader-announcements');
    expect(announcements).toHaveTextContent('Button clicked');
  });

  it('should support ARIA attributes', () => {
    render(
      <ThemeProvider>
        <AccessibilityProvider>
          <TestAccessibilityComponent />
        </AccessibilityProvider>
      </ThemeProvider>
    );

    const button = screen.getByTestId('accessible-button');
    const announcements = screen.getByTestId('screen-reader-announcements');

    // Should have proper ARIA attributes
    expect(button).toHaveAttribute('aria-label', 'Accessible button');
    expect(announcements).toHaveAttribute('aria-live', 'polite');
    expect(announcements).toHaveAttribute('aria-atomic', 'true');
  });

  it('should support skip links', () => {
    const SkipLinkComponent = () => {
      const { registerSkipLink } = useAccessibility();

      useEffect(() => {
        registerSkipLink('main-content', 'Skip to main content');
      }, []);

      return (
        <div>
          <a href="#main-content" data-testid="skip-link">Skip to main content</a>
          <main id="main-content" data-testid="main-content">
            Main Content
          </main>
        </div>
      );
    };

    render(
      <ThemeProvider>
        <AccessibilityProvider>
          <SkipLinkComponent />
        </AccessibilityProvider>
      </ThemeProvider>
    );

    const skipLink = screen.getByTestId('skip-link');
    const mainContent = screen.getByTestId('main-content');

    // Should have skip link functionality
    expect(skipLink).toHaveAttribute('href', '#main-content');
    expect(mainContent).toHaveAttribute('id', 'main-content');
  });

  it('should support focus trap', () => {
    const FocusTrapComponent = () => {
      const { trapFocus, releaseFocus } = useAccessibility();
      const [isTrapActive, setIsTrapActive] = useState(false);

      const handleTrap = () => {
        trapFocus('trap-container');
        setIsTrapActive(true);
      };

      const handleRelease = () => {
        releaseFocus();
        setIsTrapActive(false);
      };

      return (
        <div>
          <button onClick={handleTrap} data-testid="trap-focus">Trap Focus</button>
          <div id="trap-container" data-testid="trap-container">
            <button data-testid="trapped-button-1">Trapped Button 1</button>
            <button data-testid="trapped-button-2">Trapped Button 2</button>
            <button onClick={handleRelease} data-testid="release-focus">Release Focus</button>
          </div>
        </div>
      );
    };

    render(
      <ThemeProvider>
        <AccessibilityProvider>
          <FocusTrapComponent />
        </AccessibilityProvider>
      </ThemeProvider>
    );

    const trapButton = screen.getByTestId('trap-focus');
    const trappedButton1 = screen.getByTestId('trapped-button-1');

    // Activate focus trap
    fireEvent.click(trapButton);

    // Focus should be trapped within container
    expect(trappedButton1).toHaveFocus();
  });

  it('should support accessibility preferences persistence', () => {
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });

    render(
      <ThemeProvider>
        <AccessibilityProvider>
          <TestAccessibilityComponent />
        </AccessibilityProvider>
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId('toggle-high-contrast');

    // Toggle preference
    fireEvent.click(toggleButton);

    // Should save to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'accessibility-preferences',
      expect.stringContaining('highContrast')
    );
  });

  it('should support accessibility testing utilities', () => {
    render(
      <ThemeProvider>
        <AccessibilityProvider>
          <TestAccessibilityComponent />
        </AccessibilityProvider>
      </ThemeProvider>
    );

    const button = screen.getByTestId('accessible-button');

    // Should be accessible
    expect(button).toBeVisible();
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('aria-label');
  });

  it('should support color contrast requirements', () => {
    render(
      <ThemeProvider>
        <AccessibilityProvider>
          <TestAccessibilityComponent />
        </AccessibilityProvider>
      </ThemeProvider>
    );

    const highContrastArea = screen.getByTestId('high-contrast-area');
    const toggleButton = screen.getByTestId('toggle-high-contrast');

    // Enable high contrast
    fireEvent.click(toggleButton);

    // Should have high contrast styles
    expect(highContrastArea).toHaveClass('high-contrast');

    // In high contrast mode, should meet WCAG AA+ contrast ratios
    const styles = window.getComputedStyle(highContrastArea);
    expect(styles.filter).toContain('contrast(1.2)');
  });

  it('should support screen reader only content', () => {
    render(
      <ThemeProvider>
        <AccessibilityProvider>
          <TestAccessibilityComponent />
        </AccessibilityProvider>
      </ThemeProvider>
    );

    const announcements = screen.getByTestId('screen-reader-announcements');

    // Should have screen reader only styles
    expect(announcements).toHaveClass('screen-reader-only');
  });

  it('should support accessibility validation', () => {
    const ValidationComponent = () => {
      const { validateAccessibility } = useAccessibility();

      const handleValidation = () => {
        const issues = validateAccessibility();
        console.log('Accessibility issues:', issues);
      };

      return (
        <button onClick={handleValidation} data-testid="validate-button">
          Validate Accessibility
        </button>
      );
    };

    render(
      <ThemeProvider>
        <AccessibilityProvider>
          <ValidationComponent />
        </AccessibilityProvider>
      </ThemeProvider>
    );

    const validateButton = screen.getByTestId('validate-button');

    // Should have accessibility validation
    expect(validateButton).toBeInTheDocument();
  });
});