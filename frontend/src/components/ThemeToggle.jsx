// @CODE:UI-UX-DEPLOY-005:THEME - Theme Toggle Component
import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../contexts/ThemeContext';

/**
 * ThemeToggle Component
 * A toggle button for switching between light and dark themes
 * Features smooth animations and accessibility support
 */
export const ThemeToggle = ({
  size = 'md',
  variant = 'default',
  className = '',
  ...props
}) => {
  const { theme, toggleTheme, isDark } = useTheme();

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8';
      case 'lg':
        return 'w-12 h-12';
      case 'xl':
        return 'w-16 h-16';
      case 'md':
      default:
        return 'w-10 h-10';
    }
  };

  const getIconSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      case 'xl':
        return 'w-8 h-8';
      case 'md':
      default:
        return 'w-5 h-5';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return 'border-2 border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800';
      case 'ghost':
        return 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800';
      case 'default':
      default:
        return 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600';
    }
  };

  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'rounded-full',
    'transition-all',
    'duration-200',
    'ease-in-out',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500',
    'focus:ring-offset-2',
    'focus:ring-offset-white',
    'dark:focus:ring-offset-gray-900',
    'cursor-pointer',
    'group',
    getSizeClasses(),
    getVariantClasses(),
    className
  ].filter(Boolean).join(' ');

  const iconClasses = [
    'transition-transform',
    'duration-200',
    'ease-in-out',
    'text-gray-700',
    'dark:text-gray-300',
    getIconSizeClasses()
  ].join(' ');

  const handleClick = () => {
    toggleTheme();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleTheme();
    }
  };

  const ariaLabel = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  const title = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      className={baseClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      title={title}
      tabIndex={0}
      {...props}
    >
      <span className="relative block">
        {/* Sun Icon (visible in dark mode) */}
        <svg
          className={`absolute inset-0 ${iconClasses} ${isDark ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>

        {/* Moon Icon (visible in light mode) */}
        <svg
          className={`absolute inset-0 ${iconClasses} ${!isDark ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </span>

      {/* Visually hidden text for screen readers */}
      <span className="sr-only">{ariaLabel}</span>
    </button>
  );
};

ThemeToggle.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  variant: PropTypes.oneOf(['default', 'outline', 'ghost']),
  className: PropTypes.string
};

ThemeToggle.defaultProps = {
  size: 'md',
  variant: 'default',
  className: ''
};

export default ThemeToggle;