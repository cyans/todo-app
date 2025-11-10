/* @CODE:TAG-UI-PERFORMANCE-001 - Lazy loading image component */

import React, { memo, useState, useRef, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'

// Check if IntersectionObserver is supported
const hasIntersectionObserver = typeof window !== 'undefined' && 'IntersectionObserver' in window

// Debounce utility for performance
const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

export const LazyImage = memo(({
  src,
  alt,
  srcSet,
  sizes,
  width,
  height,
  placeholder = 'blur',
  className = '',
  loading = 'lazy',
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px',
  responsive = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(!hasIntersectionObserver) // Load immediately if IO not supported
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const imgRef = useRef(null)
  const observerRef = useRef(null)
  const loadTimeoutRef = useRef(null)

  // Handle image load success
  const handleLoad = useCallback((e) => {
    setIsLoaded(true)
    setIsLoading(false)
    setHasError(false)
    onLoad?.(e)
  }, [onLoad])

  // Handle image load error
  const handleError = useCallback((e) => {
    setIsLoading(false)
    setHasError(true)
    onError?.(e)
  }, [onError])

  // Load image function
  const loadImage = useCallback(() => {
    if (!src || hasError || isLoaded) return

    setIsLoading(true)

    // Create new image object to preload
    const img = new Image()

    img.onload = (e) => {
      handleLoad(e)
    }

    img.onerror = (e) => {
      handleError(e)
    }

    // Set timeout for network issues
    loadTimeoutRef.current = setTimeout(() => {
      handleError(new Error('Image load timeout'))
    }, 10000) // 10 second timeout

    // Start loading
    if (srcSet) {
      img.srcset = srcSet
    }
    img.src = src
  }, [src, srcSet, hasError, isLoaded, handleLoad, handleError])

  // Debounced intersection handler for performance
  const handleIntersection = useCallback(debounce((entries) => {
    const [entry] = entries

    if (entry.isIntersecting) {
      setIsInView(true)

      // Stop observing once loaded
      if (observerRef.current) {
        observerRef.current.unobserve(entry.target)
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, 100), [])

  // Set up IntersectionObserver
  useEffect(() => {
    if (!hasIntersectionObserver || !imgRef.current || isInView) return

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin
    })

    observerRef.current.observe(imgRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [hasIntersectionObserver, isInView, handleIntersection, threshold, rootMargin])

  // Load image when in view
  useEffect(() => {
    if (isInView && !isLoaded && !hasError) {
      loadImage()
    }
  }, [isInView, isLoaded, hasError, loadImage])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
      }
    }
  }, [])

  // Generate placeholder styles
  const getPlaceholderStyles = useCallback(() => {
    const baseStyles = {
      width: width ? `${width}px` : '100%',
      height: height ? `${height}px` : 'auto',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative'
    }

    switch (placeholder) {
      case 'blur':
        return {
          ...baseStyles,
          filter: 'blur(10px)',
          transform: 'scale(1.1)',
          backgroundImage: `url(${src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }
      case 'color':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }
      case 'skeleton':
        return {
          ...baseStyles,
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'skeleton-loading 1.5s infinite'
        }
      default:
        return baseStyles
    }
  }, [placeholder, width, height, src])

  // If image is loaded and has no error
  if (isLoaded && !hasError) {
    return (
      <div
        data-testid="lazy-image-loaded"
        className={`
          lazy-image__loaded
          ${responsive ? 'lazy-image--responsive' : ''}
          ${className}
        `}
        {...props}
      >
        <picture>
          {srcSet && (
            <source
              srcSet={srcSet}
              sizes={sizes}
            />
          )}
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={loading}
            className="lazy-image__img"
            style={{
              width: responsive ? '100%' : width,
              height: responsive ? 'auto' : height,
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </picture>
      </div>
    )
  }

  // If there's an error
  if (hasError) {
    return (
      <div
        data-testid="lazy-image-error"
        className={`
          lazy-image__error
          ${responsive ? 'lazy-image--responsive' : ''}
          ${className}
        `}
        style={getPlaceholderStyles()}
        role="img"
        aria-label={alt || 'Failed to load image'}
        {...props}
      >
        <div className="lazy-image__error-content">
          <span className="lazy-image__error-icon" aria-hidden="true">
            ⚠️
          </span>
          <span className="lazy-image__error-text">
            Failed to load image
          </span>
        </div>
      </div>
    )
  }

  // Show placeholder or loading state
  return (
    <div
      ref={imgRef}
      data-testid="lazy-image"
      className={`
        lazy-image
        lazy-image--${placeholder}
        ${responsive ? 'lazy-image--responsive' : ''}
        ${isLoading ? 'lazy-image--loading' : ''}
        ${className}
      `}
      style={getPlaceholderStyles()}
      role="img"
      aria-label={alt}
      {...props}
    >
      {isLoading && (
        <div data-testid="lazy-image-loading" className="lazy-image__loading-overlay">
          <div className="lazy-image__spinner" aria-hidden="true" />
          <span className="sr-only">Loading image</span>
        </div>
      )}

      {placeholder === 'blur' && !isLoading && (
        <div className="lazy-image__blur-placeholder" aria-hidden="true" />
      )}

      {placeholder === 'skeleton' && (
        <div className="lazy-image__skeleton-shimmer" aria-hidden="true" />
      )}

      {/* Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        {isLoading ? 'Loading image' : hasError ? 'Failed to load image' : 'Image loaded'}
      </div>
    </div>
  )
})

LazyImage.displayName = 'LazyImage'

LazyImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  srcSet: PropTypes.string,
  sizes: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  placeholder: PropTypes.oneOf(['blur', 'color', 'skeleton', 'none']),
  className: PropTypes.string,
  loading: PropTypes.oneOf(['lazy', 'eager']),
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  threshold: PropTypes.number,
  rootMargin: PropTypes.string,
  responsive: PropTypes.bool
}

LazyImage.defaultProps = {
  srcSet: null,
  sizes: null,
  width: null,
  height: null,
  placeholder: 'blur',
  className: '',
  loading: 'lazy',
  onLoad: null,
  onError: null,
  threshold: 0.1,
  rootMargin: '50px',
  responsive: false
}