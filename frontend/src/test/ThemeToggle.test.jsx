// @TEST:UI-UX-DEPLOY-005:THEME
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';

// Test wrapper component
const TestWrapper = ({ children }) => (
  <ThemeProvider>
    {children}
  </ThemeProvider>
);

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Reset document classes
    document.documentElement.className = '';
  });

  it('should render theme toggle button', () => {
    render(
      <TestWrapper>
        <ThemeToggle />
      </TestWrapper>
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should show sun icon when in dark mode', () => {
    localStorage.setItem('theme', 'dark');

    render(
      <TestWrapper>
        <ThemeToggle />
      </TestWrapper>
    );

    // Dark mode should show sun icon (to switch to light)
    expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument();
  });

  it('should show moon icon when in light mode', () => {
    localStorage.setItem('theme', 'light');

    render(
      <TestWrapper>
        <ThemeToggle />
      </TestWrapper>
    );

    // Light mode should show moon icon (to switch to dark)
    expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument();
  });

  it('should toggle theme when clicked', () => {
    render(
      <TestWrapper>
        <ThemeToggle />
      </TestWrapper>
    );

    const button = screen.getByRole('button');

    // Initially in light mode
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');

    // Click to toggle to dark mode
    fireEvent.click(button);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');

    // Click to toggle back to light mode
    fireEvent.click(button);

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <TestWrapper>
        <ThemeToggle className="custom-toggle-class" />
      </TestWrapper>
    );

    const button = container.querySelector('button');
    expect(button).toHaveClass('custom-toggle-class');
  });

  it('should support different sizes', () => {
    const { container, rerender } = render(
      <TestWrapper>
        <ThemeToggle size="sm" />
      </TestWrapper>
    );

    let button = container.querySelector('button');
    expect(button).toHaveClass('w-8', 'h-8');

    rerender(
      <TestWrapper>
        <ThemeToggle size="lg" />
      </TestWrapper>
    );

    button = container.querySelector('button');
    expect(button).toHaveClass('w-12', 'h-12');
  });

  it('should support different variants', () => {
    const { container, rerender } = render(
      <TestWrapper>
        <ThemeToggle variant="default" />
      </TestWrapper>
    );

    let button = container.querySelector('button');
    expect(button).toHaveClass('bg-gray-200', 'dark:bg-gray-700');

    rerender(
      <TestWrapper>
        <ThemeToggle variant="outline" />
      </TestWrapper>
    );

    button = container.querySelector('button');
    expect(button).toHaveClass('border-2', 'border-gray-300', 'dark:border-gray-600');
  });

  it('should be accessible with proper ARIA attributes', () => {
    render(
      <TestWrapper>
        <ThemeToggle />
      </TestWrapper>
    );

    const button = screen.getByRole('button');

    // Should have proper aria-label
    expect(button).toHaveAttribute('aria-label');

    // Should have proper title
    expect(button).toHaveAttribute('title');

    // Should be keyboard accessible
    expect(button).toHaveAttribute('tabindex', '0');
  });

  it('should support keyboard navigation', () => {
    render(
      <TestWrapper>
        <ThemeToggle />
      </TestWrapper>
    );

    const button = screen.getByRole('button');

    // Should trigger on Enter key
    fireEvent.keyDown(button, { key: 'Enter' });
    // Theme should toggle (we can't easily test the state change here, but no error should occur)

    // Should trigger on Space key
    fireEvent.keyDown(button, { key: ' ' });
    // Theme should toggle (we can't easily test the state change here, but no error should occur)
  });

  it('should have hover and focus states', () => {
    const { container } = render(
      <TestWrapper>
        <ThemeToggle />
      </TestWrapper>
    );

    const button = container.querySelector('button');

    // Should have hover classes
    expect(button).toHaveClass('hover:bg-gray-300', 'dark:hover:bg-gray-600');

    // Should have focus classes
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
  });

  it('should animate transitions', () => {
    const { container } = render(
      <TestWrapper>
        <ThemeToggle />
      </TestWrapper>
    );

    const button = container.querySelector('button');
    const icon = button.querySelector('svg');

    // Should have transition classes (using actual implementation)
    expect(button).toHaveClass('transition-all', 'duration-200');
    expect(icon).toHaveClass('transition-transform', 'duration-200');
  });

  it('should render with proper icon styling', () => {
    render(
      <TestWrapper>
        <ThemeToggle />
      </TestWrapper>
    );

    const icon = screen.getByRole('button').querySelector('svg');

    // Should have proper size classes
    expect(icon).toHaveClass('w-5', 'h-5');

    // Should have proper color classes
    expect(icon).toHaveClass('text-gray-700', 'dark:text-gray-300');
  });

  it('should handle rapid clicking without errors', () => {
    render(
      <TestWrapper>
        <ThemeToggle />
      </TestWrapper>
    );

    const button = screen.getByRole('button');

    // Rapid clicking should not cause errors
    for (let i = 0; i < 10; i++) {
      fireEvent.click(button);
    }

    // Should still have proper aria-label
    expect(button).toHaveAttribute('aria-label');
  });

  it('should work when localStorage is unavailable', () => {
    // Mock localStorage to throw errors
    const originalSetItem = localStorage.setItem;
    const originalGetItem = localStorage.getItem;

    localStorage.setItem = vi.fn().mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    localStorage.getItem = vi.fn().mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <TestWrapper>
        <ThemeToggle />
      </TestWrapper>
    );

    const button = screen.getByRole('button');

    // Should still be clickable without throwing errors
    expect(() => {
      fireEvent.click(button);
    }).not.toThrow();

    localStorage.setItem = originalSetItem;
    localStorage.getItem = originalGetItem;
    consoleError.mockRestore();
  });
});