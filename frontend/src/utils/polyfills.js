/* @CODE:TAG-UI-COMPATIBILITY-001 - Browser polyfills for compatibility */

/**
 * Polyfills for older browser support
 * Add polyfills for features that might not be available in all target browsers
 */

// IntersectionObserver polyfill
if (!window.IntersectionObserver) {
  window.IntersectionObserver = class IntersectionObserver {
    constructor(callback, options = {}) {
      this.callback = callback;
      this.options = {
        root: null,
        rootMargin: '0px',
        threshold: 0,
        ...options
      };
      this.elements = new Set();
    }

    observe(element) {
      this.elements.add(element);
      // Fallback: immediately trigger callback for all elements
      setTimeout(() => {
        this.callback([{
          isIntersecting: true,
          target: element,
          intersectionRatio: 1,
          boundingClientRect: element.getBoundingClientRect(),
          intersectionRect: element.getBoundingClientRect(),
          rootBounds: null,
          time: Date.now()
        }], this);
      }, 100);
    }

    unobserve(element) {
      this.elements.delete(element);
    }

    disconnect() {
      this.elements.clear();
    }
  };
}

// ResizeObserver polyfill
if (!window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    constructor(callback) {
      this.callback = callback;
      this.elements = new Map();
    }

    observe(element) {
      if (!this.elements.has(element)) {
        this.elements.set(element, element.getBoundingClientRect());

        // Simple fallback using window resize
        const checkResize = () => {
          const rect = element.getBoundingClientRect();
          const lastRect = this.elements.get(element);

          if (rect.width !== lastRect.width || rect.height !== lastRect.height) {
            this.elements.set(element, rect);
            this.callback([{
              target: element,
              contentRect: rect,
              borderBoxSize: [{ blockSize: rect.height, inlineSize: rect.width }],
              contentBoxSize: [{ blockSize: rect.height, inlineSize: rect.width }]
            }], this);
          }
        };

        this.resizeHandler = this.resizeHandler || (() => {
          this.elements.forEach((_, el) => checkResize());
        });

        window.addEventListener('resize', this.resizeHandler);
      }
    }

    unobserve(element) {
      this.elements.delete(element);
    }

    disconnect() {
      this.elements.clear();
      if (this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler);
        this.resizeHandler = null;
      }
    }
  };
}

// fetch polyfill
if (!window.fetch) {
  window.fetch = function(url, options = {}) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open(options.method || 'GET', url, true);

      // Set headers
      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }

      xhr.onload = function() {
        const response = {
          ok: xhr.status >= 200 && xhr.status < 300,
          status: xhr.status,
          statusText: xhr.statusText,
          headers: {
            get: (name) => xhr.getResponseHeader(name)
          },
          url: xhr.responseURL,
          clone: () => response,
          text: () => Promise.resolve(xhr.responseText),
          json: () => Promise.resolve(JSON.parse(xhr.responseText)),
          blob: () => Promise.resolve(new Blob([xhr.response])),
          arrayBuffer: () => Promise.resolve(xhr.response)
        };

        resolve(response);
      };

      xhr.onerror = () => reject(new Error('Network request failed'));
      xhr.ontimeout = () => reject(new Error('Network request timed out'));

      xhr.timeout = options.timeout || 0;
      xhr.send(options.body);
    });
  };
}

// requestAnimationFrame polyfill
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = function(callback) {
    return setTimeout(() => {
      callback(Date.now());
    }, 1000 / 60);
  };

  window.cancelAnimationFrame = function(id) {
    clearTimeout(id);
  };
}

// CustomEvent polyfill
if (typeof window.CustomEvent !== 'function') {
  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent;
}

// Object.assign polyfill
if (typeof Object.assign !== 'function') {
  Object.assign = function(target, ...sources) {
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    const to = Object(target);

    for (const source of sources) {
      if (source != null) {
        for (const key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            to[key] = source[key];
          }
        }
      }
    }

    return to;
  };
}

// Array.from polyfill
if (!Array.from) {
  Array.from = function(arrayLike) {
    const result = [];
    const length = arrayLike.length;

    for (let i = 0; i < length; i++) {
      result.push(arrayLike[i]);
    }

    return result;
  };
}

// Array.prototype.includes polyfill
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement, fromIndex) {
    const O = Object(this);
    const len = parseInt(O.length) || 0;

    if (len === 0) return false;

    const n = parseInt(fromIndex) || 0;
    let k = n >= 0 ? n : Math.max(len + n, 0);

    while (k < len) {
      if (O[k] === searchElement) return true;
      k++;
    }

    return false;
  };
}

