// @CODE:UI-UX-DEPLOY-005:UX-ENHANCEMENT - Toast Notification System
import React, { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

// Toast Context
const ToastContext = createContext(null);

/**
 * Custom hook to use toast functionality
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

/**
 * Individual Toast Component
 */
const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef(null);
  const progressBarRef = useRef(null);

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);

    // Set up auto-dismiss timer
    if (toast.duration > 0) {
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
        // Allow exit animation to complete before removing
        setTimeout(() => onRemove(toast.id), 300);
      }, toast.duration);

      // Update progress bar if duration is specified
      if (progressBarRef.current && toast.showProgress) {
        progressBarRef.current.style.transition = `width ${toast.duration}ms linear`;
        setTimeout(() => {
          if (progressBarRef.current) {
            progressBarRef.current.style.width = '0%';
          }
        }, 100);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [toast.duration, toast.showProgress, onRemove, toast.id]);

  const getVariantClasses = () => {
    const baseClasses = 'max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden';
    const variantClasses = {
      default: 'border-l-4 border-gray-500',
      success: 'border-l-4 border-green-500',
      error: 'border-l-4 border-red-500',
      warning: 'border-l-4 border-yellow-500',
      info: 'border-l-4 border-blue-500'
    };
    return `${baseClasses} ${variantClasses[toast.variant] || variantClasses.default}`;
  };

  const getIcon = () => {
    const iconClasses = 'flex-shrink-0 w-6 h-6';

    switch (toast.variant) {
      case 'success':
        return (
          <svg className={`${iconClasses} text-green-600 dark:text-green-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className={`${iconClasses} text-red-600 dark:text-red-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className={`${iconClasses} text-yellow-600 dark:text-yellow-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className={`${iconClasses} text-blue-600 dark:text-blue-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const handleAction = () => {
    if (toast.action?.onClick) {
      toast.action.onClick();
    }
    handleDismiss();
  };

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div className={getVariantClasses()}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="ml-3 w-0 flex-1">
              {toast.title && (
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {toast.title}
                </p>
              )}
              <p className={`text-sm ${toast.title ? 'mt-1' : ''} text-gray-600 dark:text-gray-400`}>
                {toast.message}
              </p>
              {toast.action && (
                <div className="mt-3">
                  <button
                    onClick={handleAction}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 focus:outline-none focus:underline"
                  >
                    {toast.action.label}
                  </button>
                </div>
              )}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus:text-gray-600 dark:focus:text-gray-200 transition-colors duration-200"
                onClick={handleDismiss}
                aria-label="Dismiss notification"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {toast.showProgress && toast.duration > 0 && (
          <div className="h-1 bg-gray-200 dark:bg-gray-700">
            <div
              ref={progressBarRef}
              className="h-full bg-current opacity-75"
              style={{ width: '100%' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

Toast.propTypes = {
  toast: PropTypes.shape({
    id: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    title: PropTypes.string,
    variant: PropTypes.oneOf(['default', 'success', 'error', 'warning', 'info']),
    duration: PropTypes.number,
    action: PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func
    }),
    showProgress: PropTypes.bool
  }).isRequired,
  onRemove: PropTypes.func.isRequired
};

/**
 * Toast Container Component
 */
const ToastContainer = ({ toasts, onRemove, position = 'top-right' }) => {
  const getPositionClasses = () => {
    const positions = {
      'top-right': 'top-0 right-0',
      'top-left': 'top-0 left-0',
      'bottom-right': 'bottom-0 right-0',
      'bottom-left': 'bottom-0 left-0',
      'top-center': 'top-0 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-0 left-1/2 transform -translate-x-1/2'
    };
    return positions[position] || positions['top-right'];
  };

  return (
    <div
      className={`fixed z-50 p-4 pointer-events-none ${getPositionClasses()}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex flex-col space-y-2 pointer-events-auto">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
};

ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRemove: PropTypes.func.isRequired,
  position: PropTypes.oneOf(['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'])
};

/**
 * Toast Provider Component
 */
export const ToastProvider = ({ children, maxToasts = 5, defaultPosition = 'top-right' }) => {
  const [toasts, setToasts] = useState([]);
  const toastCounter = useRef(0);

  const addToast = useCallback((message, options = {}) => {
    const id = options.id || `toast-${++toastCounter.current}`;
    const newToast = {
      id,
      message,
      variant: options.variant || 'default',
      duration: options.duration !== undefined ? options.duration : 5000,
      title: options.title,
      action: options.action,
      showProgress: options.showProgress || false,
      position: options.position || defaultPosition,
      ...options
    };

    setToasts((currentToasts) => {
      const filteredToasts = currentToasts.filter((t) => t.position === newToast.position);
      const updatedToasts = [...filteredToasts, newToast];

      // Limit number of toasts
      if (updatedToasts.length > maxToasts) {
        return updatedToasts.slice(-maxToasts);
      }

      return updatedToasts;
    });

    return id;
  }, [maxToasts, defaultPosition]);

  const removeToast = useCallback((id) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const clear = useCallback(() => {
    setToasts([]);
  }, []);

  const toast = {
    success: (message, options = {}) => addToast(message, { ...options, variant: 'success' }),
    error: (message, options = {}) => addToast(message, { ...options, variant: 'error' }),
    warning: (message, options = {}) => addToast(message, { ...options, variant: 'warning' }),
    info: (message, options = {}) => addToast(message, { ...options, variant: 'info' }),
    custom: (message, options = {}) => addToast(message, options),
    dismiss: (id) => removeToast(id),
    clear
  };

  // Group toasts by position
  const toastsByPosition = toasts.reduce((acc, toast) => {
    if (!acc[toast.position]) {
      acc[toast.position] = [];
    }
    acc[toast.position].push(toast);
    return acc;
  }, {});

  const value = {
    toast,
    addToast,
    removeToast,
    clear,
    toasts
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
        <ToastContainer
          key={position}
          toasts={positionToasts}
          onRemove={removeToast}
          position={position}
        />
      ))}
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
  maxToasts: PropTypes.number,
  defaultPosition: PropTypes.oneOf(['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'])
};

export default ToastProvider;