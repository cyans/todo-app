// @TEST:UI-UX-DEPLOY-005:UX-ENHANCEMENT
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ToastProvider, useToast } from '../components/ToastSystem';

// Test component to use toast
const TestComponent = () => {
  const { success, error, info, warning, custom, dismiss, clear } = useToast();

  return (
    <div>
      <button onClick={() => success('Success message')}>Success</button>
      <button onClick={() => error('Error message')}>Error</button>
      <button onClick={() => info('Info message')}>Info</button>
      <button onClick={() => warning('Warning message')}>Warning</button>
      <button onClick={() => custom('Custom message', { variant: 'default' })}>Custom</button>
      <button onClick={() => dismiss('test-id')}>Dismiss</button>
      <button onClick={() => clear()}>Clear All</button>
    </div>
  );
};

describe('ToastSystem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('ToastProvider', () => {
    it('should render children without toasts', () => {
      render(
        <ToastProvider>
          <div>Test content</div>
        </ToastProvider>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should provide toast context', () => {
      expect(() => {
        render(
          <ToastProvider>
            <TestComponent />
          </ToastProvider>
        );
      }).not.toThrow();
    });

    it('should throw error when useToast is used outside provider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useToast must be used within a ToastProvider');

      consoleError.mockRestore();
    });
  });

  describe('Toast Methods', () => {
    it('should show success toast', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Success'));

      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveAttribute('aria-label', 'Success');
    });

    it('should show error toast', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Error'));

      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveAttribute('aria-label', 'Error');
    });

    it('should show info toast', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Info'));

      expect(screen.getByText('Info message')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveAttribute('aria-label', 'Info');
    });

    it('should show warning toast', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Warning'));

      expect(screen.getByText('Warning message')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveAttribute('aria-label', 'Warning');
    });

    it('should show custom toast', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Custom'));

      expect(screen.getByText('Custom message')).toBeInTheDocument();
    });
  });

  describe('Toast Auto-dismiss', () => {
    it('should auto-dismiss toast after default duration', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Success'));
      expect(screen.getByText('Success message')).toBeInTheDocument();

      vi.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(screen.queryByText('Success message')).not.toBeInTheDocument();
      });
    });

    it('should support custom duration', () => {
      const TestCustomDuration = () => {
        const toast = useToast();
        return (
          <button onClick={() => toast.success('Message', { duration: 2000 })}>
            Custom Duration
          </button>
        );
      };

      render(
        <ToastProvider>
          <TestCustomDuration />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Custom Duration'));
      expect(screen.getByText('Message')).toBeInTheDocument();

      vi.advanceTimersByTime(2000);

      expect(screen.queryByText('Message')).not.toBeInTheDocument();
    });

    it('should not auto-dismiss when duration is 0', () => {
      const TestNoAutoDismiss = () => {
        const toast = useToast();
        return (
          <button onClick={() => toast.success('Message', { duration: 0 })}>
            No Auto Dismiss
          </button>
        );
      };

      render(
        <ToastProvider>
          <TestNoAutoDismiss />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('No Auto Dismiss'));
      expect(screen.getByText('Message')).toBeInTheDocument();

      vi.advanceTimersByTime(10000);

      expect(screen.getByText('Message')).toBeInTheDocument();
    });
  });

  describe('Toast Dismissal', () => {
    it('should dismiss specific toast by ID', () => {
      const TestWithId = () => {
        const toast = useToast();
        return (
          <button onClick={() => toast.success('Message', { id: 'test-id' })}>
            Add with ID
          </button>
        );
      };

      render(
        <ToastProvider>
          <TestWithId />
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Add with ID'));
      expect(screen.getByText('Message')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Dismiss'));
      expect(screen.queryByText('Message')).not.toBeInTheDocument();
    });

    it('should dismiss toast when close button is clicked', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Success'));
      expect(screen.getByText('Success message')).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });

    it('should clear all toasts', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Success'));
      fireEvent.click(screen.getByText('Error'));

      expect(screen.getByText('Success message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Clear All'));

      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
      expect(screen.queryByText('Error message')).not.toBeInTheDocument();
    });
  });

  describe('Toast Positioning', () => {
    it('should support different positions', () => {
      const TestPosition = () => {
        const toast = useToast();
        return (
          <button onClick={() => toast.success('Message', { position: 'bottom-right' })}>
            Bottom Right
          </button>
        );
      };

      const { container } = render(
        <ToastProvider>
          <TestPosition />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Bottom Right'));

      const toastContainer = container.querySelector('[data-sonner-toaster]');
      expect(toastContainer).toHaveClass('bottom-right');
    });
  });

  describe('Toast Actions', () => {
    it('should support action buttons', () => {
      const TestWithAction = () => {
        const toast = useToast();
        const handleAction = vi.fn();

        return (
          <button onClick={() => toast.success('Message', {
            action: {
              label: 'Undo',
              onClick: handleAction
            }
          })}>
            With Action
          </button>
        );
      };

      render(
        <ToastProvider>
          <TestWithAction />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('With Action'));
      expect(screen.getByText('Message')).toBeInTheDocument();
      expect(screen.getByText('Undo')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Undo'));
      // Verify action was called (implementation would need to support this)
    });
  });

  describe('Toast Styling', () => {
    it('should apply variant-specific styles', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      // Success toast
      fireEvent.click(screen.getByText('Success'));
      expect(screen.getByRole('alert')).toHaveClass('bg-green-500');

      // Error toast
      fireEvent.click(screen.getByText('Error'));
      expect(screen.getAllByRole('alert')[1]).toHaveClass('bg-red-500');
    });

    it('should support custom className', () => {
      const TestCustomStyle = () => {
        const toast = useToast();
        return (
          <button onClick={() => toast.success('Message', { className: 'custom-toast' })}>
            Custom Style
          </button>
        );
      };

      const { container } = render(
        <ToastProvider>
          <TestCustomStyle />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Custom Style'));
      expect(container.querySelector('.custom-toast')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Success'));

      const toast = screen.getByRole('alert');
      expect(toast).toHaveAttribute('aria-live', 'polite');
      expect(toast).toHaveAttribute('aria-atomic', 'true');
    });

    it('should announce changes to screen readers', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Info'));

      const toast = screen.getByRole('alert');
      expect(toast).toHaveAttribute('aria-label', 'Info');
    });

    it('should support keyboard navigation for dismissal', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Success'));
      expect(screen.getByText('Success message')).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Maximum Toasts', () => {
    it('should limit maximum number of toasts', () => {
      const TestMultiple = () => {
        const toast = useToast();
        return (
          <div>
            {[...Array(5)].map((_, i) => (
              <button key={i} onClick={() => toast.success(`Message ${i}`)}>
                Add {i}
              </button>
            ))}
          </div>
        );
      };

      render(
        <ToastProvider maxToasts={3}>
          <TestMultiple />
        </ToastProvider>
      );

      // Add 5 toasts, but only 3 should be visible
      for (let i = 0; i < 5; i++) {
        fireEvent.click(screen.getByText(`Add ${i}`));
      }

      expect(screen.getAllByRole('alert')).toHaveLength(3);
    });
  });
});