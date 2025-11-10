/* @CODE:TAG-UI-PERFORMANCE-001 - Bundle optimization and code splitting utilities */

/**
 * Bundle optimization utilities for dynamic imports and code splitting
 * Provides lazy loading, prefetching, and bundle analysis capabilities
 */

// Component lazy loading with error handling and retry logic
export const lazyLoad = (factory, options = {}) => {
  const {
    retries = 3,
    retryDelay = 1000,
    timeout = 10000,
    fallback = null,
    onError = null,
    onSuccess = null
  } = options;

  let attempt = 0;

  const load = async () => {
    attempt++;

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Load timeout')), timeout);
      });

      const modulePromise = factory();
      const module = await Promise.race([modulePromise, timeoutPromise]);

      onSuccess?.(module);
      return module;
    } catch (error) {
      if (attempt < retries) {
        console.warn(`Load attempt ${attempt} failed, retrying...`, error);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return load();
      } else {
        const finalError = new Error(`Failed to load after ${retries} attempts: ${error.message}`);
        onError?.(finalError);

        if (fallback) {
          return fallback();
        }

        throw finalError;
      }
    }
  };

  return load();
};

// Preload resources
export const preloadResource = (url, options = {}) => {
  const {
    type = 'script',
    as = null,
    crossorigin = null,
    integrity = null
  } = options;

  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;

    if (as) link.as = as;
    if (crossorigin) link.crossOrigin = crossorigin;
    if (integrity) link.integrity = integrity;
    if (type === 'style') link.type = 'text/css';
    if (type === 'script') link.type = 'application/javascript';

    link.onload = resolve;
    link.onerror = reject;

    document.head.appendChild(link);
  });
};

// Prefetch resources
export const prefetchResource = (url, options = {}) => {
  const {
    type = 'script'
  } = options;

  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;

    if (type === 'style') link.type = 'text/css';
    if (type === 'script') link.type = 'application/javascript';

    link.onload = resolve;
    link.onerror = reject;

    document.head.appendChild(link);
  });
};

// Dynamic import with caching
const importCache = new Map();

export const dynamicImport = (path, options = {}) => {
  const {
    cache = true,
    timeout = 10000
  } = options;

  if (cache && importCache.has(path)) {
    return Promise.resolve(importCache.get(path));
  }

  const importPromise = import(path).catch(error => {
    throw new Error(`Failed to import ${path}: ${error.message}`);
  });

  // Add timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Import timeout')), timeout);
  });

  const resultPromise = Promise.race([importPromise, timeoutPromise]);

  if (cache) {
    importCache.set(path, resultPromise);
  }

  return resultPromise;
};

// Route-based code splitting
export const createLazyRoute = (importFn, fallback = null) => {
  return React.lazy(() => {
    return lazyLoad(importFn, {
      fallback: () => ({ default: fallback || DefaultRouteFallback }),
      onError: (error) => {
        console.error('Route loading failed:', error);
      }
    });
  });
};

// Default route fallback component
const DefaultRouteFallback = () => (
  <div className="route-fallback">
    <div className="loading-spinner"></div>
    <p>Loading route...</p>
  </div>
);

// Component lazy loading with React.lazy wrapper
export const lazyComponent = (importFn, options = {}) => {
  const {
    fallback = DefaultComponentFallback,
    errorComponent = DefaultErrorFallback
  } = options;

  return React.lazy(() => {
    return lazyLoad(importFn, {
      fallback: () => ({ default: fallback }),
      onError: (error) => {
        console.error('Component loading failed:', error);
        return { default: () => errorComponent(error) };
      }
    });
  });
};

// Default component fallback
const DefaultComponentFallback = () => (
  <div className="component-fallback">
    <div className="loading-spinner"></div>
  </div>
);

// Default error fallback
const DefaultErrorFallback = (error) => (
  <div className="component-error">
    <h3>Failed to load component</h3>
    <p>{error.message}</p>
  </div>
);

// Bundle size analyzer
export class BundleAnalyzer {
  constructor() {
    this.metrics = {
      initialLoad: 0,
      dynamicImports: [],
      totalLoaded: 0
    };
  }

  // Measure initial bundle size
  measureInitialLoad() {
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;

    scripts.forEach(script => {
      // Rough estimation - in real app, this would come from build tools
      const sizeEstimate = this.estimateResourceSize(script.src);
      totalSize += sizeEstimate;
    });

    this.metrics.initialLoad = totalSize;
    return totalSize;
  }

  // Track dynamic import
  trackDynamicImport(url, size) {
    this.metrics.dynamicImports.push({
      url,
      size,
      timestamp: Date.now()
    });
    this.metrics.totalLoaded += size;
  }

  // Estimate resource size (fallback method)
  estimateResourceSize(url) {
    // This is a rough estimation - in production, use actual bundle analysis
    if (url.includes('.js')) return 50000; // 50KB estimate
    if (url.includes('.css')) return 20000; // 20KB estimate
    if (url.match(/\.(jpg|png|gif|webp)$/i)) return 100000; // 100KB estimate
    return 10000; // 10KB default
  }

