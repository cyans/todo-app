// @CODE:TAG-UX-ENHANCED-001
import React, { useState, useEffect, useRef, useCallback } from 'react';

// Animation configuration
const ANIMATION_DURATIONS = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slower: '1000ms',
};

const ANIMATION_EASINGS = {
  linear: 'linear',
  ease: 'ease',
  'ease-in': 'ease-in',
  'ease-out': 'ease-out',
  'ease-in-out': 'ease-in-out',
  'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  'bounce-out': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
};

const AnimatedComponent = ({
  children,
  animationType = 'fade',
  direction = 'up',
  duration = 'normal',
  delay = 0,
  easing = 'ease-out',
  trigger = 'onMount',
  infinite = false,
  stagger = 0,
  chain = [],
  themeAware = false,
  onAnimationStart,
  onAnimationEnd,
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState(0);
  const elementRef = useRef(null);
  const observerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Generate animation class names
  const generateAnimationClasses = useCallback(() => {
    const classes = ['animate-component'];

    // Base animation type
    classes.push(`animate-${animationType}`);

    // Direction for slide animations
    if (animationType === 'slide') {
      classes.push(`animate-${animationType}-${direction}`);
    }

    // Duration
    if (typeof duration === 'string' && ANIMATION_DURATIONS[duration]) {
      classes.push(`animate-duration-${duration}`);
    } else if (typeof duration === 'number') {
      classes.push(`animate-duration-custom`);
    }

    // Delay
    if (delay > 0) {
      classes.push(`animate-delay-${delay}`);
    }

    // Easing
    classes.push(`animate-ease-${easing.replace('.', '-')}`);

    // Infinite loop
    if (infinite) {
      classes.push('animate-infinite');
    }

    // Theme aware
    if (themeAware) {
      classes.push('animate-theme-aware');
    }

    // Reduced motion support
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      classes.push('animate-reduced-motion');
    }

    // Trigger specific classes
    if (trigger === 'onHover') {
      classes.push('animate-on-hover');
    } else if (trigger === 'onClick') {
      classes.push('animate-on-click');
    } else if (trigger === 'onScroll') {
      classes.push('animate-on-scroll');
    } else if (trigger === 'onMount') {
      classes.push('animate-on-mount');
    }

    // Stagger
    if (stagger > 0) {
      classes.push('animate-stagger');
    }

    // Chain
    if (chain.length > 0) {
      classes.push('animate-chain');
    }

    // Callbacks
    if (onAnimationStart || onAnimationEnd) {
      classes.push('animate-with-callbacks');
    }

    return classes.join(' ');
  }, [animationType, direction, duration, delay, easing, infinite, themeAware, trigger, stagger, chain, onAnimationStart, onAnimationEnd]);

  // Apply inline styles for dynamic values
  const getAnimationStyles = useCallback(() => {
    const styles = {};

    // Custom duration
    if (typeof duration === 'number') {
      styles['--animation-duration'] = `${duration}ms`;
    } else if (ANIMATION_DURATIONS[duration]) {
      styles['--animation-duration'] = ANIMATION_DURATIONS[duration];
    }

    // Custom delay
    if (delay > 0) {
      styles['--animation-delay'] = `${delay}ms`;
    }

    // Custom easing
    if (ANIMATION_EASINGS[easing]) {
      styles['--animation-easing'] = ANIMATION_EASINGS[easing];
    }

    // Stagger delay
    if (stagger > 0) {
      styles['--animation-stagger'] = `${stagger}ms`;
    }

    return styles;
  }, [duration, delay, easing, stagger]);

  // Handle animation start
  const handleAnimationStart = useCallback(() => {
    if (onAnimationStart) {
      onAnimationStart(animationType, currentAnimation);
    }
  }, [onAnimationStart, animationType, currentAnimation]);

  // Handle animation end
  const handleAnimationEnd = useCallback(() => {
    if (onAnimationEnd) {
      onAnimationEnd(animationType, currentAnimation);
    }

    // Handle animation chaining
    if (chain.length > 0 && currentAnimation < chain.length) {
      timeoutRef.current = setTimeout(() => {
        setCurrentAnimation(prev => prev + 1);
      }, 50); // Small delay between chained animations
    }
  }, [onAnimationEnd, animationType, currentAnimation, chain]);

  // Intersection observer for scroll animations
  const setupIntersectionObserver = useCallback(() => {
    if (!elementRef.current || trigger !== 'onScroll') return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (observerRef.current) {
              observerRef.current.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    observerRef.current.observe(elementRef.current);
  }, [trigger]);

  // Initialize animation
  useEffect(() => {
    if (trigger === 'onMount') {
      setIsVisible(true);
    } else if (trigger === 'onScroll') {
      setupIntersectionObserver();
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [trigger, setupIntersectionObserver]);

  // Handle click animations
  const handleClick = useCallback(() => {
    if (trigger === 'onClick') {
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), parseFloat(ANIMATION_DURATIONS[duration] || duration));
    }
  }, [trigger, duration]);

  // Handle hover animations
  const handleMouseEnter = useCallback(() => {
    if (trigger === 'onHover') {
      setIsVisible(true);
    }
  }, [trigger]);

  const handleMouseLeave = useCallback(() => {
    if (trigger === 'onHover') {
      setIsVisible(false);
    }
  }, [trigger]);

  // Get current animation from chain
  const getCurrentAnimation = useCallback(() => {
    if (chain.length > 0 && currentAnimation < chain.length) {
      return chain[currentAnimation];
    }
    return animationType;
  }, [chain, currentAnimation, animationType]);

  const currentAnimationType = getCurrentAnimation();

  return (
    <div
      ref={elementRef}
      className={`${generateAnimationClasses()} ${className}`}
      style={{
        ...getAnimationStyles(),
        // Set current animation for chained animations
        '--current-animation': currentAnimationType,
        // Visibility control for scroll animations
        opacity: trigger === 'onScroll' && !isVisible ? 0 : undefined,
        // Transform state for slide animations
        ...(trigger === 'onScroll' && !isVisible && currentAnimationType === 'slide' && {
          transform: direction === 'up' ? 'translateY(20px)' :
                   direction === 'down' ? 'translateY(-20px)' :
                   direction === 'left' ? 'translateX(20px)' :
                   'translateX(-20px)',
        }),
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onAnimationStart={handleAnimationStart}
      onAnimationEnd={handleAnimationEnd}
      {...props}
    >
      {children}
    </div>
  );
};

export default AnimatedComponent;