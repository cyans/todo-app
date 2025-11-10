/* @CODE:TAG-UI-PERFORMANCE-001 - Critical CSS inlining utility */

/**
 * Critical CSS inlining for performance optimization
 * Extracts and inlines above-the-fold CSS for faster rendering
 */

// Critical CSS for immediate rendering
export const criticalCSS = `
/* Critical CSS - Above the fold styles */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f9fafb;
  color: #111827;
  line-height: 1.6;
}

/* Container */
.container {
  width: 100%;
  padding-left: 16px;
  padding-right: 16px;
  margin-left: auto;
  margin-right: auto;
  max-width: 1200px;
}

/* Loading states */
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Basic flexbox for immediate layout */
.flex {
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
}

.flex--col {
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
}

.flex--center {
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
}

/* Touch targets */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  color: #374151;
  -webkit-tap-highlight-color: transparent;
}

.touch-target:hover {
  background-color: #f3f4f6;
}

.touch-target:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  margin: 0;
  font-weight: 600;
  line-height: 1.25;
}

h1 { font-size: 2rem; }
h2 { font-size: 1.5rem; }
h3 { font-size: 1.25rem; }
h4 { font-size: 1.125rem; }
h5 { font-size: 1rem; }
h6 { font-size: 0.875rem; }

p {
  margin: 0 0 1rem 0;
}

/* Input elements */
input, textarea, select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-color: white;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: #3b82f6;
  -webkit-box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Buttons */
button {
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  -webkit-tap-highlight-color: transparent;
}

button:hover {
  background-color: #f3f4f6;
}

button:focus {
  outline: none;
  border-color: #3b82f6;
  -webkit-box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Primary button */
.btn-primary {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
  border-color: #2563eb;
}

/* Basic layout */
.page-header {
  padding: 1rem 0;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
  background-color: white;
}

.page-content {
  padding: 1rem 0;
  min-height: calc(100vh - 200px);
}

/* Utility classes */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.mb-0 { margin-bottom: 0; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }

.mt-0 { margin-top: 0; }
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 0.75rem; }
.mt-4 { margin-top: 1rem; }

.p-0 { padding: 0; }
.p-1 { padding: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 0.75rem; }
.p-4 { padding: 1rem; }

/* Responsive typography */
@media (min-width: 640px) {
  h1 { font-size: 2.25rem; }
  h2 { font-size: 1.875rem; }
  h3 { font-size: 1.5rem; }
  h4 { font-size: 1.25rem; }
}

@media (min-width: 1024px) {
  h1 { font-size: 3rem; }
  h2 { font-size: 2.25rem; }
  h3 { font-size: 1.875rem; }
  h4 { font-size: 1.5rem; }
}

/* Performance optimizations */
.gpu-accelerated {
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.will-change-transform {
  will-change: transform;
}

/* Prevent flash of unstyled content */
.no-js .js-only {
  display: none !important;
}

.js .no-js-only {
  display: none !important;
}
`;

// Critical CSS injector
export class CriticalCSSInjector {
  constructor() {
    this.injected = false;
    this.criticalStyles = null;
  }

  // Inject critical CSS into the head
  inject() {
    if (this.injected || typeof document === 'undefined') {
      return;
    }

    // Create style element
    const styleElement = document.createElement('style');
    styleElement.id = 'critical-css';
    styleElement.textContent = criticalCSS;
    styleElement.setAttribute('data-critical', 'true');

    // Insert as first stylesheet
    const firstStylesheet = document.querySelector('link[rel="stylesheet"]');
    if (firstStylesheet) {
      firstStylesheet.parentNode.insertBefore(styleElement, firstStylesheet);
    } else {
      document.head.appendChild(styleElement);
    }

    this.injected = true;
    this.criticalStyles = styleElement;

    // Mark critical CSS as loaded
    document.documentElement.setAttribute('data-critical-css-loaded', 'true');
  }

