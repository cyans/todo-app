// @CODE:UI-UX-DEPLOY-005:UX-ENHANCEMENT - Error Boundary Component
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * ErrorBoundary Component
 * Catches JavaScript errors in child component tree and displays a fallback UI
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to console
    if (this.props.enableLogging) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call error callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback(this.state.error || new Error('Unknown error'), this.resetError)
          : this.props.fallback;
      }

      return (
        <div className={`min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 ${this.props.className || ''}`}>
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {this.props.title || 'Something went wrong'}
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {this.props.message || 'An unexpected error occurred. Please try again or contact support if the problem persists.'}
            </p>

            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Error Details
                </summary>
                <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error?.toString() || 'Unknown error'}
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {this.props.showReset !== false && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.resetError}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
                >
                  Try Again
                </button>

                {this.props.showHomeButton && (
                  <button
                    onClick={() => window.location.href = '/'}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
                  >
                    Go Home
                  </button>
                )}
              </div>
            )}

            {this.props.supportContact && (
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Need help? Contact{' '}
                <a
                  href={`mailto:${this.props.supportContact}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {this.props.supportContact}
                </a>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  onError: PropTypes.func,
  title: PropTypes.string,
  message: PropTypes.string,
  showReset: PropTypes.bool,
  showHomeButton: PropTypes.bool,
  enableLogging: PropTypes.bool,
  supportContact: PropTypes.string,
  className: PropTypes.string
};

ErrorBoundary.defaultProps = {
  fallback: null,
  onError: null,
  title: 'Something went wrong',
  message: null,
  showReset: true,
  showHomeButton: false,
  enableLogging: true,
  supportContact: null,
  className: ''
};

export default ErrorBoundary;