  // Generate bundle report
  generateReport() {
    return {
      initialLoad: this.metrics.initialLoad,
      dynamicImports: this.metrics.dynamicImports.length,
      totalDynamicSize: this.metrics.dynamicImports.reduce((sum, imp) => sum + imp.size, 0),
      totalLoaded: this.metrics.totalLoaded,
      savings: this.calculateSavings()
    };
  }

  // Calculate potential savings from lazy loading
  calculateSavings() {
    const dynamicSize = this.metrics.dynamicImports.reduce((sum, imp) => sum + imp.size, 0);
    return {
      bytes: dynamicSize,
      percentage: Math.round((dynamicSize / (this.metrics.initialLoad + dynamicSize)) * 100)
    };
  }
}

// Network-aware loading
export class NetworkAwareLoader {
  constructor() {
    this.connection = this.getConnectionInfo();
    this.setupConnectionListener();
  }

  getConnectionInfo() {
    if ('connection' in navigator) {
      const conn = navigator.connection;
      return {
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
        saveData: conn.saveData
      };
    }

    // Fallback detection
    return {
      effectiveType: '4g', // Assume good connection
      downlink: 10,
      rtt: 100,
      saveData: false
    };
  }

  setupConnectionListener() {
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', () => {
        this.connection = this.getConnectionInfo();
        this.adaptToConnection();
      });
    }
  }

  adaptToConnection() {
    // Adapt loading strategy based on connection
    if (this.connection.saveData || this.connection.effectiveType === 'slow-2g') {
      // Enable aggressive lazy loading and compression
      document.documentElement.setAttribute('data-connection', 'slow');
    } else if (this.connection.effectiveType === '2g') {
      document.documentElement.setAttribute('data-connection', '2g');
    } else if (this.connection.effectiveType === '3g') {
      document.documentElement.setAttribute('data-connection', '3g');
    } else {
      document.documentElement.setAttribute('data-connection', 'fast');
    }
  }

  // Should load resource now based on connection?
  shouldLoad(priority = 'normal') {
    if (this.connection.saveData && priority !== 'critical') {
      return false;
    }

    const thresholds = {
      'slow-2g': { critical: true, high: false, normal: false, low: false },
      '2g': { critical: true, high: true, normal: false, low: false },
      '3g': { critical: true, high: true, normal: true, low: false },
      '4g': { critical: true, high: true, normal: true, low: true }
    };

    return thresholds[this.connection.effectiveType]?.[priority] ?? true;
  }

  // Get appropriate timeout based on connection
  getTimeout(baseTimeout = 10000) {
    const multipliers = {
      'slow-2g': 3,
      '2g': 2,
      '3g': 1.5,
      '4g': 1
    };

    return baseTimeout * (multipliers[this.connection.effectiveType] || 1);
  }
}

// Critical resource loader
export class CriticalResourceLoader {
  constructor() {
    this.criticalResources = new Set();
    this.loadedResources = new Set();
  }

  // Mark resource as critical
  markCritical(url) {
    this.criticalResources.add(url);
  }

  // Load critical resources immediately
  async loadCritical() {
    const loadPromises = Array.from(this.criticalResources).map(url => {
      return this.loadResource(url, { priority: 'critical' });
    });

    try {
      await Promise.all(loadPromises);
    } catch (error) {
      console.error('Failed to load some critical resources:', error);
    }
  }

  // Load individual resource
  async loadResource(url, options = {}) {
    if (this.loadedResources.has(url)) {
      return;
    }

    const {
      priority = 'normal',
      timeout = 10000
    } = options;

    try {
      await preloadResource(url, { timeout });
      this.loadedResources.add(url);
    } catch (error) {
      console.error(`Failed to load critical resource ${url}:`, error);
    }
  }
}

// Service Worker for caching
export class ServiceWorkerManager {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator;
    this.registration = null;
  }

  async register(swUrl) {
    if (!this.isSupported) {
      console.warn('Service Worker not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register(swUrl);
      console.log('Service Worker registered:', this.registration);
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  async preload(urls) {
    if (!this.registration) {
      return;
    }

    // Send preload message to service worker
    this.registration.active?.postMessage({
      type: 'PRELOAD',
      urls
    });
  }

  // Clear caches
  async clearCaches() {
    if (!this.registration) {
      return;
    }

    this.registration.active?.postMessage({
      type: 'CLEAR_CACHES'
    });
  }
}

// Create global instances
export const bundleAnalyzer = new BundleAnalyzer();
export const networkLoader = new NetworkAwareLoader();
export const criticalLoader = new CriticalResourceLoader();
export const swManager = new ServiceWorkerManager();

// Initialize on page load
if (typeof window !== 'undefined') {
  // Measure initial bundle size
  setTimeout(() => {
    bundleAnalyzer.measureInitialLoad();
  }, 100);

  // Adapt to connection
  networkLoader.adaptToConnection();

  // Load critical resources
  criticalLoader.loadCritical();
}

export default {
  lazyLoad,
  preloadResource,
  prefetchResource,
  dynamicImport,
  createLazyRoute,
  lazyComponent,
  BundleAnalyzer,
  NetworkAwareLoader,
  CriticalResourceLoader,
  ServiceWorkerManager,
  bundleAnalyzer,
  networkLoader,
  criticalLoader,
  swManager
};