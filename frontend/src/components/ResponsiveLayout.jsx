// @CODE:UI-UX-DEPLOY-005:RESPONSIVE - Responsive Layout Component
import React from 'react';
import PropTypes from 'prop-types';

/**
 * ResponsiveLayout - A responsive container component with consistent spacing
 * Provides mobile-first responsive design with automatic padding and max-width management
 */
export const ResponsiveLayout = ({
  children,
  className = '',
  title,
  subtitle,
  maxWidth = '4xl', // Default to 4xl, but can be customized
  background = 'bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'
}) => {
  const containerClasses = [
    'min-h-screen',
    background,
    'container',
    'mx-auto',
    'px-3', // mobile
    'sm:px-4', // small
    'lg:px-6', // large
    'xl:px-8', // extra large
    'overflow-visible',
    `max-w-${maxWidth}`,
    className
  ].filter(Boolean).join(' ');

  const mainClasses = [
    'py-4', // mobile
    'sm:py-6', // small
    'lg:py-8', // large
    'xl:py-12' // extra large
  ].join(' ');

  return (
    <div className={containerClasses}>
      {title && (
        <header className="mb-6 sm:mb-8 lg:mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-3">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2 sm:px-0">
              {subtitle}
            </p>
          )}
        </header>
      )}

      <main className={mainClasses}>
        {children}
      </main>
    </div>
  );
};

ResponsiveLayout.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  maxWidth: PropTypes.oneOf(['xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', 'full']),
  background: PropTypes.string
};

ResponsiveLayout.defaultProps = {
  className: '',
  title: null,
  subtitle: null,
  maxWidth: '4xl',
  background: 'bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'
};