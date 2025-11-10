/* @CODE:TAG-UI-RESPONSIVE-003 - Responsive Navigation component */

import React, { memo, useState, useCallback, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'

export const Navigation = memo(({
  items = [],
  brand = null,
  brandIcon = null,
  brandHref = '/',
  userMenuItems = [],
  onMenuToggle,
  isMenuOpen = false,
  className = '',
  ...props
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  const menuButtonRef = useRef(null)
  const userMenuButtonRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const userMenuRef = useRef(null)

  // Minimum swipe distance for mobile navigation
  const minSwipeDistance = 50

  // Handle mobile menu toggle
  const handleMenuToggle = useCallback(() => {
    onMenuToggle?.(!isMenuOpen)
  }, [isMenuOpen, onMenuToggle])

  // Handle user menu toggle
  const handleUserMenuToggle = useCallback(() => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }, [isUserMenuOpen])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close mobile menu if clicking outside
      if (isMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        onMenuToggle?.(false)
      }

      // Close user menu if clicking outside
      if (isUserMenuOpen && userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen, isUserMenuOpen, onMenuToggle])

  // Handle escape key to close menus
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (isMenuOpen) {
          onMenuToggle?.(false)
        }
        if (isUserMenuOpen) {
          setIsUserMenuOpen(false)
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMenuOpen, isUserMenuOpen, onMenuToggle])

  // Touch gesture handling for mobile navigation
  const handleTouchStart = useCallback((e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }, [])

  const handleTouchMove = useCallback((e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance

    // Swipe left to close menu on mobile
    if (isLeftSwipe && isMenuOpen) {
      onMenuToggle?.(false)
    }
  }, [touchStart, touchEnd, minSwipeDistance, isMenuOpen, onMenuToggle])

  // Handle navigation item click
  const handleNavItemClick = useCallback((item) => {
    // Close mobile menu after navigation
    if (isMenuOpen) {
      onMenuToggle?.(false)
    }
  }, [isMenuOpen, onMenuToggle])

  return (
    <nav
      data-testid="navigation"
      className={`
        navigation
        mobile-first-base
        ${isMenuOpen ? 'navigation--menu-open' : ''}
        ${className}
      `}
      role="navigation"
      aria-label="Main navigation"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          data-testid="navigation-overlay"
          className="navigation__overlay"
          onClick={handleMenuToggle}
          aria-hidden="true"
        />
      )}

      {/* Desktop Navigation */}
      <div data-testid="navigation-desktop" className="navigation__desktop">
        <div className="navigation__container">
          {/* Brand */}
          {brand && (
            <a
              data-testid="navigation-brand"
              href={brandHref}
              className="navigation__brand touch-target"
              onClick={() => handleNavItemClick({ href: brandHref })}
            >
              {brandIcon && (
                <span className="navigation__brand-icon" aria-hidden="true">
                  {brandIcon}
                </span>
              )}
              <span className="navigation__brand-text responsive-text">
                {brand}
              </span>
            </a>
          )}

          {/* Main Navigation Items */}
          <ul className="navigation__items" role="menubar">
            {items.map((item) => (
              <li key={item.id} role="none">
                <a
                  href={item.href}
                  className={`
                    navigation__item
                    touch-target
                    ${item.active ? 'navigation__item--active' : ''}
                  `}
                  role="menuitem"
                  aria-current={item.active ? 'page' : undefined}
                  onClick={() => handleNavItemClick(item)}
                >
                  {item.icon && (
                    <span className="navigation__icon" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  <span className="navigation__label responsive-text">
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {/* User Menu */}
          {userMenuItems.length > 0 && (
            <div
              ref={userMenuRef}
              className="navigation__user-menu"
            >
              <button
                ref={userMenuButtonRef}
                className="touch-target navigation__user-menu-btn"
                onClick={handleUserMenuToggle}
                aria-label="User menu"
                aria-expanded={isUserMenuOpen}
              >
                <span className="navigation__user-avatar" aria-hidden="true">
                  👤
                </span>
                <span className="navigation__user-arrow">
                  {isUserMenuOpen ? '▲' : '▼'}
                </span>
              </button>

              {isUserMenuOpen && (
                <ul
                  className="navigation__user-menu-items"
                  role="menu"
                >
                  {userMenuItems.map((item) => (
                    <li key={item.id} role="none">
                      <a
                        href={item.href}
                        className="touch-target navigation__user-menu-item"
                        role="menuitem"
                        onClick={() => {
                          setIsUserMenuOpen(false)
                          handleNavItemClick(item)
                        }}
                      >
                        {item.icon && (
                          <span className="navigation__icon" aria-hidden="true">
                            {item.icon}
                          </span>
                        )}
                        <span className="navigation__label responsive-text">
                          {item.label}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        ref={menuButtonRef}
        className="touch-target navigation__menu-btn"
        onClick={handleMenuToggle}
        aria-label="Toggle navigation menu"
        aria-expanded={isMenuOpen}
      >
        <span className="navigation__menu-icon" aria-hidden="true">
          {isMenuOpen ? '✕' : '☰'}
        </span>
      </button>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div
          ref={mobileMenuRef}
          data-testid="navigation-mobile"
          className="navigation__mobile navigation__mobile--open"
          role="menu"
        >
          <div className="navigation__mobile-header">
            {brand && (
              <div className="navigation__mobile-brand">
                {brandIcon && (
                  <span className="navigation__brand-icon" aria-hidden="true">
                    {brandIcon}
                  </span>
                )}
                <span className="navigation__brand-text responsive-text">
                  {brand}
                </span>
              </div>
            )}
          </div>

          <ul className="navigation__mobile-items">
            {items.map((item) => (
              <li key={item.id} role="none">
                <a
                  href={item.href}
                  className={`
                    navigation__mobile-item
                    touch-target
                    ${item.active ? 'navigation__mobile-item--active' : ''}
                  `}
                  role="menuitem"
                  aria-current={item.active ? 'page' : undefined}
                  onClick={() => handleNavItemClick(item)}
                >
                  {item.icon && (
                    <span className="navigation__icon" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  <span className="navigation__label responsive-text">
                    {item.label}
                  </span>
                  {item.active && (
                    <span className="navigation__active-indicator" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </a>
              </li>
            ))}

            {/* Mobile User Menu */}
            {userMenuItems.length > 0 && (
              <>
                <div className="navigation__mobile-divider" />
                {userMenuItems.map((item) => (
                  <li key={item.id} role="none">
                    <a
                      href={item.href}
                      className="navigation__mobile-item touch-target"
                      role="menuitem"
                      onClick={() => handleNavItemClick(item)}
                    >
                      {item.icon && (
                        <span className="navigation__icon" aria-hidden="true">
                          {item.icon}
                        </span>
                      )}
                      <span className="navigation__label responsive-text">
                        {item.label}
                      </span>
                    </a>
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>
      )}

      {/* Screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite">
        {isMenuOpen && 'Navigation menu is open'}
        {isUserMenuOpen && 'User menu is open'}
      </div>
    </nav>
  )
})

Navigation.displayName = 'Navigation'

Navigation.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
      icon: PropTypes.string,
      active: PropTypes.bool
    })
  ),
  brand: PropTypes.string,
  brandIcon: PropTypes.string,
  brandHref: PropTypes.string,
  userMenuItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
      icon: PropTypes.string
    })
  ),
  onMenuToggle: PropTypes.func,
  isMenuOpen: PropTypes.bool,
  className: PropTypes.string
}

Navigation.defaultProps = {
  items: [],
  brand: null,
  brandIcon: null,
  brandHref: '/',
  userMenuItems: [],
  isMenuOpen: false,
  className: ''
}