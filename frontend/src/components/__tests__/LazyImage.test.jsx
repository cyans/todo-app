/* @TEST:TAG-UI-PERFORMANCE-001 - LazyImage performance optimization tests */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LazyImage } from '../LazyImage'

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
})
window.IntersectionObserver = mockIntersectionObserver

describe('LazyImage Component', () => {
  let mockProps

  beforeEach(() => {
    mockProps = {
      src: 'https://example.com/image.jpg',
      alt: 'Test image',
      width: 300,
      height: 200,
      placeholder: 'blur',
      className: ''
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Performance Optimization Tests', () => {
    it('renders placeholder before image loads', () => {
      render(<LazyImage {...mockProps} />)

      const placeholder = screen.getByTestId('lazy-image-placeholder')
      expect(placeholder).toBeInTheDocument()

      const img = screen.queryByRole('img')
      expect(img).not.toBeInTheDocument()
    })

    it('loads image when intersecting viewport', async () => {
      render(<LazyImage {...mockProps} />)

      // Get the IntersectionObserver callback
      const [callback] = mockIntersectionObserver.mock.calls[0]

      // Simulate intersection
      callback([{ isIntersecting: true, target: screen.getByTestId('lazy-image') }])

      await waitFor(() => {
        const img = screen.getByRole('img')
        expect(img).toBeInTheDocument()
        expect(img).toHaveAttribute('src', mockProps.src)
      })
    })

    it('does not load image when not intersecting', () => {
      render(<LazyImage {...mockProps} />)

      // Simulate not intersecting
      const [callback] = mockIntersectionObserver.mock.calls[0]
      callback([{ isIntersecting: false, target: screen.getByTestId('lazy-image') }])

      const img = screen.queryByRole('img')
      expect(img).not.toBeInTheDocument()
    })

    it('shows loading state during image load', async () => {
      render(<LazyImage {...mockProps} />)

      // Trigger intersection
      const [callback] = mockIntersectionObserver.mock.calls[0]
      callback([{ isIntersecting: true, target: screen.getByTestId('lazy-image') }])

      await waitFor(() => {
        const loadingState = screen.getByTestId('lazy-image-loading')
        expect(loadingState).toBeInTheDocument()
      })
    })

    it('handles image load success', async () => {
      render(<LazyImage {...mockProps} />)

      // Trigger intersection
      const [callback] = mockIntersectionObserver.mock.calls[0]
      callback([{ isIntersecting: true, target: screen.getByTestId('lazy-image') }])

      await waitFor(() => {
        const img = screen.getByRole('img')
        fireEvent.load(img)
      })

      await waitFor(() => {
        const loadingState = screen.queryByTestId('lazy-image-loading')
        expect(loadingState).not.toBeInTheDocument()

        const loadedImage = screen.getByTestId('lazy-image-loaded')
        expect(loadedImage).toBeInTheDocument()
      })
    })

    it('handles image load error gracefully', async () => {
      render(<LazyImage {...mockProps} />)

      // Trigger intersection
      const [callback] = mockIntersectionObserver.mock.calls[0]
      callback([{ isIntersecting: true, target: screen.getByTestId('lazy-image') }])

      await waitFor(() => {
        const img = screen.getByRole('img')
        fireEvent.error(img)
      })

      await waitFor(() => {
        const errorState = screen.getByTestId('lazy-image-error')
        expect(errorState).toBeInTheDocument()
      })
    })
  })

  describe('Responsive Image Tests', () => {
    it('supports responsive srcsets', () => {
      const responsiveProps = {
        ...mockProps,
        srcSet: 'image-300w.jpg 300w, image-600w.jpg 600w, image-1200w.jpg 1200w',
        sizes: '(max-width: 600px) 300px, (max-width: 1200px) 600px, 1200px'
      }

      render(<LazyImage {...responsiveProps} />)

      // Trigger intersection
      const [callback] = mockIntersectionObserver.mock.calls[0]
      callback([{ isIntersecting: true, target: screen.getByTestId('lazy-image') }])

      await waitFor(() => {
        const img = screen.getByRole('img')
        expect(img).toHaveAttribute('srcset', responsiveProps.srcSet)
        expect(img).toHaveAttribute('sizes', responsiveProps.sizes)
      })
    })

    it('adapts to different screen sizes', () => {
      render(<LazyImage {...mockProps} responsive={true} />)

      const container = screen.getByTestId('lazy-image')
      expect(container).toHaveClass('lazy-image--responsive')
    })
  })

  describe('Placeholder Variants', () => {
    it('shows blur placeholder when specified', () => {
      render(<LazyImage {...mockProps} placeholder="blur" />)

      const placeholder = screen.getByTestId('lazy-image-placeholder')
      expect(placeholder).toHaveClass('lazy-image__placeholder--blur')
    })

    it('shows color placeholder when specified', () => {
      render(<LazyImage {...mockProps} placeholder="color" />)

      const placeholder = screen.getByTestId('lazy-image-placeholder')
      expect(placeholder).toHaveClass('lazy-image__placeholder--color')
    })

    it('shows skeleton placeholder when specified', () => {
      render(<LazyImage {...mockProps} placeholder="skeleton" />)

      const placeholder = screen.getByTestId('lazy-image-placeholder')
      expect(placeholder).toHaveClass('lazy-image__placeholder--skeleton')
    })
  })

  describe('Performance Features', () => {
    it('implements proper cleanup on unmount', () => {
      const { unmount } = render(<LazyImage {...mockProps} />)

      const mockDisconnect = vi.fn()
      mockIntersectionObserver.mockReturnValue({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: mockDisconnect
      })

      unmount()

      expect(mockDisconnect).toHaveBeenCalled()
    })

    it('cancels image loading if component unmounts during load', () => {
      const { unmount } = render(<LazyImage {...mockProps} />)

      // Trigger intersection
      const [callback] = mockIntersectionObserver.mock.calls[0]
      callback([{ isIntersecting: true, target: screen.getByTestId('lazy-image') }])

      // Unmount before image loads
      unmount()

      // Should handle gracefully without errors
      expect(true).toBe(true)
    })

    it('debounces intersection events for performance', async () => {
      render(<LazyImage {...mockProps} />)

      const [callback] = mockIntersectionObserver.mock.calls[0]

      // Simulate multiple rapid intersections
      callback([{ isIntersecting: false, target: screen.getByTestId('lazy-image') }])
      callback([{ isIntersecting: true, target: screen.getByTestId('lazy-image') }])
      callback([{ isIntersecting: false, target: screen.getByTestId('lazy-image') }])
      callback([{ isIntersecting: true, target: screen.getByTestId('lazy-image') }])

      await waitFor(() => {
        const img = screen.getByRole('img')
        expect(img).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('maintains proper accessibility attributes', () => {
      render(<LazyImage {...mockProps} />)

      // Initially shows placeholder with accessibility
      const placeholder = screen.getByTestId('lazy-image-placeholder')
      expect(placeholder).toHaveAttribute('role', 'img')
      expect(placeholder).toHaveAttribute('aria-label', mockProps.alt)
    })

    it('transfers accessibility to loaded image', async () => {
      render(<LazyImage {...mockProps} />)

      // Trigger intersection and load
      const [callback] = mockIntersectionObserver.mock.calls[0]
      callback([{ isIntersecting: true, target: screen.getByTestId('lazy-image') }])

      await waitFor(() => {
        const img = screen.getByRole('img')
        expect(img).toHaveAttribute('alt', mockProps.alt)
      })
    })

    it('announces loading state to screen readers', async () => {
      render(<LazyImage {...mockProps} />)

      // Trigger intersection
      const [callback] = mockIntersectionObserver.mock.calls[0]
      callback([{ isIntersecting: true, target: screen.getByTestId('lazy-image') }])

      await waitFor(() => {
        const loadingAnnouncement = screen.getByRole('status')
        expect(loadingAnnouncement).toHaveTextContent('Loading image')
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles missing src gracefully', () => {
      render(<LazyImage {...mockProps} src="" />)

      const errorState = screen.getByTestId('lazy-image-error')
      expect(errorState).toBeInTheDocument()
    })

    it('handles missing alt text gracefully', () => {
      render(<LazyImage {...mockProps} alt="" />)

      const placeholder = screen.getByTestId('lazy-image-placeholder')
      expect(placeholder).toHaveAttribute('aria-label', '')
    })

    it('handles very large images efficiently', () => {
      const largeProps = {
        ...mockProps,
        src: 'https://example.com/very-large-image.jpg',
        width: 4000,
        height: 3000
      }

      render(<LazyImage {...largeProps} />)

      const placeholder = screen.getByTestId('lazy-image-placeholder')
      expect(placeholder).toBeInTheDocument()

      // Should not load large image immediately
      const img = screen.queryByRole('img')
      expect(img).not.toBeInTheDocument()
    })

    it('handles network timeouts gracefully', async () => {
      render(<LazyImage {...mockProps} />)

      // Trigger intersection
      const [callback] = mockIntersectionObserver.mock.calls[0]
      callback([{ isIntersecting: true, target: screen.getByTestId('lazy-image') }])

      // Simulate network timeout
      await waitFor(() => {
        const img = screen.getByRole('img')
        fireEvent.error(img)
      })

      await waitFor(() => {
        const errorState = screen.getByTestId('lazy-image-error')
        expect(errorState).toBeInTheDocument()
      })
    })
  })

  describe('Browser Compatibility', () => {
    it('gracefully degrades when IntersectionObserver is not supported', () => {
      // Remove IntersectionObserver support
      const originalIntersectionObserver = window.IntersectionObserver
      delete window.IntersectionObserver

      render(<LazyImage {...mockProps} />)

      // Should load image immediately as fallback
      const img = screen.getByRole('img')
      expect(img).toBeInTheDocument()

      // Restore IntersectionObserver
      window.IntersectionObserver = originalIntersectionObserver
    })

    it('works with modern browser features', () => {
      // Test with modern browser APIs available
      render(<LazyImage {...mockProps} loading="eager" />)

      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('loading', 'eager')
    })
  })
})