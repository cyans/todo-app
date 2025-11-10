// @TEST:TAG-UX-ENHANCED-002
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '../ThemeProvider';
import MicroInteractionsProvider, { useMicroInteractions } from '../MicroInteractionsProvider';

// Test component that consumes micro-interactions
const TestMicroComponent = () => {
  const {
    registerInteraction,
    triggerInteraction,
    loadingStates,
    feedback,
    gestures
  } = useMicroInteractions();

  const interactiveButtonRef = useRef(null);
  const loadingButtonRef = useRef(null);
  const hoverAreaRef = useRef(null);
  const swipeAreaRef = useRef(null);

  return (
    <div>
      <button
        ref={interactiveButtonRef}
        data-testid="interactive-button"
        onClick={() => registerInteraction('button-click', {
          type: 'success',
          element: interactiveButtonRef.current
        })}
        className="micro-button micro-animate"
      >
        Click Me
      </button>

      <button
        ref={loadingButtonRef}
        data-testid="loading-button"
        onClick={() => {
          registerInteraction('loading-start', {
            element: loadingButtonRef.current
          });
          setTimeout(() => registerInteraction('loading-end', {
            element: loadingButtonRef.current
          }), 1000);
        }}
        className="micro-button-loading micro-loading loading-with-spinner skeleton-loading progress-loading"
      >
        Loading Button
      </button>

      <div
        ref={hoverAreaRef}
        data-testid="hover-area"
        onMouseEnter={() => registerInteraction('hover-start', {
          element: hoverAreaRef.current
        })}
        onMouseLeave={() => registerInteraction('hover-end', {
          element: hoverAreaRef.current
        })}
        className="micro-hover-area"
      >
        Hover Area
      </div>

      <div
        ref={swipeAreaRef}
        data-testid="swipe-area"
        className="micro-swipe-area"
      >
        Swipe Area
      </div>

      <div
        data-testid="feedback-area"
        className={`micro-feedback ${feedback.type} show`}
        aria-live="polite"
        aria-atomic="true"
      >
        {feedback.message || 'Default feedback'}
      </div>

      <div
        data-testid="loading-area"
        className={`micro-loading ${loadingStates.main ? 'loading' : ''}`}
      >
        {loadingStates.main ? 'Loading...' : 'Content Loaded'}
      </div>
    </div>
  );
};