// String.prototype.includes polyfill
if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    if (typeof start !== 'number') {
      start = 0;
    }

    if (start + search.length > this.length) {
      return false;
    }

    return this.indexOf(search, start) !== -1;
  };
}

// String.prototype.startsWith polyfill
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(search, pos) {
    return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
  };
}

// String.prototype.endsWith polyfill
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(search, this_len) {
    if (this_len === undefined || this_len > this.length) {
      this_len = this.length;
    }
    return this.substring(this_len - search.length, this_len) === search;
  };
}

// Promise polyfill (basic implementation)
if (!window.Promise) {
  window.Promise = function(executor) {
    let state = 'pending';
    let value = undefined;
    let handlers = [];

    function resolve(result) {
      if (state !== 'pending') return;

      state = 'fulfilled';
      value = result;

      handlers.forEach(handler => {
        setTimeout(() => handler.onFulfilled(value), 0);
      });

      handlers = [];
    }

    function reject(error) {
      if (state !== 'pending') return;

      state = 'rejected';
      value = error;

      handlers.forEach(handler => {
        setTimeout(() => handler.onRejected(value), 0);
      });

      handlers = [];
    }

    this.then = function(onFulfilled, onRejected) {
      return new Promise((resolve, reject) => {
        function handle() {
          if (state === 'fulfilled') {
            if (typeof onFulfilled === 'function') {
              try {
                resolve(onFulfilled(value));
              } catch (error) {
                reject(error);
              }
            } else {
              resolve(value);
            }
          } else if (state === 'rejected') {
            if (typeof onRejected === 'function') {
              try {
                resolve(onRejected(value));
              } catch (error) {
                reject(error);
              }
            } else {
              reject(value);
            }
          } else {
            handlers.push({ onFulfilled, onRejected });
          }
        }

        handle();
      });
    };

    this.catch = function(onRejected) {
      return this.then(null, onRejected);
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  };
}

// Console fallbacks for older browsers
if (!window.console) {
  window.console = {
    log: function() {},
    warn: function() {},
    error: function() {},
    info: function() {},
    debug: function() {}
  };
}

// LocalStorage polyfill with fallback to memory
if (!window.localStorage) {
  const memoryStorage = {};

  window.localStorage = {
    setItem: function(key, value) {
      memoryStorage[key] = String(value);
    },
    getItem: function(key) {
      return memoryStorage[key] || null;
    },
    removeItem: function(key) {
      delete memoryStorage[key];
    },
    clear: function() {
      Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);
    },
    get length() {
      return Object.keys(memoryStorage).length;
    },
    key: function(index) {
      return Object.keys(memoryStorage)[index] || null;
    }
  };
}

// CSS.supports polyfill
if (!window.CSS || !window.CSS.supports) {
  window.CSS = window.CSS || {};
  window.CSS.supports = function(property, value) {
    // Basic implementation for common properties
    const element = document.createElement('div');

    if (arguments.length === 1) {
      return property in element.style;
    }

    element.style.cssText = property + ':' + value;
    return !!element.style.length;
  };
}

// Page Visibility API polyfill
if (!document.hidden) {
  Object.defineProperty(document, 'hidden', {
    get: function() {
      return document.hidden !== false ? false : undefined;
    }
  });
}

if (!document.visibilityState) {
  Object.defineProperty(document, 'visibilityState', {
    get: function() {
      return document.hidden ? 'hidden' : 'visible';
    }
  });
}

// Export polyfill status for debugging
export const polyfillStatus = {
  IntersectionObserver: !!window.IntersectionObserver,
  ResizeObserver: !!window.ResizeObserver,
  fetch: !!window.fetch,
  requestAnimationFrame: !!window.requestAnimationFrame,
  CustomEvent: typeof window.CustomEvent === 'function',
  Promise: !!window.Promise,
  localStorage: !!window.localStorage,
  CSS: !!(window.CSS && window.CSS.supports)
};

// Initialize polyfills with debugging
if (process.env.NODE_ENV === 'development') {
  console.log('Polyfill Status:', polyfillStatus);

  // Warn about missing critical features
  if (!polyfillStatus.Promise) {
    console.warn('Promise polyfill loaded - some features may not work optimally');
  }

  if (!polyfillStatus.IntersectionObserver) {
    console.warn('IntersectionObserver polyfill loaded - lazy loading may not be optimal');
  }
}