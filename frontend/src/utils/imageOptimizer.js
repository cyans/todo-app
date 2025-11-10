/* @CODE:TAG-UI-PERFORMANCE-001 - Image optimization and responsive images utility */

/**
 * Image optimization utilities for responsive images and performance
 * Provides responsive image generation, format selection, and optimization
 */

// Image format detection and optimization
export class ImageOptimizer {
  constructor() {
    this.supportedFormats = this.detectSupportedFormats();
    this.optimizedCache = new Map();
  }

  // Detect supported image formats
  detectSupportedFormats() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext && canvas.getContext('2d');

    return {
      webp: this.supportsWebP(),
      avif: this.supportsAVIF(),
      webpLossless: this.supportsWebPLossless(),
      fallback: true // Always support basic formats
    };
  }

  // WebP support detection
  supportsWebP() {
    if (typeof window === 'undefined') return false;

    const webP = new Image();
    webP.onload = webP.onerror = function() {
      ImageOptimizer.prototype.supportsWebP = () => webP.height === 2;
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';

    return false; // Will be updated asynchronously
  }

  // AVIF support detection
  supportsAVIF() {
    if (typeof window === 'undefined') return false;

    const avif = new Image();
    avif.onload = avif.onerror = function() {
      ImageOptimizer.prototype.supportsAVIF = () => avif.height === 2;
    };
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';

    return false; // Will be updated asynchronously
  }

  // WebP lossless support detection
  supportsWebPLossless() {
    // Simple check - assume WebP support includes lossless
    return this.supportsWebP();
  }

  // Get optimal image format for current browser
  getOptimalFormat(options = {}) {
    const {
      preferQuality = true,
      fileSize = false,
      transparency = false
    } = options;

    // Priority order based on browser support and requirements
    if (this.supportedFormats.avif && preferQuality) {
      return 'avif';
    }

    if (this.supportedFormats.webp) {
      return transparency ? 'webp' : 'webp';
    }

    return 'jpeg'; // Fallback format
  }

  // Generate responsive image sources
  generateResponsiveSources(baseImage, options = {}) {
    const {
      widths = [320, 640, 768, 1024, 1280, 1536],
      quality = 80,
      format = null,
      sizes = null,
      artDirection = null
    } = options;

    const sources = [];
    const optimalFormat = format || this.getOptimalFormat();

    widths.forEach(width => {
      const src = this.generateOptimizedUrl(baseImage, {
        width,
        quality,
        format: optimalFormat
      });

      sources.push({
        src,
        width,
        format: optimalFormat
      });
    });

    return sources;
  }

  // Generate optimized image URL
  generateOptimizedUrl(baseImage, options = {}) {
    const {
      width,
      height,
      quality = 80,
      format = null,
      crop = null,
      fit = 'cover'
    } = options;

    // Check cache first
    const cacheKey = `${baseImage}-${JSON.stringify(options)}`;
    if (this.optimizedCache.has(cacheKey)) {
      return this.optimizedCache.get(cacheKey);
    }

    // This would integrate with your image optimization service
    // For now, return the base image with simulated optimization
    const optimizedUrl = this.buildImageUrl(baseImage, {
      width,
      height,
      quality,
      format: format || this.getOptimalFormat(),
      crop,
      fit
    });

    this.optimizedCache.set(cacheKey, optimizedUrl);
    return optimizedUrl;
  }

  // Build image URL with optimization parameters
  buildImageUrl(baseImage, params) {
    if (!baseImage) return '';

    // If using an image optimization service like imgix, cloudinary, etc.
    // This would build the appropriate URL
    // For demonstration, we'll simulate the URL structure

    const url = new URL(baseImage, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, value);
      }
    });

    return url.toString();
  }

  // Generate picture element markup
  generatePictureElement(baseImage, options = {}) {
    const {
      alt = '',
      className = '',
      loading = 'lazy',
      sizes = null,
      breakpoints = [640, 768, 1024, 1280],
      artDirection = null,
      fallbackImage = null
    } = options;

    const sources = [];
    const optimalFormat = this.getOptimalFormat();

    // Generate sources for different breakpoints
    breakpoints.forEach((breakpoint, index) => {
      const width = breakpoint;
      const media = `(min-width: ${breakpoint}px)`;

      if (artDirection && artDirection[breakpoint]) {
        // Art direction - different image for different breakpoints
        const artSrc = this.generateResponsiveSources(artDirection[breakpoint], {
          widths: [width]
        })[0];

        sources.push({
          media,
          srcSet: artSrc.src,
          type: `image/${artSrc.format}`
        });
      } else {
        // Responsive sizing - same image, different sizes
        const responsiveSources = this.generateResponsiveSources(baseImage, {
          widths: [width],
          format: optimalFormat
        });

        sources.push({
          media,
          srcSet: responsiveSources[0].src,
          type: `image/${optimalFormat}`
        });
      }
    });

    // Generate fallback srcset
    const fallbackSources = this.generateResponsiveSources(
      fallbackImage || baseImage,
      { format: 'jpeg' }
    );

    return {
      sources,
      fallback: {
        srcSet: fallbackSources.map(s => s.src).join(', '),
        sizes: sizes || this.generateSizesString(breakpoints),
        src: fallbackSources[fallbackSources.length - 1].src,
        alt,
        className,
        loading
      }
    };
  }

  // Generate sizes attribute for responsive images
  generateSizesString(breakpoints) {
    const sizes = [];

    breakpoints.forEach((breakpoint, index) => {
      if (index === 0) {
        sizes.push(`(max-width: ${breakpoint}px) 100vw`);
      } else {
        const prevBreakpoint = breakpoints[index - 1];
        sizes.push(`(min-width: ${prevBreakpoint}px) ${Math.min(breakpoint, 1200)}px`);
      }
    });

    // Default size for largest screens
    sizes.push('1200px');

    return sizes.join(', ');
  }

  // Preload critical images
  preloadImages(urls, priority = 'high') {
    if (typeof window === 'undefined') return Promise.resolve();

    const preloadPromises = urls.map(url => {
      return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;

        if (priority === 'high') {
          link.setAttribute('importance', 'high');
        }

        link.onload = resolve;
        link.onerror = reject;

        document.head.appendChild(link);
      });
    });

    return Promise.allSettled(preloadPromises);
  }

  // Estimate image file size (rough estimation)
  estimateFileSize(width, height, format, quality = 80) {
    const pixels = width * height;
    const baseBytesPerPixel = {
      'jpeg': 0.5,
      'webp': 0.4,
      'avif': 0.3,
      'png': 4.0,
      'gif': 2.0
    };

    const qualityMultiplier = quality / 100;
    const bytesPerPixel = (baseBytesPerPixel[format] || 0.5) * qualityMultiplier;

    return Math.round(pixels * bytesPerPixel);
  }

  // Optimize image for specific use case
  optimizeForUseCase(baseImage, useCase, options = {}) {
    const useCaseConfig = {
      'hero': {
        quality: 85,
        widths: [768, 1024, 1280, 1536],
        priority: 'high',
        preload: true
      },
      'thumbnail': {
        quality: 70,
        widths: [150, 300],
        priority: 'low',
        format: 'webp'
      },
      'gallery': {
        quality: 75,
        widths: [400, 800, 1200],
        priority: 'medium',
        lazy: true
      },
      'avatar': {
        quality: 80,
        widths: [64, 128, 256],
        priority: 'medium',
        format: 'webp',
        crop: 'center'
      },
      'background': {
        quality: 60,
        widths: [1920, 2560],
        priority: 'low',
        lazy: true
      }
    };

    const config = useCaseConfig[useCase] || useCaseConfig['gallery'];
    const mergedOptions = { ...config, ...options };

    return this.generateResponsiveSources(baseImage, mergedOptions);
  }
}

