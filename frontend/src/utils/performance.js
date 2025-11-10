/* @CODE:TAG-UI-PERFORMANCE-001 - Performance monitoring integration */

/**
 * Performance monitoring utilities for tracking application performance
 * Provides metrics collection, reporting, and optimization suggestions
 */

// Performance metrics collector
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      navigation: {},
      resources: [],
      paint: {},
      memory: {},
      vitals: {}
    };
    this.observers = new Map();
    this.isSupported = this.checkSupport();
    this.enabled = process.env.NODE_ENV === 'production' ||
                   process.env.NODE_ENV === 'development';
  }

  checkSupport() {
    return {
      navigation: !!performance.timing,
      resource: !!performance.getEntriesByType,
      paint: !!performance.getEntriesByType,
      observer: 'PerformanceObserver' in window,
      memory: !!performance.memory,
      vitals: 'web-vitals' in window || this.detectWebVitals()
    };
  }

  detectWebVitals() {
    // Check if common web vitals functions are available
    return typeof window !== 'undefined' &&
           (window.webVitals || window.PerformanceObserver);
  }

  // Initialize performance monitoring
  init() {
    if (!this.enabled || !this.isSupported.navigation) return;

    this.collectNavigationMetrics();
    this.collectPaintMetrics();
    this.setupObservers();
    this.collectMemoryMetrics();
    this.trackUserInteractions();
  }

  // Collect navigation timing metrics
  collectNavigationMetrics() {
    if (!this.isSupported.navigation) return;

    const timing = performance.timing;
    const navigation = performance.navigation;

    this.metrics.navigation = {
      // Page load timing
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      loadComplete: timing.loadEventEnd - timing.navigationStart,

      // Network timing
      dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
      tcpConnect: timing.connectEnd - timing.connectStart,
      request: timing.responseStart - timing.requestStart,
      response: timing.responseEnd - timing.responseStart,

      // Processing timing
      domProcessing: timing.domComplete - timing.domLoading,
      domInteractive: timing.domInteractive - timing.navigationStart,

      // Navigation type
      type: navigation.type,
      redirectCount: navigation.redirectCount
    };

    // Calculate Core Web Vitals equivalents
    this.metrics.vitals.lcp = this.estimateLCP();
    this.metrics.vitals.fid = this.estimateFID();
    this.metrics.vitals.cls = this.estimateCLS();
  }

  // Collect paint timing metrics
  collectPaintMetrics() {
    if (!this.isSupported.paint) return;

    const paintEntries = performance.getEntriesByType('paint');

    paintEntries.forEach(entry => {
      this.metrics.paint[entry.name] = entry.startTime;
    });
  }

  // Set up performance observers
  setupObservers() {
    if (!this.isSupported.observer) return;

    // Observe long tasks
    this.observeLongTasks();

    // Observe layout shifts
    this.observeLayoutShift();

    // Observe largest contentful paint
    this.observeLCP();

    // Observe first input delay
    this.observeFID();
  }

  observeLongTasks() {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) { // Long task threshold
            this.metrics.longTasks = this.metrics.longTasks || [];
            this.metrics.longTasks.push({
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name
            });
          }
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
      this.observers.set('longtask', observer);
    } catch (error) {
      console.warn('Long task observer not supported:', error);
    }
  }

  observeLayoutShift() {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });

        this.metrics.vitals.cls = Math.round(clsValue * 1000) / 1000;
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('layout-shift', observer);
    } catch (error) {
      console.warn('Layout shift observer not supported:', error);
    }
  }

  observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];

        this.metrics.vitals.lcp = Math.round(lastEntry.startTime);
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('largest-contentful-paint', observer);
    } catch (error) {
      console.warn('LCP observer not supported:', error);
    }
  }

  observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-input') {
            this.metrics.vitals.fid = Math.round(entry.processingStart - entry.startTime);
          }
        });
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.set('first-input', observer);
    } catch (error) {
      console.warn('FID observer not supported:', error);
    }
  }

  // Collect memory metrics
  collectMemoryMetrics() {
    if (!this.isSupported.memory) return;

    this.metrics.memory = {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
    };

    // Calculate memory usage percentage
    this.metrics.memory.usagePercentage =
      (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100;
  }

  // Track user interactions
  trackUserInteractions() {
    const interactionEvents = ['click', 'touchstart', 'keydown'];
    const interactions = [];

    interactionEvents.forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        const interaction = {
          type: eventType,
          timestamp: Date.now(),
          target: event.target.tagName || 'unknown'
        };

        interactions.push(interaction);

        // Keep only last 50 interactions
        if (interactions.length > 50) {
          interactions.shift();
        }

        this.metrics.userInteractions = interactions;
      }, { passive: true });
    });
  }

  // Estimate Core Web Vitals for older browsers
  estimateLCP() {
    if (!this.isSupported.navigation) return null;

    // Rough estimation based on load complete time
    const loadComplete = this.metrics.navigation.loadComplete;
    return loadComplete ? Math.round(loadComplete * 0.8) : null; // 80% of load time
  }

  estimateFID() {
    if (!this.isSupported.navigation) return null;

    // Rough estimation based on dom processing time
    const domProcessing = this.metrics.navigation.domProcessing;
    return domProcessing ? Math.round(domProcessing * 0.1) : null; // 10% of processing time
  }

  estimateCLS() {
    // Cannot estimate CLS reliably without observer
    return null;
  }

  // Collect resource timing metrics
  getResourceMetrics() {
    if (!this.isSupported.resource) return [];

    const resources = performance.getEntriesByType('resource');

    return resources.map(resource => ({
      name: resource.name,
      type: this.getResourceType(resource.name),
      duration: resource.duration,
      size: resource.transferSize || resource.encodedBodySize || 0,
      startTime: resource.startTime,
      responseEnd: resource.responseEnd
    }));
  }

  getResourceType(url) {
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.js')) return 'script';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/i)) return 'font';
    return 'other';
  }

  // Generate performance report
  generateReport() {
    const resources = this.getResourceMetrics();

    // Analyze resources
    const resourceAnalysis = this.analyzeResources(resources);

    // Analyze Core Web Vitals
    const vitalsAnalysis = this.analyzeVitals();

    // Generate recommendations
    const recommendations = this.generateRecommendations(resourceAnalysis, vitalsAnalysis);

    return {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: {
        navigation: this.metrics.navigation,
        paint: this.metrics.paint,
        vitals: this.metrics.vitals,
        memory: this.metrics.memory,
        longTasks: this.metrics.longTasks || []
      },
      resources: resourceAnalysis,
      vitals: vitalsAnalysis,
      recommendations,
      score: this.calculatePerformanceScore(vitalsAnalysis)
    };
  }

  analyzeResources(resources) {
    const analysis = {
      total: resources.length,
      totalSize: 0,
      byType: {},
      slowResources: [],
      largeResources: []
    };

    resources.forEach(resource => {
      analysis.totalSize += resource.size;

      // Group by type
      if (!analysis.byType[resource.type]) {
        analysis.byType[resource.type] = {
          count: 0,
          totalSize: 0,
          averageDuration: 0
        };
      }

      const typeAnalysis = analysis.byType[resource.type];
      typeAnalysis.count++;
      typeAnalysis.totalSize += resource.size;
      typeAnalysis.averageDuration += resource.duration;

      // Identify slow resources (>1 second)
      if (resource.duration > 1000) {
        analysis.slowResources.push(resource);
      }

      // Identify large resources (>100KB)
      if (resource.size > 100 * 1024) {
        analysis.largeResources.push(resource);
      }
    });

    // Calculate averages
    Object.values(analysis.byType).forEach(type => {
      type.averageDuration = type.averageDuration / type.count;
      type.averageSize = type.totalSize / type.count;
    });

    return analysis;
  }

  analyzeVitals() {
    const vitals = this.metrics.vitals;

    return {
      lcp: {
        value: vitals.lcp,
        rating: this.rateLCP(vitals.lcp),
        threshold: 2500 // Good threshold
      },
      fid: {
        value: vitals.fid,
        rating: this.rateFID(vitals.fid),
        threshold: 100 // Good threshold
      },
      cls: {
        value: vitals.cls,
        rating: this.rateCLS(vitals.cls),
        threshold: 0.1 // Good threshold
      }
    };
  }

  rateLCP(value) {
    if (!value) return 'unknown';
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }

  rateFID(value) {
    if (!value) return 'unknown';
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs-improvement';
    return 'poor';
  }

  rateCLS(value) {
    if (!value) return 'unknown';
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  generateRecommendations(resourceAnalysis, vitalsAnalysis) {
    const recommendations = [];

    // LCP recommendations
    if (vitalsAnalysis.lcp.rating === 'poor') {
      recommendations.push({
        type: 'lcp',
        priority: 'high',
        message: 'Largest Contentful Paint is slow. Consider optimizing images, using CDN, or reducing server response time.',
        details: `Current LCP: ${vitalsAnalysis.lcp.value}ms (threshold: ${vitalsAnalysis.lcp.threshold}ms)`
      });
    }

    // FID recommendations
    if (vitalsAnalysis.fid.rating === 'poor') {
      recommendations.push({
        type: 'fid',
        priority: 'high',
        message: 'First Input Delay is high. Consider reducing JavaScript execution time or splitting code.',
        details: `Current FID: ${vitalsAnalysis.fid.value}ms (threshold: ${vitalsAnalysis.fid.threshold}ms)`
      });
    }

    // CLS recommendations
    if (vitalsAnalysis.cls.rating === 'poor') {
      recommendations.push({
        type: 'cls',
        priority: 'medium',
        message: 'Cumulative Layout Shift is high. Ensure proper image dimensions and avoid inserting content above existing content.',
        details: `Current CLS: ${vitalsAnalysis.cls} (threshold: ${vitalsAnalysis.cls.threshold})`
      });
    }

    // Resource size recommendations
    if (resourceAnalysis.totalSize > 1024 * 1024) { // 1MB
      recommendations.push({
        type: 'bundle-size',
        priority: 'medium',
        message: 'Total page size is large. Consider implementing code splitting, lazy loading, or image optimization.',
        details: `Current total size: ${Math.round(resourceAnalysis.totalSize / 1024)}KB`
      });
    }

    // Slow resource recommendations
    if (resourceAnalysis.slowResources.length > 0) {
      recommendations.push({
        type: 'slow-resources',
        priority: 'medium',
        message: `${resourceAnalysis.slowResources.length} resources are loading slowly. Consider optimizing or caching these resources.`,
        details: resourceAnalysis.slowResources.map(r => `${r.name}: ${Math.round(r.duration)}ms`)
      });
    }

    // Memory recommendations
    if (this.metrics.memory.usagePercentage > 80) {
      recommendations.push({
        type: 'memory',
        priority: 'low',
        message: 'Memory usage is high. Consider optimizing data structures and cleaning up unused objects.',
        details: `Current memory usage: ${Math.round(this.metrics.memory.usagePercentage)}%`
      });
    }

    return recommendations;
  }

  calculatePerformanceScore(vitalsAnalysis) {
    let score = 100;

    // Deduct points based on vitals ratings
    if (vitalsAnalysis.lcp.rating === 'poor') score -= 25;
    else if (vitalsAnalysis.lcp.rating === 'needs-improvement') score -= 10;

    if (vitalsAnalysis.fid.rating === 'poor') score -= 25;
    else if (vitalsAnalysis.fid.rating === 'needs-improvement') score -= 10;

    if (vitalsAnalysis.cls.rating === 'poor') score -= 25;
    else if (vitalsAnalysis.cls.rating === 'needs-improvement') score -= 10;

    return Math.max(0, score);
  }

  // Send metrics to analytics service
  async sendMetrics(endpoint) {
    if (!this.enabled) return;

    try {
      const report = this.generateReport();

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
  }
}

// Performance utility functions
export const performanceUtils = {
  // Measure function execution time
  measureFunction(fn, name = 'function') {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  },

  // Measure async function execution time
  async measureAsyncFunction(fn, name = 'async-function') {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();

    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  },

  // Mark performance milestones
  mark(name) {
    if (performance.mark) {
      performance.mark(name);
    }
  },

  // Measure time between marks
  measure(name, startMark, endMark) {
    if (performance.measure) {
      performance.measure(name, startMark, endMark);
      const measures = performance.getEntriesByName(name, 'measure');
      return measures[measures.length - 1];
    }
    return null;
  },

  // Check if performance APIs are available
  isSupported() {
    return {
      navigation: !!performance.timing,
      resource: !!performance.getEntriesByType,
      observer: 'PerformanceObserver' in window,
      memory: !!performance.memory
    };
  }
};

// Create global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  // Initialize after page load
  if (document.readyState === 'complete') {
    performanceMonitor.init();
  } else {
    window.addEventListener('load', () => {
      performanceMonitor.init();
    });
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    performanceMonitor.cleanup();
  });
}

export default performanceMonitor;