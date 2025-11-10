// Test setup for Vitest
import { JSDOM } from 'jsdom';
import '@testing-library/jest-dom';

// Setup DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
  pretendToBeVisual: true,
  url: 'http://localhost',
});

globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.navigator = dom.window.navigator;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Node = dom.window.Node;

// Mock window.matchMedia for responsive testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Store original getComputedStyle
const originalGetComputedStyle = dom.window.getComputedStyle;

// Set up custom getComputedStyle with CSS custom property resolution
dom.window.getComputedStyle = function(element) {
  const computedStyle = originalGetComputedStyle.call(this, element);

  // CSS custom property mappings for testing
  const cssVarMap = {
    // Spacing scale
    '--space-xs': '4px',
    '--space-sm': '8px',
    '--space-md': '16px',
    '--space-lg': '24px',
    '--space-xl': '32px',
    '--space-2xl': '48px',
    '--space-3xl': '64px',

    // Typography scale
    '--font-size-xs': '12px',
    '--font-size-sm': '14px',
    '--font-size-base': '16px',
    '--font-size-lg': '18px',
    '--font-size-xl': '20px',
    '--font-size-2xl': '24px',

    // Line heights
    '--leading-tight': '1.25',
    '--leading-normal': '1.5',
    '--leading-relaxed': '1.6',
    '--leading-loose': '1.7',

    // Touch targets
    '--touch-target-min': '44px',

    // Border radius
    '--radius-sm': '4px',
    '--radius-md': '8px',
    '--radius-lg': '12px',
    '--radius-xl': '16px',
    '--radius-full': '9999px',

    // Card specific
    '--card-padding': '16px',
    '--card-border-radius': '8px',
    '--card-background': '#ffffff',
    '--card-border': '1px solid #e5e7eb',
    '--card-shadow': '0 1px 2px rgba(0, 0, 0, 0.05)',
  };

  // Convert CSS custom properties to their computed values
  const resolveCssVar = (value) => {
    if (typeof value === 'string' && value.includes('var(')) {
      return value.replace(/var\(--([^)]+)\)/g, (match, varName) => {
        return cssVarMap[`--${varName}`] || value;
      });
    }
    return value;
  };

  // Convert rem to pixels for testing
  const remToPx = (value) => {
    if (typeof value === 'string' && value.includes('rem')) {
      return value.replace(/(\d*\.?\d+)rem/, (match, num) => `${parseFloat(num) * 16}px`);
    }
    return value;
  };

  const processValue = (value) => {
    return resolveCssVar(remToPx(value));
  };

  return {
    ...computedStyle,
    padding: processValue(computedStyle.padding),
    paddingLeft: processValue(computedStyle.paddingLeft),
    paddingRight: processValue(computedStyle.paddingRight),
    fontSize: processValue(computedStyle.fontSize),
    width: computedStyle.width,
    boxSizing: computedStyle.boxSizing,
    marginLeft: computedStyle.marginLeft,
    marginRight: computedStyle.marginRight,
    lineHeight: processValue(computedStyle.lineHeight),
    minHeight: processValue(computedStyle.minHeight),
    minWidth: processValue(computedStyle.minWidth),
    display: computedStyle.display,
    gridTemplateColumns: computedStyle.gridTemplateColumns,
    gap: processValue(computedStyle.gap),
    borderRadius: processValue(computedStyle.borderRadius),
    textAlign: computedStyle.textAlign,
    flexDirection: computedStyle.flexDirection,
    justifyContent: computedStyle.justifyContent,
    alignItems: computedStyle.alignItems,
    flexWrap: computedStyle.flexWrap,
    gridTemplateAreas: computedStyle.gridTemplateAreas,
    gridArea: computedStyle.gridArea,
    boxShadow: computedStyle.boxShadow,
    position: computedStyle.position,
    zIndex: computedStyle.zIndex,
    overflow: computedStyle.overflow,
    overflowX: computedStyle.overflowX,
    overflowY: computedStyle.overflowY,
    clip: computedStyle.clip,
    whiteSpace: computedStyle.whiteSpace,
    transition: computedStyle.transition,
    transform: computedStyle.transform,
    outline: computedStyle.outline,
    outlineOffset: computedStyle.outlineOffset,
  };
};

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
globalThis.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};