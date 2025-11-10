// @CODE:UI-UX-DEPLOY-005:RESPONSIVE - Mobile Optimized Card Component
import React, { useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * MobileOptimizedCard - A responsive card component optimized for mobile devices
 * Features touch-friendly sizing, responsive padding, and accessibility
 */
export const MobileOptimizedCard = ({
  children,
  title,
  subtitle,
  timestamp,
  actions = [],
  loading = false,
  onClick,
  variant = 'default',
  className = '',
  'aria-label': ariaLabel,
  ...props
}) => {
  const cardRef = useRef(null);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (event) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'highlighted':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
      default:
        return 'bg-white dark:bg-gray-800';
    }
  };

  const baseClasses = [
    'rounded-2xl',
    'shadow-lg',
    'border',
    'border-gray-100',
    'dark:border-gray-700',
    'overflow-hidden',
    'transition-all',
    'duration-200',
    'p-3', // mobile
    'sm:p-4', // small
    'lg:p-6', // large
    getVariantClasses(),
    className
  ].filter(Boolean).join(' ');

  const interactiveClasses = onClick
    ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
    : '';

  const cardClasses = [baseClasses, interactiveClasses].join(' ');

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return null;
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return timestamp;
    }
  };

  return (
    <article
      ref={cardRef}
      className={cardClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      {...props}
    >
      {/* Header Section */}
      {(title || subtitle || timestamp) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-1 truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>
          {timestamp && (
            <div className="flex-shrink-0">
              <time className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 whitespace-nowrap">
                {formatTimestamp(timestamp)}
              </time>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8" data-testid="loading-spinner">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading...</span>
        </div>
      )}

      {/* Content */}
      {!loading && (
        <div className="space-y-4">
          {children}
        </div>
      )}

      {/* Action Buttons */}
      {actions.length > 0 && !loading && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={action.disabled}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

MobileOptimizedCard.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  timestamp: PropTypes.string,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      disabled: PropTypes.bool
    })
  ),
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'highlighted', 'warning', 'error', 'success']),
  className: PropTypes.string,
  'aria-label': PropTypes.string
};

MobileOptimizedCard.defaultProps = {
  children: null,
  title: null,
  subtitle: null,
  timestamp: null,
  actions: [],
  loading: false,
  onClick: null,
  variant: 'default',
  className: '',
  'aria-label': null
};