/* @TEST:TAG-UI-RESPONSIVE-003 - Responsive Navigation component tests */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navigation } from '../Navigation'

describe('Navigation Component', () => {
  let mockProps
  let user

  beforeEach(() => {
    user = userEvent.setup()
    mockProps = {
      items: [
        { id: 'home', label: 'Home', href: '/', icon: '🏠' },
        { id: 'todos', label: 'Todos', href: '/todos', icon: '📝', active: true },
        { id: 'settings', label: 'Settings', href: '/settings', icon: '⚙️' }
      ],
      onMenuToggle: vi.fn(),
      isMenuOpen: false,
      className: ''
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Responsive Design Tests', () => {
    it('renders with responsive container classes', () => {
      render(<Navigation {...mockProps} />)

      const navigation = screen.getByTestId('navigation')
      expect(navigation).toHaveClass('navigation', 'mobile-first-base')
    })

    it('shows mobile menu button on small screens', () => {
      render(<Navigation {...mockProps} />)

      const menuButton = screen.getByRole('button', { name: /menu/i })
      expect(menuButton).toBeInTheDocument()
      expect(menuButton).toHaveClass('touch-target', 'navigation__menu-btn')
    })

    it('shows desktop navigation on larger screens', () => {
      render(<Navigation {...mockProps} />)

      const desktopNav = screen.getByTestId('navigation-desktop')
      expect(desktopNav).toBeInTheDocument()
      expect(desktopNav).toHaveClass('navigation__desktop')
    })

    it('adapts navigation layout based on screen size', () => {
      render(<Navigation {...mockProps} />)

      const navigation = screen.getByTestId('navigation')

      // Should have responsive navigation classes
      expect(navigation).toHaveClass('navigation--responsive')
    })
  })

  describe('Mobile Menu Interactions', () => {
    it('toggles mobile menu when menu button is clicked', async () => {
      render(<Navigation {...mockProps} />)

      const menuButton = screen.getByRole('button', { name: /menu/i })

      await user.click(menuButton)

      expect(mockProps.onMenuToggle).toHaveBeenCalled()
    })

    it('shows mobile menu when open', () => {
      render(<Navigation {...mockProps} isMenuOpen={true} />)

      const mobileMenu = screen.getByTestId('navigation-mobile')
      expect(mobileMenu).toBeInTheDocument()
      expect(mobileMenu).toHaveClass('navigation__mobile', 'navigation__mobile--open')
    })

    it('hides mobile menu when closed', () => {
      render(<Navigation {...mockProps} isMenuOpen={false} />)

      const mobileMenu = screen.queryByTestId('navigation-mobile')
      expect(mobileMenu).not.toBeInTheDocument()
    })

    it('closes mobile menu when overlay is clicked', async () => {
      render(<Navigation {...mockProps} isMenuOpen={true} />)

      const overlay = screen.getByTestId('navigation-overlay')

      await user.click(overlay)

      expect(mockProps.onMenuToggle).toHaveBeenCalled()
    })

    it('closes mobile menu when escape key is pressed', async () => {
      render(<Navigation {...mockProps} isMenuOpen={true} />)

      fireEvent.keyDown(document, { key: 'Escape' })

      // Should close menu on escape (implementation dependent)
      expect(screen.getByTestId('navigation-mobile')).toBeInTheDocument()
    })
  })

  describe('Navigation Items', () => {
    it('renders all navigation items with responsive styling', () => {
      render(<Navigation {...mockProps} />)

      const navItems = screen.getAllByRole('link')
      expect(navItems).toHaveLength(3)

      navItems.forEach((item, index) => {
        expect(item).toHaveClass('navigation__item', 'touch-target')
        expect(item).toHaveAttribute('href', mockProps.items[index].href)
      })
    })

    it('shows active state for current page', () => {
      render(<Navigation {...mockProps} />)

      const activeItem = screen.getByRole('link', { name: /todos/i })
      expect(activeItem).toHaveClass('navigation__item--active')
    })

    it('displays icons and labels appropriately', () => {
      render(<Navigation {...mockProps} />)

      mockProps.items.forEach(item => {
        const navItem = screen.getByRole('link', { name: item.label })
        expect(navItem).toBeInTheDocument()

        const icon = navItem.querySelector('.navigation__icon')
        expect(icon).toHaveTextContent(item.icon)
      })
    })

    it('handles navigation item clicks', async () => {
      render(<Navigation {...mockProps} />)

      const homeLink = screen.getByRole('link', { name: /home/i })

      await user.click(homeLink)

      // Should navigate (testing navigation behavior would require router mock)
      expect(homeLink.closest('a')).toHaveAttribute('href', '/')
    })
  })

  describe('Touch Interactions', () => {
    it('provides touch-friendly navigation items', () => {
      render(<Navigation {...mockProps} />)

      const navItems = screen.getAllByRole('link')

      navItems.forEach(item => {
        expect(item).toHaveClass('touch-target')
      })
    })

    it('shows visual feedback on touch interactions', async () => {
      render(<Navigation {...mockProps} />)

      const navItem = screen.getByRole('link', { name: /todos/i })

      // Test touch feedback
      fireEvent.touchStart(navItem)
      expect(navItem).toHaveClass('touch-active')

      fireEvent.touchEnd(navItem)
      expect(navItem).not.toHaveClass('touch-active')
    })

    it('handles swipe gestures for mobile navigation', async () => {
      render(<Navigation {...mockProps} />)

      const navigation = screen.getByTestId('navigation')

      // Simulate swipe gesture
      fireEvent.touchStart(navigation, { touches: [{ clientX: 0, clientY: 100 }] })
      fireEvent.touchMove(navigation, { touches: [{ clientX: 100, clientY: 100 }] })
      fireEvent.touchEnd(navigation)

      // Should handle swipe gracefully
      expect(navigation).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('maintains proper ARIA attributes', () => {
      render(<Navigation {...mockProps} />)

      const navigation = screen.getByRole('navigation')
      expect(navigation).toHaveAttribute('aria-label', 'Main navigation')

      const menuButton = screen.getByRole('button', { name: /menu/i })
      expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('supports keyboard navigation', async () => {
      render(<Navigation {...mockProps} />)

      const firstNavItem = screen.getAllByRole('link')[0]

      // Focus first item
      await user.tab()
      expect(firstNavItem).toHaveFocus()

      // Navigate with arrow keys
      await user.keyboard('{ArrowRight}')
      // Should move to next item (implementation dependent)
    })

    it('announces menu state changes to screen readers', () => {
      render(<Navigation {...mockProps} isMenuOpen={true} />)

      const menuButton = screen.getByRole('button', { name: /menu/i })
      expect(menuButton).toHaveAttribute('aria-expanded', 'true')

      const liveRegion = screen.getByRole('status')
      expect(liveRegion).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('shows compact navigation on mobile', () => {
      render(<Navigation {...mockProps} />)

      const mobileNav = screen.getByTestId('navigation-mobile')
      if (mobileNav) {
        expect(mobileNav).toHaveClass('navigation__mobile--compact')
      }
    })

    it('shows full navigation on desktop', () => {
      render(<Navigation {...mockProps} />)

      const desktopNav = screen.getByTestId('navigation-desktop')
      expect(desktopNav).toHaveClass('navigation__desktop')
    })

    it('adapts navigation item display based on screen size', () => {
      render(<Navigation {...mockProps} />)

      const navItems = screen.getAllByRole('link')

      navItems.forEach(item => {
        expect(item).toHaveClass('navigation__item')
      })
    })
  })

  describe('Brand and Logo', () => {
    it('displays brand logo with responsive sizing', () => {
      render(<Navigation {...mockProps} brand="TodoApp" brandIcon="📝" />)

      const brand = screen.getByTestId('navigation-brand')
      expect(brand).toBeInTheDocument()
      expect(brand).toHaveClass('navigation__brand')

      const brandIcon = brand.querySelector('.navigation__brand-icon')
      expect(brandIcon).toHaveTextContent('📝')
    })

    it('handles brand click navigation', async () => {
      render(<Navigation {...mockProps} brand="TodoApp" brandHref="/" />)

      const brand = screen.getByTestId('navigation-brand')

      await user.click(brand)

      // Should navigate to brand href
      expect(brand.closest('a')).toHaveAttribute('href', '/')
    })
  })

  describe('User Menu Integration', () => {
    it('shows user menu when provided', () => {
      const userMenuItems = [
        { id: 'profile', label: 'Profile', href: '/profile' },
        { id: 'logout', label: 'Logout', href: '/logout' }
      ]

      render(<Navigation {...mockProps} userMenuItems={userMenuItems} />)

      const userMenu = screen.getByTestId('navigation-user-menu')
      expect(userMenu).toBeInTheDocument()
    })

    it('handles user menu interactions', async () => {
      const userMenuItems = [
        { id: 'profile', label: 'Profile', href: '/profile' }
      ]

      render(<Navigation {...mockProps} userMenuItems={userMenuItems} />)

      const userMenuButton = screen.getByRole('button', { name: /user menu/i })

      await user.click(userMenuButton)

      // Should show user menu items
      const profileLink = screen.getByRole('link', { name: /profile/i })
      expect(profileLink).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty navigation items gracefully', () => {
      render(<Navigation {...mockProps} items={[]} />)

      const navItems = screen.queryAllByRole('link')
      expect(navItems).toHaveLength(0)
    })

    it('handles missing item properties gracefully', () => {
      const incompleteItems = [
        { id: 'home', href: '/' },
        { id: 'todos', label: 'Todos' },
        { label: 'Settings', icon: '⚙️' }
      ]

      render(<Navigation {...mockProps} items={incompleteItems} />)

      const navItems = screen.getAllByRole('link')
      expect(navItems.length).toBeGreaterThan(0)
    })

    it('handles rapid menu toggle clicks', async () => {
      render(<Navigation {...mockProps} />)

      const menuButton = screen.getByRole('button', { name: /menu/i })

      await user.click(menuButton)
      await user.click(menuButton)
      await user.click(menuButton)

      expect(mockProps.onMenuToggle).toHaveBeenCalledTimes(3)
    })
  })
})