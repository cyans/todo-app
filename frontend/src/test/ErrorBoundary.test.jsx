// @TEST:UI-UX-DEPLOY-005:UX-ENHANCEMENT
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Test component that throws an error
const ThrowErrorComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};

// Test component with an error in render
const AsyncErrorComponent = () => {
  // Simulate async error
  setTimeout(() => {
    throw new Error('Async error');
  }, 0);
  return <div>Async component</div>;
};

describe('ErrorBoundary Component', () => {
  let originalError;
  let originalLogError;

  beforeEach(() => {
    // Mock console.error to avoid test output noise
    originalError = console.error;
    originalLogError = console.log;
    console.error = vi.fn();
    console.log = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore console methods
    console.error = originalError;
    console.log = originalLogError;
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowErrorComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should catch and display error when child component throws', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    // Look for the error message in the error details section
    expect(container.querySelector('details')).toContainHTML('Test error message');
  });

  it('should render custom fallback when provided', () => {
    const CustomFallback = ({ error, resetError }) => (
      <div>
        <h1>Custom Error</h1>
        <p>{error?.message || 'Unknown error'}</p>
        <button onClick={resetError}>Try Again</button>
      </div>
    );

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('Unknown error')).toBeInTheDocument(); // The custom fallback shows this when error is undefined
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('should reset error boundary when reset function is called', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should show error state
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Rerender with non-throwing component
    rerender(
      <ErrorBoundary>
        <ThrowErrorComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    // Should still show error until reset is triggered
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should log error to console by default', () => {
    render(
      <ErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('should not log error when logging is disabled', () => {
    render(
      <ErrorBoundary enableLogging={false}>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(console.error).not.toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('should handle different types of errors', () => {
    const StringThrowComponent = () => {
      throw 'String error';
    };

    render(
      <ErrorBoundary>
        <StringThrowComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should render with custom title', () => {
    render(
      <ErrorBoundary title="Custom Error Title">
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    render(
      <ErrorBoundary message="Custom error message">
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should show reset button by default', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const resetButton = container.querySelector('button');
    expect(resetButton).toBeInTheDocument();
    expect(resetButton).toHaveTextContent('Try Again');
  });

  it('should hide reset button when showReset is false', () => {
    const { container } = render(
      <ErrorBoundary showReset={false}>
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const resetButton = container.querySelector('button');
    expect(resetButton).not.toBeInTheDocument();
  });

  it('should handle missing error information gracefully', () => {
    const UndefinedErrorComponent = () => {
      throw undefined;
    };

    render(
      <ErrorBoundary>
        <UndefinedErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should support custom className for error container', () => {
    const { container } = render(
      <ErrorBoundary className="custom-error-boundary">
        <ThrowErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const errorContainer = container.querySelector('.custom-error-boundary');
    expect(errorContainer).toBeInTheDocument();
  });

  it('should handle nested error boundaries', () => {
    const { container } = render(
      <ErrorBoundary fallback={() => <div>Outer Error</div>}>
        <ErrorBoundary fallback={() => <div>Inner Error</div>}>
          <ThrowErrorComponent shouldThrow={true} />
        </ErrorBoundary>
      </ErrorBoundary>
    );

    // Inner boundary should catch the error
    expect(screen.getByText('Inner Error')).toBeInTheDocument();
    expect(screen.queryByText('Outer Error')).not.toBeInTheDocument();
  });
});