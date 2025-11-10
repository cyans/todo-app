// @CODE:UI-UX-DEPLOY-005:UX-ENHANCEMENT - Loading States Components
import React from 'react';
import PropTypes from 'prop-types';

/**
 * LoadingSpinner Component
 * Animated spinning loader
 */
export const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  className = '',
  label = 'Loading',
  showText = false,
  text = 'Loading...',
  animationDuration = 'normal',
  interactive = false
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs': return 'h-4 w-4';
      case 'sm': return 'h-5 w-5';
      case 'lg': return 'h-8 w-8';
      case 'xl': return 'h-12 w-12';
      case 'md':
      default: return 'h-6 w-6';
    }
  };

  const getBorderClasses = () => {
    switch (color) {
      case 'secondary': return 'border-gray-600';
      case 'success': return 'border-green-600';
      case 'warning': return 'border-yellow-600';
      case 'error': return 'border-red-600';
      case 'primary':
      default: return 'border-blue-600';
    }
  };

  const getAnimationDuration = () => {
    switch (animationDuration) {
      case 'slow': return 'duration-1000';
      case 'fast': return 'duration-300';
      case 'normal':
      default: return 'duration-500';
    }
  };

  const Component = interactive ? 'button' : 'div';
  const interactiveProps = interactive ? {
    type: 'button',
    onClick: () => {},
    tabIndex: 0,
    'aria-label': label
  } : {};

  return (
    <Component
      role="status"
      aria-label={label}
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-2 ${className}`}
      {...interactiveProps}
    >
      <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-current ${getSizeClasses()} ${getBorderClasses()} ${getAnimationDuration()}`}></div>
      {showText && (
        <span className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {text}
        </span>
      )}
    </Component>
  );
};

/**
 * LoadingSkeleton Component
 * Placeholder skeleton for loading content
 */
export const LoadingSkeleton = ({
  variant = 'default',
  width = 'w-full',
  height = 'h-4',
  className = ''
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text': return 'h-4 w-full';
      case 'circle': return 'rounded-full';
      case 'rectangular': return 'rounded-md';
      case 'avatar': return 'h-10 w-10 rounded-full';
      case 'button': return 'h-10 w-20 rounded-md';
      case 'default':
      default: return 'rounded';
    }
  };

  const combinedClasses = [
    'animate-pulse',
    'bg-gray-200',
    'dark:bg-gray-700',
    getVariantClasses(),
    width,
    height,
    className
  ].filter(Boolean).join(' ');

  return <div className={combinedClasses} aria-hidden="true" />;
};

/**
 * LoadingProgress Component
 * Progress bar for loading operations
 */
export const LoadingProgress = ({
  value = 0,
  size = 'md',
  color = 'primary',
  showPercentage = false,
  label,
  striped = false,
  className = ''
}) => {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, value));

  const getSizeClasses = () => {
    switch (size) {
      case 'xs': return 'h-1';
      case 'sm': return 'h-2';
      case 'lg': return 'h-3';
      case 'xl': return 'h-4';
      case 'md':
      default: return 'h-2.5';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'secondary': return 'bg-gray-500';
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'primary':
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          {showPercentage && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {clampedValue}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${getSizeClasses()}`}>
        <div
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin="0"
          aria-valuemax="100"
          className={`h-full ${getColorClasses()} rounded-full transition-all duration-300 ease-out ${
            striped ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%] animate-pulse' : ''
          }`}
          style={{ width: `${clampedValue}%` }}
        >
          <span className="sr-only">{clampedValue}% Complete</span>
        </div>
      </div>
    </div>
  );
};

/**
 * LoadingDots Component
 * Animated dots indicator
 */
export const LoadingDots = ({
  size = 'md',
  color = 'primary',
  count = 3,
  className = ''
}) => {
  const getDotSize = () => {
    switch (size) {
      case 'xs': return 'w-1 h-1';
      case 'sm': return 'w-1.5 h-1.5';
      case 'lg': return 'w-3 h-3';
      case 'xl': return 'w-4 h-4';
      case 'md':
      default: return 'w-2 h-2';
    }
  };

  const getDotColor = () => {
    switch (color) {
      case 'secondary': return 'text-gray-600';
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'primary':
      default: return 'text-blue-600';
    }
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      aria-live="polite"
      className={`flex items-center gap-1 ${getDotColor()} ${className}`}
    >
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className={`${getDotSize()} bg-current rounded-full ${
            index === 1 ? 'animate-bounce' : ''
          }`}
          style={{
            animationDelay: index === 1 ? '0ms' : index === 0 ? '150ms' : '300ms'
          }}
        />
      ))}
    </div>
  );
};

/**
 * LoadingPulse Component
 * Pulsing loading indicator
 */
export const LoadingPulse = ({
  size = 'md',
  color = 'primary',
  className = '',
  showText = false,
  text = 'Processing...',
  inline = false
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs': return 'h-4 w-4';
      case 'sm': return 'h-6 w-6';
      case 'lg': return 'h-10 w-10';
      case 'xl': return 'h-12 w-12';
      case 'md':
      default: return 'h-8 w-8';
    }
  };

  const getPulseColor = () => {
    switch (color) {
      case 'secondary': return 'bg-gray-400';
      case 'success': return 'bg-green-400';
      case 'warning': return 'bg-yellow-400';
      case 'error': return 'bg-red-400';
      case 'primary':
      default: return 'bg-blue-400';
    }
  };

  const containerClasses = inline
    ? `inline-flex items-center gap-2 ${className}`
    : `flex flex-col items-center justify-center gap-2 ${className}`;

  return (
    <div
      role="status"
      aria-label="Loading"
      aria-live="polite"
      className={containerClasses}
    >
      <div className="relative">
        <div
          className={`${getSizeClasses()} ${getPulseColor()} rounded-full animate-ping absolute inline-flex h-full w-full opacity-75`}
        ></div>
        <div
          className={`${getSizeClasses()} ${getPulseColor()} rounded-full relative inline-flex`}
        ></div>
      </div>
      {showText && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {text}
        </span>
      )}
    </div>
  );
};

// PropTypes definitions
LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error']),
  className: PropTypes.string,
  label: PropTypes.string,
  showText: PropTypes.bool,
  text: PropTypes.string,
  animationDuration: PropTypes.oneOf(['fast', 'normal', 'slow']),
  interactive: PropTypes.bool
};

LoadingSkeleton.propTypes = {
  variant: PropTypes.oneOf(['default', 'text', 'circle', 'rectangular', 'avatar', 'button']),
  width: PropTypes.string,
  height: PropTypes.string,
  className: PropTypes.string
};

LoadingProgress.propTypes = {
  value: PropTypes.number,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error']),
  showPercentage: PropTypes.bool,
  label: PropTypes.string,
  striped: PropTypes.bool,
  className: PropTypes.string
};

LoadingDots.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error']),
  count: PropTypes.number,
  className: PropTypes.string
};

LoadingPulse.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error']),
  className: PropTypes.string,
  showText: PropTypes.bool,
  text: PropTypes.string,
  inline: PropTypes.bool
};

export default {
  LoadingSpinner,
  LoadingSkeleton,
  LoadingProgress,
  LoadingDots,
  LoadingPulse
};