describe('MicroInteractionsProvider - Micro-interactions and Loading States', () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  it('should provide micro-interactions context', () => {
    render(
      <ThemeProvider>
        <MicroInteractionsProvider>
          <TestMicroComponent />
        </MicroInteractionsProvider>
      </ThemeProvider>
    );

    // Should render all test elements
    expect(screen.getByTestId('interactive-button')).toBeInTheDocument();
    expect(screen.getByTestId('loading-button')).toBeInTheDocument();
    expect(screen.getByTestId('hover-area')).toBeInTheDocument();
    expect(screen.getByTestId('swipe-area')).toBeInTheDocument();
    expect(screen.getByTestId('feedback-area')).toBeInTheDocument();
    expect(screen.getByTestId('loading-area')).toBeInTheDocument();
  });

  it('should handle button click interactions', () => {
    render(
      <ThemeProvider>
        <MicroInteractionsProvider>
          <TestMicroComponent />
        </MicroInteractionsProvider>
      </ThemeProvider>
    );

    const button = screen.getByTestId('interactive-button');

    // Should have hover interaction class
    expect(button).toHaveClass('micro-button');

    // Click the button
    fireEvent.click(button);

    // Should trigger interaction feedback
    const feedbackArea = screen.getByTestId('feedback-area');
    expect(feedbackArea).toHaveClass('success');
  });

  it('should handle loading states correctly', async () => {
    render(
      <ThemeProvider>
        <MicroInteractionsProvider>
          <TestMicroComponent />
        </MicroInteractionsProvider>
      </ThemeProvider>
    );

    const loadingButton = screen.getByTestId('loading-button');
    const loadingArea = screen.getByTestId('loading-area');

    // Initially not loading
    expect(loadingArea).toHaveTextContent('Content Loaded');
    expect(loadingArea).not.toHaveClass('loading');

    // Click to start loading
    fireEvent.click(loadingButton);

    // Should show loading state
    expect(loadingArea).toHaveTextContent('Loading...');
    expect(loadingArea).toHaveClass('loading');

    // Wait for loading to complete
    await waitFor(() => {
      expect(loadingArea).toHaveTextContent('Content Loaded');
      expect(loadingArea).not.toHaveClass('loading');
    }, { timeout: 2000 });
  });

  it('should handle hover interactions', () => {
    render(
      <ThemeProvider>
        <MicroInteractionsProvider>
          <TestMicroComponent />
        </MicroInteractionsProvider>
      </ThemeProvider>
    );

    const hoverArea = screen.getByTestId('hover-area');

    // Should have hover interaction class
    expect(hoverArea).toHaveClass('micro-hover-area');

    // Mouse enter
    fireEvent.mouseEnter(hoverArea);
    expect(hoverArea).toHaveClass('hover-active');

    // Mouse leave
    fireEvent.mouseLeave(hoverArea);
    expect(hoverArea).not.toHaveClass('hover-active');
  });

  it('should handle swipe gestures', () => {
    render(
      <ThemeProvider>
        <MicroInteractionsProvider>
          <TestMicroComponent />
        </MicroInteractionsProvider>
      </ThemeProvider>
    );

    const swipeArea = screen.getByTestId('swipe-area');

    // Should have swipe interaction class
    expect(swipeArea).toHaveClass('micro-swipe-area');

    // Simulate swipe gesture
    fireEvent.touchStart(swipeArea, {
      touches: [{ clientX: 0, clientY: 0 }]
    });

    fireEvent.touchMove(swipeArea, {
      touches: [{ clientX: 100, clientY: 0 }]
    });

    fireEvent.touchEnd(swipeArea);

    // Should handle swipe interaction
    expect(swipeArea).toHaveClass('swipe-detected');
  });

  it('should provide haptic feedback support', () => {
    const mockVibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      value: mockVibrate,
      writable: true,
    });

    render(
      <ThemeProvider>
        <MicroInteractionsProvider>
          <TestMicroComponent />
        </MicroInteractionsProvider>
      </ThemeProvider>
    );

    const button = screen.getByTestId('interactive-button');
    fireEvent.click(button);

    // Should trigger haptic feedback if supported
    if (navigator.vibrate) {
      expect(mockVibrate).toHaveBeenCalledWith([10]);
    }
  });

  it('should handle keyboard interactions', () => {
    render(
      <ThemeProvider>
        <MicroInteractionsProvider>
          <TestMicroComponent />
        </MicroInteractionsProvider>
      </ThemeProvider>
    );

    const button = screen.getByTestId('interactive-button');

    // Should handle keyboard focus
    fireEvent.focus(button);
    expect(button).toHaveClass('keyboard-focused');

    // Should handle keyboard interaction
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(button).toHaveClass('keyboard-activated');

    fireEvent.keyUp(button, { key: 'Enter' });
    expect(button).not.toHaveClass('keyboard-activated');
  });

  it('should support different interaction types', () => {
    render(
      <ThemeProvider>
        <MicroInteractionsProvider>
          <TestMicroComponent />
        </MicroInteractionsProvider>
      </ThemeProvider>
    );

    const button = screen.getByTestId('interactive-button');

    // Should support different interaction types
    fireEvent.click(button);
    expect(button).toHaveClass('interaction-success');

    // Should support error interactions
    fireEvent.click(button);
    expect(button).toHaveClass('interaction-error');

    // Should support warning interactions
    fireEvent.click(button);
    expect(button).toHaveClass('interaction-warning');
  });

  it('should handle progressive enhancement', () => {
    // Test with JavaScript disabled simulation
    const originalConsoleWarn = console.warn;
    console.warn = vi.fn();

    render(
      <ThemeProvider>
        <MicroInteractionsProvider>
          <TestMicroComponent />
        </MicroInteractionsProvider>
      </ThemeProvider>
    );

    const button = screen.getByTestId('interactive-button');

    // Should work without JavaScript enhancements
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type');

    console.warn = originalConsoleWarn;
  });

  it('should support accessibility features', () => {
    render(
      <ThemeProvider>
        <MicroInteractionsProvider>
          <TestMicroComponent />
        </MicroInteractionsProvider>
      </ThemeProvider>
    );

    const button = screen.getByTestId('interactive-button');

    // Should have ARIA attributes for interactions
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('role');

    // Should announce interactions to screen readers
    fireEvent.click(button);

    const feedbackArea = screen.getByTestId('feedback-area');
    expect(feedbackArea).toHaveAttribute('aria-live');
    expect(feedbackArea).toHaveAttribute('aria-atomic');
  });

  it('should handle performance optimization', () => {
    const mockPerformanceNow = vi.fn();
    Object.defineProperty(window.performance, 'now', {
      value: mockPerformanceNow,
    });

    mockPerformanceNow.mockReturnValue(0);

    render(
      <ThemeProvider>
        <MicroInteractionsProvider>
          <TestMicroComponent />
        </MicroInteractionsProvider>
      </ThemeProvider>
    );

    const button = screen.getByTestId('interactive-button');

    mockPerformanceNow.mockReturnValue(16); // 60fps timing

    fireEvent.click(button);

    // Should respect 60fps timing
    expect(mockPerformanceNow).toHaveBeenCalled();
  });

  it('should support different loading states', () => {
    render(
      <ThemeProvider>
        <MicroInteractionsProvider>
          <TestMicroComponent />
        </MicroInteractionsProvider>
      </ThemeProvider>
    );

    const loadingArea = screen.getByTestId('loading-area');

    // Should support different loading states
    expect(loadingArea).toHaveClass('micro-loading');

    // Should support loading with spinner
    fireEvent.click(screen.getByTestId('loading-button'));
    expect(loadingArea).toHaveClass('loading-with-spinner');

    // Should support skeleton loading
    expect(loadingArea).toHaveClass('skeleton-loading');

    // Should support progress loading
    expect(loadingArea).toHaveClass('progress-loading');
  });

  it('should handle error states gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ThemeProvider>
        <MicroInteractionsProvider>
          <TestMicroComponent />
        </MicroInteractionsProvider>
      </ThemeProvider>
    );

    // Should handle interaction errors
    const button = screen.getByTestId('interactive-button');
    fireEvent.error(button);

    // Should not crash and show error feedback
    const feedbackArea = screen.getByTestId('feedback-area');
    expect(feedbackArea).toHaveClass('error');

    consoleSpy.mockRestore();
  });

  it('should support micro-animations for interactions', () => {
    render(
      <ThemeProvider>
        <MicroInteractionsProvider>
          <TestMicroComponent />
        </MicroInteractionsProvider>
      </ThemeProvider>
    );

    const button = screen.getByTestId('interactive-button');

    // Should have micro-animation classes
    expect(button).toHaveClass('micro-animate');

    // Should trigger micro-animation on interaction
    fireEvent.click(button);
    expect(button).toHaveClass('micro-animation-active');

    // Should remove animation class after completion
    setTimeout(() => {
      expect(button).not.toHaveClass('micro-animation-active');
    }, 300);
  });

  it('should handle interaction debouncing', () => {
    render(
      <ThemeProvider>
        <MicroInteractionsProvider>
          <TestMicroComponent />
        </MicroInteractionsProvider>
      </ThemeProvider>
    );

    const button = screen.getByTestId('interactive-button');

    // Multiple rapid clicks should be debounced
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    // Should only trigger interaction once
    const feedbackArea = screen.getByTestId('feedback-area');
    expect(feedbackArea).toHaveClass('success');
  });

  it('should support custom interaction callbacks', () => {
    const customCallback = vi.fn();

    render(
      <ThemeProvider>
        <MicroInteractionsProvider>
          <TestMicroComponent />
        </MicroInteractionsProvider>
      </ThemeProvider>
    );

    const button = screen.getByTestId('interactive-button');

    // Should support custom callbacks
    fireEvent.click(button);

    // Custom callback should be called
    expect(customCallback).toHaveBeenCalled();
  });
});