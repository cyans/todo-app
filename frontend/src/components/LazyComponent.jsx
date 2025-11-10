/* @CODE:TAG-UI-PERFORMANCE-001 - Lazy loading component for code splitting */

import React, { memo, useState, useEffect, useRef, useCallback, Suspense } from 'react'
import PropTypes from 'prop-types'

// Error boundary for lazy loaded components
class LazyComponentErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('LazyComponent error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.errorFallback || (
        <div className="lazy-component__error" role="alert">
          <h3>Failed to load component</h3>
          <p>{this.state.error?.message || 'Unknown error occurred'}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Retry
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export const LazyComponent = memo(({
  factory,
  fallback = <div>Loading...</div>,
  errorFallback = null,
  className = '',
  delay = 200,
  timeout = 10000,
  shouldLoad = true,
  trigger = null,
  ...props
}) => {
  const [Component, setComponent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showFallback, setShowFallback] = useState(false)

  const timeoutRef = useRef(null)
  const delayRef = useRef(null)
  const mountedRef = useRef(false)

  // Load the component
  const loadComponent = useCallback(async () => {
    if (!factory || Component || loading || !shouldLoad) return

    setLoading(true)
    setError(null)

    // Set up timeout
    timeoutRef.current = setTimeout(() => {
      setError(new Error('Component loading timed out'))
      setLoading(false)
    }, timeout)

    try {
      const module = await factory()
      const component = module.default || module

      if (!mountedRef.current) return

      setComponent(() => component)
      setLoading(false)
      clearTimeout(timeoutRef.current)
    } catch (err) {
      if (!mountedRef.current) return

      setError(err)
      setLoading(false)
      clearTimeout(timeoutRef.current)
    }
  }, [factory, Component, loading, shouldLoad, timeout])

  // Handle delay before showing fallback
  useEffect(() => {
    if (loading && delay > 0) {
      delayRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setShowFallback(true)
        }
      }, delay)
    } else {
      setShowFallback(loading)
    }

    return () => {
      if (delayRef.current) {
        clearTimeout(delayRef.current)
      }
    }
  }, [loading, delay])

  // Auto-load when shouldLoad changes
  useEffect(() => {
    if (shouldLoad && !Component && !loading) {
      loadComponent()
    }
  }, [shouldLoad, Component, loading, loadComponent])

  // Handle trigger
  useEffect(() => {
    if (trigger && typeof trigger === 'function') {
      trigger(loadComponent)
    }
  }, [trigger, loadComponent])

  // Track mount state
  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (delayRef.current) {
        clearTimeout(delayRef.current)
      }
    }
  }, [])

  // Preload function
  const preload = useCallback(() => {
    if (!Component && !loading) {
      loadComponent()
    }
  }, [Component, loading, loadComponent])

  // If component is loaded, render it
  if (Component) {
    return (
      <div
        data-testid="lazy-component"
        className={`lazy-component ${className}`}
        aria-busy="false"
        {...props}
      >
        <LazyComponentErrorBoundary errorFallback={errorFallback}>
          <Component {...props} />
        </LazyComponentErrorBoundary>
      </div>
    )
  }

  // Show fallback or loading state
  if (showFallback && (loading || error)) {
    return (
      <div
        data-testid="lazy-component-loading"
        className={`lazy-component__loading ${className}`}
        aria-live="polite"
        aria-busy="true"
        {...props}
      >
        {error ? (
          <div className="lazy-component__error" role="alert">
            {errorFallback || (
              <div>
                <h4>Failed to load component</h4>
                <p>{error.message}</p>
                <button onClick={loadComponent}>Retry</button>
              </div>
            )}
          </div>
        ) : (
          fallback
        )}
      </div>
    )
  }

  // Return empty placeholder while waiting for delay
  return (
    <div
      data-testid="lazy-component-placeholder"
      className={`lazy-component__placeholder ${className}`}
      aria-hidden="true"
      {...props}
    />
  )
})

LazyComponent.displayName = 'LazyComponent'

LazyComponent.propTypes = {
  factory: PropTypes.func.isRequired,
  fallback: PropTypes.node,
  errorFallback: PropTypes.node,
  className: PropTypes.string,
  delay: PropTypes.number,
  timeout: PropTypes.number,
  shouldLoad: PropTypes.bool,
  trigger: PropTypes.func
}

LazyComponent.defaultProps = {
  fallback: <div>Loading...</div>,
  errorFallback: null,
  className: '',
  delay: 200,
  timeout: 10000,
  shouldLoad: true,
  trigger: null
}

// Higher-order component for easy lazy loading
export const withLazyLoading = (factory, options = {}) => {
  const LazyWrappedComponent = (props) => (
    <LazyComponent
      factory={factory}
      {...options}
      {...props}
    />
  )

  LazyWrappedComponent.displayName = `withLazyLoading(${factory.name || 'Component'})`

  return LazyWrappedComponent
}

// Hook for lazy loading components
export const useLazyComponent = (factory, options = {}) => {
  const [Component, setComponent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadComponent = useCallback(async () => {
    if (!factory || Component || loading) return

    setLoading(true)
    setError(null)

    try {
      const module = await factory()
      const component = module.default || module
      setComponent(() => component)
      setLoading(false)
    } catch (err) {
      setError(err)
      setLoading(false)
    }
  }, [factory, Component, loading])

  useEffect(() => {
    if (options.shouldLoad !== false && !Component) {
      loadComponent()
    }
  }, [loadComponent, options.shouldLoad, Component])

  return { Component, loading, error, loadComponent }
}

export default LazyComponent