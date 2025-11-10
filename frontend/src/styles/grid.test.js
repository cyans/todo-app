/**
 * @TEST:TAG-UI-RESPONSIVE-002
 * Tests for responsive grid and layout system
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Responsive Grid and Layout System', () => {
  let cssContent;
  let styleElement;

  beforeEach(() => {
    // Load CSS content
    const cssPath = path.resolve(__dirname, './grid.css');
    cssContent = fs.readFileSync(cssPath, 'utf8');

    // Add CSS to document
    styleElement = document.createElement('style');
    styleElement.textContent = cssContent;
    document.head.appendChild(styleElement);

    // Add test elements
    document.body.innerHTML = `
      <div class="grid">Grid</div>
      <div class="grid grid--cols-2">Grid 2 cols</div>
      <div class="grid grid--cols-3">Grid 3 cols</div>
      <div class="grid grid--cols-4">Grid 4 cols</div>
      <div class="flex">Flex</div>
      <div class="layout">Layout</div>
      <div class="layout layout--sidebar">Layout with sidebar</div>
      <div class="card">Card</div>
      <div class="card card--featured">Featured card</div>
      <div class="hero">Hero</div>
      <div class="section">Section</div>
    `;
  });

  afterEach(() => {
    // Clean up
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }
    document.body.innerHTML = '';
  });

  describe('Basic Grid System', () => {
    it('should have single column grid by default', () => {
      const grid = document.querySelector('.grid');
      const styles = window.getComputedStyle(grid);

      expect(styles.display).toBe('grid');
      expect(styles.gridTemplateColumns).toBe('1fr');
      expect(styles.gap).toBe('16px'); // var(--space-md)
    });

    it('should support 2-column grid on tablet and up', () => {
      expect(cssContent).toContain('.grid--cols-2');
      expect(cssContent).toContain('grid-template-columns: repeat(2, 1fr)');
      expect(cssContent).toContain('@media (min-width: 640px)');
    });

    it('should support 3-column grid on desktop and up', () => {
      expect(cssContent).toContain('.grid--cols-3');
      expect(cssContent).toContain('grid-template-columns: repeat(3, 1fr)');
      expect(cssContent).toContain('@media (min-width: 1024px)');
    });

    it('should support 4-column grid on desktop and up', () => {
      expect(cssContent).toContain('.grid--cols-4');
      expect(cssContent).toContain('grid-template-columns: repeat(4, 1fr)');
      expect(cssContent).toContain('@media (min-width: 1024px)');
    });
  });

  describe('Flexbox Layout System', () => {
    it('should provide flex utilities', () => {
      const flex = document.querySelector('.flex');
      const styles = window.getComputedStyle(flex);

      expect(styles.display).toBe('flex');
    });

    it('should support responsive flex directions', () => {
      expect(cssContent).toContain('.flex--col');
      expect(cssContent).toContain('.flex--row');
      expect(cssContent).toContain('flex-direction: column');
      expect(cssContent).toContain('flex-direction: row');
    });

    it('should support flex alignment utilities', () => {
      expect(cssContent).toContain('.flex--center');
      expect(cssContent).toContain('.flex--start');
      expect(cssContent).toContain('.flex--end');
      expect(cssContent).toContain('justify-content: center');
    });
  });

  describe('Layout Components', () => {
    it('should provide base layout container', () => {
      const layout = document.querySelector('.layout');
      const styles = window.getComputedStyle(layout);

      expect(styles.display).toBe('grid');
    });

    it('should support sidebar layout', () => {
      expect(cssContent).toContain('.layout--sidebar');
      expect(cssContent).toContain('grid-template-columns');
    });

    it('should be responsive for mobile devices', () => {
      expect(cssContent).toContain('@media (min-width: 768px)');
      expect(cssContent).toContain('grid-template-areas');
    });
  });

  describe('Card Component System', () => {
    it('should provide base card styling', () => {
      const card = document.querySelector('.card');
      const styles = window.getComputedStyle(card);

      expect(styles.padding).toBe('16px'); // var(--space-md)
      expect(styles.borderRadius).toBe('8px'); // var(--radius-md)
    });

    it('should support featured card variant', () => {
      expect(cssContent).toContain('.card--featured');
      expect(cssContent).toContain('box-shadow: var(--shadow-lg)');
    });

    it('should have responsive card layouts', () => {
      expect(cssContent).toContain('.card--responsive');
      expect(cssContent).toContain('@media (min-width: 640px)');
    });
  });

  describe('Hero Section System', () => {
    it('should provide hero section styling', () => {
      const hero = document.querySelector('.hero');
      const styles = window.getComputedStyle(hero);

      expect(styles.padding).toBe('64px 0'); // var(--space-3xl) 0
      expect(styles.textAlign).toBe('center');
    });

    it('should be responsive across breakpoints', () => {
      expect(cssContent).toContain('@media (min-width: 640px)');
      expect(cssContent).toContain('@media (min-width: 1024px)');
      expect(cssContent).toContain('padding: var(--space-3xl) 0');
    });
  });

  describe('Section Layout System', () => {
    it('should provide section container styling', () => {
      const section = document.querySelector('.section');
      const styles = window.getComputedStyle(section);

      expect(styles.padding).toBe('32px 0'); // var(--space-xl) 0
    });

    it('should support responsive section spacing', () => {
      expect(cssContent).toContain('@media (min-width: 640px)');
      expect(cssContent).toContain('padding: var(--space-2xl) 0');
      expect(cssContent).toContain('@media (min-width: 1024px)');
      expect(cssContent).toContain('padding: var(--space-3xl) 0');
    });
  });

  describe('Advanced Grid Features', () => {
    it('should support grid gap variations', () => {
      expect(cssContent).toContain('.grid--gap-sm');
      expect(cssContent).toContain('.grid--gap-lg');
      expect(cssContent).toContain('gap: var(--space-sm)');
      expect(cssContent).toContain('gap: var(--space-lg)');
    });

    it('should support grid auto-fit layouts', () => {
      expect(cssContent).toContain('.grid--auto-fit');
      expect(cssContent).toContain('grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))');
    });

    it('should support grid auto-fill layouts', () => {
      expect(cssContent).toContain('.grid--auto-fill');
      expect(cssContent).toContain('grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))');
    });
  });

  describe('Layout Utilities', () => {
    it('should provide spacing utilities', () => {
      expect(cssContent).toContain('.gap-sm');
      expect(cssContent).toContain('.gap-md');
      expect(cssContent).toContain('.gap-lg');
      expect(cssContent).toContain('gap: var(--space-sm)');
      expect(cssContent).toContain('gap: var(--space-md)');
      expect(cssContent).toContain('gap: var(--space-lg)');
    });

    it('should provide width utilities', () => {
      expect(cssContent).toContain('.w-full');
      expect(cssContent).toContain('.w-auto');
      expect(cssContent).toContain('width: 100%');
      expect(cssContent).toContain('width: auto');
    });

    it('should provide height utilities', () => {
      expect(cssContent).toContain('.h-full');
      expect(cssContent).toContain('.h-auto');
      expect(cssContent).toContain('height: 100%');
      expect(cssContent).toContain('height: auto');
    });
  });

  describe('Mobile-First Design Verification', () => {
    it('should use mobile-first approach', () => {
      // Base styles should be mobile-optimized
      expect(cssContent).toContain('.grid {');
      expect(cssContent).toContain('grid-template-columns: 1fr');

      // Enhancements should be in media queries
      const mediaQueryCount = (cssContent.match(/@media \(min-width:/g) || []).length;
      expect(mediaQueryCount).toBeGreaterThan(5);
    });

    it('should maintain consistency with design system', () => {
      expect(cssContent).toContain('var(--space-');
      expect(cssContent).toContain('var(--shadow-');
      expect(cssContent).toContain('--radius-md:');
      expect(cssContent).toContain('--card-padding:');
    });
  });

  describe('Responsive Breakpoint Integration', () => {
    it('should use consistent breakpoint values', () => {
      expect(cssContent).toContain('@media (min-width: 640px)');
      expect(cssContent).toContain('@media (min-width: 768px)');
      expect(cssContent).toContain('@media (min-width: 1024px)');
    });

    it('should apply layouts progressively across breakpoints', () => {
      // Should have mobile, tablet, and desktop layouts
      expect(cssContent).toContain('@media (min-width: 640px)'); // Tablet
      expect(cssContent).toContain('@media (min-width: 768px)'); // Small desktop
      expect(cssContent).toContain('@media (min-width: 1024px)'); // Desktop
    });
  });
});