// Image lazy loading with intersection observer
export class LazyImageLoader {
  constructor() {
    this.observer = null;
    this.loadedImages = new WeakSet();
    this.setupObserver();
  }

  setupObserver() {
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, lazy loading disabled');
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });
  }

  loadImage(img) {
    if (this.loadedImages.has(img)) return;

    const src = img.dataset.src;
    const srcset = img.dataset.srcset;
    const sizes = img.dataset.sizes;

    if (src) img.src = src;
    if (srcset) img.srcset = srcset;
    if (sizes) img.sizes = sizes;

    img.classList.remove('lazy-image');
    img.classList.add('lazy-image-loaded');
    this.loadedImages.add(img);
  }

  observe(img) {
    if (this.observer && !this.loadedImages.has(img)) {
      this.observer.observe(img);
    }
  }

  unobserve(img) {
    if (this.observer) {
      this.observer.unobserve(img);
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// Progressive image loading
export class ProgressiveImageLoader {
  constructor() {
    this.cache = new Map();
  }

  // Load image with low quality placeholder then high quality
  async loadProgressive(imageUrl, options = {}) {
    const {
      lowQualityUrl = null,
      quality = 80,
      widths = [400, 800, 1200]
    } = options;

    const cacheKey = `${imageUrl}-${JSON.stringify(options)}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const imageOptimizer = new ImageOptimizer();

    // Generate low quality placeholder
    const lqip = lowQualityUrl || imageOptimizer.generateOptimizedUrl(imageUrl, {
      width: 64,
      quality: 20,
      format: 'webp'
    });

    // Generate high quality sources
    const hqSources = imageOptimizer.generateResponsiveSources(imageUrl, {
      widths,
      quality,
      format: imageOptimizer.getOptimalFormat()
    });

    const result = {
      placeholder: lqip,
      sources: hqSources,
      load: () => this.loadImageSet(hqSources)
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  // Load image set with progressive enhancement
  async loadImageSet(sources) {
    const loadPromises = sources.map(source => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(source);
        img.onerror = reject;
        img.src = source.src;
      });
    });

    try {
      const loadedSources = await Promise.allSettled(loadPromises);
      return loadedSources.filter(result => result.status === 'fulfilled')
        .map(result => result.value);
    } catch (error) {
      console.error('Failed to load progressive images:', error);
      return sources;
    }
  }
}

// Responsive image React component helper
export const createResponsiveImageProps = (src, options = {}) => {
  const optimizer = new ImageOptimizer();
  const pictureData = optimizer.generatePictureElement(src, options);

  return {
    src: pictureData.fallback.src,
    srcSet: pictureData.fallback.srcSet,
    sizes: pictureData.fallback.sizes,
    alt: pictureData.fallback.alt,
    className: pictureData.fallback.className,
    loading: pictureData.fallback.loading,
    // Additional props for picture element if needed
    pictureSources: pictureData.sources.map(source => ({
      media: source.media,
      srcSet: source.srcSet,
      type: source.type
    }))
  };
};

// Create global instances
export const imageOptimizer = new ImageOptimizer();
export const lazyImageLoader = new LazyImageLoader();
export const progressiveImageLoader = new ProgressiveImageLoader();

// Auto-setup lazy loading for images with data-lazy attribute
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('img[data-lazy]');
    lazyImages.forEach(img => {
      img.classList.add('lazy-image');
      lazyImageLoader.observe(img);
    });
  });
}

export default {
  ImageOptimizer,
  LazyImageLoader,
  ProgressiveImageLoader,
  imageOptimizer,
  lazyImageLoader,
  progressiveImageLoader,
  createResponsiveImageProps
};