/**
 * @TEST:TAG-UI-RESPONSIVE-001
 * Tests for mobile-first responsive design system
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Mobile-First Responsive Design System', () => {
  let cssContent;
  let styleElement;

  beforeEach(() => {
    // Load CSS content
    const cssPath = path.resolve(__dirname, './responsive.css');
    cssContent = fs.readFileSync(cssPath, 'utf8');

    // Add CSS to document
    styleElement = document.createElement('style');
    styleElement.textContent = cssContent;
    document.head.appendChild(styleElement);

    // Add test elements
    document.body.innerHTML = `
      <div class="mobile-first-base">Mobile First Base</div>
      <div class="tablet-enhancement">Tablet Enhancement</div>
      <div class="desktop-enhancement">Desktop Enhancement</div>
      <button class="touch-target">Touch Button</button>
      <p class="responsive-text">Responsive Text</p>
      <div class="container">Container</div>
      <div class="grid">Grid</div>
      <section class="section">Section</section>
    `;
  });

  afterEach(() => {
    // Clean up
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }
    document.body.innerHTML = '';
  });

  describe('Mobile-First Base Styles', () => {
    it('should apply base styles without media queries', () => {
      const element = document.querySelector('.mobile-first-base');
      const styles = window.getComputedStyle(element);

      // These should be applied by default (mobile-first)
      expect(styles.padding).toBe('16px'); // 1rem = 16px
      expect(styles.fontSize).toBe('16px'); // 1rem = 16px
      expect(styles.width).toBe('100%');
      expect(styles.boxSizing).toBe('border-box');
    });

    it('should have mobile-optimized container by default', () => {
      const container = document.querySelector('.container');
      const styles = window.getComputedStyle(container);

      expect(styles.width).toBe('100%');
      expect(styles.paddingLeft).toBe('16px'); // 1rem = 16px
      expect(styles.paddingRight).toBe('16px');
      expect(styles.marginLeft).toBe('auto');
      expect(styles.marginRight).toBe('auto');
    });
  });

  describe('Touch-Friendly Interactions', () => {
    it('should meet minimum touch target requirements', () => {
      const button = document.querySelector('.touch-target');
      const styles = window.getComputedStyle(button);

      // WCAG guidelines: minimum 44x44px touch targets
      expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44);
      expect(parseInt(styles.minWidth)).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Responsive Typography', () => {
    it('should have mobile-optimized typography by default', () => {
      const text = document.querySelector('.responsive-text');
      const styles = window.getComputedStyle(text);

      expect(styles.fontSize).toBe('16px'); // 1rem = 16px
      expect(styles.lineHeight).toBe('1.5');
    });
  });

  describe('Media Query Enhancement', () => {
    it('should apply tablet enhancements at 640px and up', () => {
      // Check that media query rules exist in the CSS content
      expect(cssContent).toContain('@media (min-width: 640px)');
      expect(cssContent).toContain('.tablet-enhancement');
      expect(cssContent).toContain('padding: var(--space-lg)');
      expect(cssContent).toContain('font-size: var(--font-size-lg)');
    });

    it('should apply desktop enhancements at 1024px and up', () => {
      expect(cssContent).toContain('@media (min-width: 1024px)');
      expect(cssContent).toContain('.desktop-enhancement');
      expect(cssContent).toContain('padding: var(--space-xl)');
      expect(cssContent).toContain('font-size: var(--font-size-xl)');
    });
  });

  describe('Breakpoint System', () => {
    it('should have consistent breakpoint definitions', () => {
      const expectedBreakpoints = [
        '640px',  // sm (tablet)
        '768px',  // md (small desktop)
        '1024px', // lg (desktop)
        '1280px', // xl (large desktop)
      ];

      expectedBreakpoints.forEach(breakpoint => {
        expect(cssContent).toContain(`@media (min-width: ${breakpoint})`);
      });
    });

    it('should follow mobile-first approach', () => {
      // Base styles should be defined without media queries
      expect(cssContent).toContain('.mobile-first-base');
      expect(cssContent).toContain('.container');
      expect(cssContent).toContain('.responsive-text');

      // Enhancements should be in media queries
      const mediaQueryCount = (cssContent.match(/@media \(min-width:/g) || []).length;
      expect(mediaQueryCount).toBeGreaterThan(0);
    });
  });

  describe('Grid System', () => {
    it('should have single column grid by default', () => {
      const grid = document.querySelector('.grid');
      const styles = window.getComputedStyle(grid);

      expect(styles.display).toBe('grid');
      expect(styles.gridTemplateColumns).toBe('1fr');
    });

    it('should support responsive grid columns', () => {
      expect(cssContent).toContain('.grid--cols-2');
      expect(cssContent).toContain('grid-template-columns: repeat(2, 1fr)');
      expect(cssContent).toContain('.grid--cols-3');
      expect(cssContent).toContain('.grid--cols-4');
    });
  });

  describe('Accessibility Features', () => {
    it('should include accessibility utilities', () => {
      expect(cssContent).toContain('.visually-hidden');
      expect(cssContent).toContain('.focus-visible:focus');
      expect(cssContent).toContain('prefers-reduced-motion');
    });

    it('should provide adequate touch targets', () => {
      expect(cssContent).toContain('min-height: var(--touch-target-min)');
      expect(cssContent).toContain('min-width: var(--touch-target-min)');
    });
  });

  describe('Performance Optimizations', () => {
    it('should include reduced motion support', () => {
      expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)');
      expect(cssContent).toContain('animation-duration: 0.01ms');
      expect(cssContent).toContain('transition-duration: 0.01ms');
    });
  });
});