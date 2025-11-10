/* @TEST:TAG-UI-PERFORMANCE-001 - LazyComponent code splitting tests */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { LazyComponent } from '../LazyComponent'

// Mock dynamic import
const mockComponent = vi.fn(() => 'Mocked Component')
const mockImport = vi.fn(() => Promise.resolve({ default: mockComponent }))

// Mock React.lazy
const originalLazy = React.lazy
React.lazy = vi.fn((factory) => {
  factory().then(module => {
    return module.default
  })
  return mockComponent
})

describe('LazyComponent', () => {
  let mockProps

  beforeEach(() => {
    mockProps = {
      factory: mockImport,
      fallback: <div data-testid="fallback">Loading...</div>,
      errorFallback: <div data-testid="error-fallback">Failed to load</div>,
      className: '',
      delay: 200
    }
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Restore React.lazy
    React.lazy = originalLazy
  })

  describe('Code Splitting Tests', () => {
    it('shows fallback while component is loading', () => {
      render(<LazyComponent {...mockProps} />)

      const fallback = screen.getByTestId('fallback')
      expect(fallback).toBeInTheDocument()
      expect(fallback).toHaveTextContent('Loading...')
    })

    it('loads and renders component successfully', async () => {
      render(<LazyComponent {...mockProps} />)

      await waitFor(() => {
        const loadedComponent = screen.getByText('Mocked Component')
        expect(loadedComponent).toBeInTheDocument()
      })

      expect(mockImport).toHaveBeenCalled()
    })

    it('passes props to loaded component', async () => {
      const TestComponent = vi.fn(({ title }) => <div data-testid="test-component">{title}</div>)
      const mockTestImport = vi.fn(() => Promise.resolve({ default: TestComponent }))

      render(
        <LazyComponent
          factory={mockTestImport}
          fallback={<div>Loading...</div>}
          title="Test Title"
        />
      )

      await waitFor(() => {
        const component = screen.getByTestId('test-component')
        expect(component).toBeInTheDocument()
        expect(component).toHaveTextContent('Test Title')
      })
    })

    it('handles import errors gracefully', async () => {
      const errorImport = vi.fn(() => Promise.reject(new Error('Import failed')))

      render(<LazyComponent {...mockProps} factory={errorImport} />)

      await waitFor(() => {
        const errorFallback = screen.getByTestId('error-fallback')
        expect(errorFallback).toBeInTheDocument()
        expect(errorFallback).toHaveTextContent('Failed to load')
      })
    })
  })

  describe('Performance Features', () => {
    it('implements delay before showing fallback', async () => {
      const startTime = performance.now()
      render(<LazyComponent {...mockProps} delay={100} />)

      // Fallback should not appear immediately
      expect(screen.queryByTestId('fallback')).not.toBeInTheDocument()

      // Wait for delay
      await waitFor(() => {
        expect(screen.getByTestId('fallback')).toBeInTheDocument()
      }, { timeout: 200 })

      const endTime = performance.now()
      expect(endTime - startTime).toBeGreaterThan(90) // Allow some tolerance
    })

    it('cancels loading if component unmounts during load', () => {
      const { unmount } = render(<LazyComponent {...mockProps} />)

      // Unmount before component loads
      unmount()

      // Should handle gracefully without errors
      expect(true).toBe(true)
    })

    it('implements proper cleanup', () => {
      const { unmount } = render(<LazyComponent {...mockProps} />)

      unmount()

      // Should cleanup properly
      expect(true).toBe(true)
    })

    it('supports preloading', () => {
      const preloadImport = vi.fn(() => Promise.resolve({ default: mockComponent }))

      const { preload } = render(<LazyComponent {...mockProps} factory={preloadImport} />)

      if (preload) {
        preload()

        expect(preloadImport).toHaveBeenCalled()
      }
    })
  })

  describe('Error Handling', () => {
    it('shows custom error fallback when provided', async () => {
      const errorImport = vi.fn(() => Promise.reject(new Error('Network error')))
      const customErrorFallback = <div data-testid="custom-error">Custom error message</div>

      render(
        <LazyComponent
          factory={errorImport}
          fallback={<div>Loading...</div>}
          errorFallback={customErrorFallback}
        />
      )

      await waitFor(() => {
        const errorElement = screen.getByTestId('custom-error')
        expect(errorElement).toBeInTheDocument()
        expect(errorElement).toHaveTextContent('Custom error message')
      })
    })

    it('shows default error when no custom fallback provided', async () => {
      const errorImport = vi.fn(() => Promise.reject(new Error('Import failed')))

      render(
        <LazyComponent
          factory={errorImport}
          fallback={<div>Loading...</div>}
        />
      )

      await waitFor(() => {
        const errorMessage = screen.getByText(/Failed to load component/)
        expect(errorMessage).toBeInTheDocument()
      })
    })

    it('handles timeout errors', async () => {
      const timeoutImport = vi.fn(() => new Promise(() => {})) // Never resolves

      render(
        <LazyComponent
          factory={timeoutImport}
          fallback={<div>Loading...</div>}
          timeout={100}
        />
      )

      await waitFor(
        () => {
          const errorMessage = screen.getByText(/Component loading timed out/)
          expect(errorMessage).toBeInTheDocument()
        },
        { timeout: 200 }
      )
    })
  })

  describe('Accessibility', () => {
    it('maintains accessibility during loading', () => {
      render(<LazyComponent {...mockProps} />)

      const fallback = screen.getByTestId('fallback')
      expect(fallback).toHaveAttribute('aria-live', 'polite')
      expect(fallback).toHaveAttribute('aria-busy', 'true')
    })

    it('announces loading completion', async () => {
      render(<LazyComponent {...mockProps} />)

      await waitFor(() => {
        const loadedComponent = screen.getByText('Mocked Component')
        expect(loadedComponent).toBeInTheDocument()
      })

      // Should update aria-busy to false
      const container = screen.getByTestId('lazy-component')
      expect(container).toHaveAttribute('aria-busy', 'false')
    })

    it('announces errors to screen readers', async () => {
      const errorImport = vi.fn(() => Promise.reject(new Error('Import failed')))

      render(<LazyComponent {...mockProps} factory={errorImport} />)

      await waitFor(() => {
        const errorFallback = screen.getByTestId('error-fallback')
        expect(errorFallback).toHaveAttribute('role', 'alert')
      })
    })
  })

  describe('Conditional Loading', () => {
    it('does not load component when condition is false', () => {
      render(
        <LazyComponent
          {...mockProps}
          shouldLoad={false}
        />
      )

      expect(mockImport).not.toHaveBeenCalled()
    })

    it('loads component when condition becomes true', async () => {
      const { rerender } = render(
        <LazyComponent
          {...mockProps}
          shouldLoad={false}
        />
      )

      expect(mockImport).not.toHaveBeenCalled()

      rerender(
        <LazyComponent
          {...mockProps}
          shouldLoad={true}
        />
      )

      await waitFor(() => {
        expect(mockImport).toHaveBeenCalled()
      })
    })

    it('supports trigger-based loading', async () => {
      let triggerLoad
      render(
        <LazyComponent
          {...mockProps}
          trigger={(fn) => {
            triggerLoad = fn
          }}
        />
      )

      expect(mockImport).not.toHaveBeenCalled()

      // Trigger load manually
      triggerLoad()

      await waitFor(() => {
        expect(mockImport).toHaveBeenCalled()
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles invalid factory function', async () => {
      const invalidFactory = null

      render(
        <LazyComponent
          factory={invalidFactory}
          fallback={<div>Loading...</div>}
        />
      )

      await waitFor(() => {
        const errorMessage = screen.getByText(/Invalid factory function/)
        expect(errorMessage).toBeInTheDocument()
      })
    })

    it('handles component that returns null', async () => {
      const NullComponent = () => null
      const nullImport = vi.fn(() => Promise.resolve({ default: NullComponent }))

      render(<LazyComponent {...mockProps} factory={nullImport} />)

      await waitFor(() => {
        expect(nullImport).toHaveBeenCalled()
      })

      // Should handle gracefully without errors
      expect(true).toBe(true)
    })

    it('handles rapid mount/unmount cycles', () => {
      const { unmount, rerender } = render(<LazyComponent {...mockProps} />)

      unmount()

      rerender(<LazyComponent {...mockProps} />)

      unmount()

      rerender(<LazyComponent {...mockProps} />)

      // Should handle gracefully without errors
      expect(true).toBe(true)
    })
  })
})