  // Remove critical CSS after page load (optional)
  removeAfterLoad() {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        if (this.criticalStyles) {
          this.criticalStyles.setAttribute('data-remove-after-load', 'true');

          // Optionally remove after full page load
          setTimeout(() => {
            if (this.criticalStyles && this.criticalStyles.parentNode) {
              this.criticalStyles.parentNode.removeChild(this.criticalStyles);
              this.criticalStyles = null;
            }
          }, 3000);
        }
      }, 1000);
    });
  }

  // Generate critical CSS from DOM elements
  generateFromDOM(elements = []) {
    if (typeof document === 'undefined') return '';

    const criticalElements = elements.length > 0
      ? elements
      : document.querySelectorAll('head, body > *, .container > *');

    let criticalRules = criticalCSS;

    // Add element-specific critical styles
    criticalElements.forEach(element => {
      const computedStyles = window.getComputedStyle(element);
      const essentialStyles = this.extractEssentialStyles(element, computedStyles);

      if (essentialStyles) {
        criticalRules += essentialStyles;
      }
    });

    return criticalRules;
  }

  // Extract only essential styles from computed styles
  extractEssentialStyles(element, computedStyles) {
    const essentialProperties = [
      'display', 'position', 'width', 'height', 'margin', 'padding',
      'background-color', 'color', 'font-size', 'font-family',
      'text-align', 'line-height', 'border', 'border-radius',
      'overflow', 'z-index', 'transform', 'opacity'
    ];

    let styles = '';
    const selector = this.generateSelector(element);

    essentialProperties.forEach(property => {
      const value = computedStyles.getPropertyValue(property);
      if (value && value !== 'initial' && value !== 'normal') {
        styles += `${property}: ${value}; `;
      }
    });

    return styles ? `\n${selector} { ${styles} }` : '';
  }

  // Generate CSS selector for element
  generateSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }

    if (element.className) {
      return `.${element.className.split(' ').join('.')}`;
    }

    return element.tagName.toLowerCase();
  }
}

// Async CSS loader for non-critical styles
export class AsyncCSSLoader {
  constructor() {
    this.loadedStylesheets = new Set();
  }

  // Load CSS file asynchronously
  load(url, options = {}) {
    const {
      media = 'all',
      integrity = null,
      crossorigin = null,
      defer = false
    } = options;

    if (this.loadedStylesheets.has(url)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.media = 'print'; // Load as print first, then switch to all
      link.onload = () => {
        link.media = media;
        this.loadedStylesheets.add(url);
        resolve(link);
      };
      link.onerror = () => {
        document.head.removeChild(link);
        reject(new Error(`Failed to load stylesheet: ${url}`));
      };

      if (integrity) {
        link.integrity = integrity;
      }

      if (crossorigin) {
        link.crossOrigin = crossorigin;
      }

      if (defer) {
        // Load after critical rendering path
        if (document.readyState === 'complete') {
          document.head.appendChild(link);
        } else {
          window.addEventListener('load', () => {
            document.head.appendChild(link);
          });
        }
      } else {
        // Insert after critical CSS
        const criticalCSS = document.getElementById('critical-css');
        if (criticalCSS) {
          criticalCSS.parentNode.insertBefore(link, criticalCSS.nextSibling);
        } else {
          document.head.appendChild(link);
        }
      }
    });
  }

  // Load multiple stylesheets
  loadBatch(urls, options = {}) {
    const {
      parallel = true,
      ...loadOptions
    } = options;

    if (parallel) {
      return Promise.all(urls.map(url => this.load(url, loadOptions)));
    } else {
      return urls.reduce((promise, url) => {
        return promise.then(() => this.load(url, loadOptions));
      }, Promise.resolve());
    }
  }
}

// Create global instances
export const criticalInjector = new CriticalCSSInjector();
export const asyncCSSLoader = new AsyncCSSLoader();

// Auto-inject critical CSS
if (typeof document !== 'undefined') {
  // Inject immediately if DOM is already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      criticalInjector.inject();
    });
  } else {
    criticalInjector.inject();
  }

  // Optionally remove after full load
  if (process.env.NODE_ENV === 'production') {
    criticalInjector.removeAfterLoad();
  }
}

export default {
  criticalCSS,
  CriticalCSSInjector,
  AsyncCSSLoader,
  criticalInjector,
  asyncCSSLoader
};