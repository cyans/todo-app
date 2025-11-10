// @CODE:TAG-UX-ENHANCED-002
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

// Micro-interactions context
const MicroInteractionsContext = createContext();

// Custom hook to use micro-interactions
export const useMicroInteractions = () => {
  const context = useContext(MicroInteractionsContext);
  if (!context) {
    throw new Error('useMicroInteractions must be used within a MicroInteractionsProvider');
  }
  return context;
};

// MicroInteractionsProvider component
export const MicroInteractionsProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({});
  const [feedback, setFeedback] = useState({ type: 'info', message: '' });
  const [interactions, setInteractions] = useState(new Map());
  const [gestures, setGestures] = useState(new Map());
  const debounceTimerRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Haptic feedback
  const triggerHapticFeedback = useCallback((intensity = 'light') => {
    if (navigator.vibrate) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50],
        success: [10, 50, 10],
        error: [100, 50, 100],
        warning: [50, 30, 50],
      };
      navigator.vibrate(patterns[intensity] || patterns.light);
    }
  }, []);

  // Debounce interactions
  const debounceInteraction = useCallback((callback, delay = 100) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(callback, delay);
  }, []);

  // Performance-optimized interaction handling
  const optimizedInteraction = useCallback((callback) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(callback);
  }, []);

  // Register interaction
  const registerInteraction = useCallback((type, options = {}) => {
    const interactionId = `${type}-${Date.now()}-${Math.random()}`;
    const interaction = {
      id: interactionId,
      type,
      timestamp: Date.now(),
      options,
      element: options.element || null,
    };

    setInteractions(prev => new Map(prev).set(interactionId, interaction));

    // Handle different interaction types
    switch (type) {
      case 'button-click':
        handleButtonClick(interaction);
        break;
      case 'loading-start':
        handleLoadingStart(interaction);
        break;
      case 'loading-end':
        handleLoadingEnd(interaction);
        break;
      case 'hover-start':
        handleHoverStart(interaction);
        break;
      case 'hover-end':
        handleHoverEnd(interaction);
        break;
      case 'swipe':
        handleSwipe(interaction);
        break;
      case 'error':
        handleError(interaction);
        break;
      default:
        handleGenericInteraction(interaction);
    }

    return interactionId;
  }, []);

  // Handle button click interactions
  const handleButtonClick = useCallback((interaction) => {
    const { options } = interaction;

    // Trigger haptic feedback
    triggerHapticFeedback(options.haptic || 'light');

    // Show feedback
    setFeedback({
      type: options.type || 'success',
      message: options.message || 'Action completed successfully!',
    });

    // Add visual feedback to element
    if (options.element) {
      options.element.classList.add('micro-animation-active');
      options.element.classList.add(`interaction-${options.type || 'success'}`);

      setTimeout(() => {
        options.element.classList.remove('micro-animation-active');
        options.element.classList.remove(`interaction-${options.type || 'success'}`);
      }, 300);
    }

    // Clear feedback after delay
    setTimeout(() => {
      setFeedback({ type: 'info', message: '' });
    }, 2000);
  }, [triggerHapticFeedback]);

  // Handle loading start
  const handleLoadingStart = useCallback((interaction) => {
    const { options } = interaction;
    const loadingKey = options.key || 'main';

    setLoadingStates(prev => ({
      ...prev,
      [loadingKey]: true,
    }));

    // Show loading feedback
    setFeedback({
      type: 'info',
      message: options.message || 'Loading...',
    });
  }, []);

  // Handle loading end
  const handleLoadingEnd = useCallback((interaction) => {
    const { options } = interaction;
    const loadingKey = options.key || 'main';

    setLoadingStates(prev => ({
      ...prev,
      [loadingKey]: false,
    }));

    // Show completion feedback
    setFeedback({
      type: options.successType || 'success',
      message: options.successMessage || 'Completed successfully!',
    });

    // Clear feedback after delay
    setTimeout(() => {
      setFeedback({ type: 'info', message: '' });
    }, 2000);
  }, []);

  // Handle hover start
  const handleHoverStart = useCallback((interaction) => {
    const { options } = interaction;

    if (options.element) {
      options.element.classList.add('hover-active');
    }

    triggerHapticFeedback('light');
  }, [triggerHapticFeedback]);

  // Handle hover end
  const handleHoverEnd = useCallback((interaction) => {
    const { options } = interaction;

    if (options.element) {
      options.element.classList.remove('hover-active');
    }
  }, []);

  // Handle swipe gestures
  const handleSwipe = useCallback((interaction) => {
    const { options } = interaction;

    // Register swipe gesture
    const gestureId = `swipe-${Date.now()}`;
    setGestures(prev => new Map(prev).set(gestureId, {
      type: 'swipe',
      direction: options.direction,
      element: options.element,
    }));

    // Add visual feedback
    if (options.element) {
      options.element.classList.add('swipe-detected');
      setTimeout(() => {
        options.element.classList.remove('swipe-detected');
      }, 300);
    }

    triggerHapticFeedback('medium');

    // Show feedback
    setFeedback({
      type: 'info',
      message: `Swiped ${options.direction}`,
    });

    setTimeout(() => {
      setFeedback({ type: 'info', message: '' });
    }, 1500);
  }, [triggerHapticFeedback]);

  // Handle error interactions
  const handleError = useCallback((interaction) => {
    const { options } = interaction;

    console.error('Micro-interaction error:', options.error);

    // Show error feedback
    setFeedback({
      type: 'error',
      message: options.message || 'An error occurred',
    });

    // Trigger error haptic feedback
    triggerHapticFeedback('error');

    // Add error styling to element
    if (options.element) {
      options.element.classList.add('interaction-error');
      setTimeout(() => {
        options.element.classList.remove('interaction-error');
      }, 500);
    }
  }, [triggerHapticFeedback]);

  // Handle generic interactions
  const handleGenericInteraction = useCallback((interaction) => {
    const { options } = interaction;

    // Show generic feedback
    if (options.message) {
      setFeedback({
        type: options.type || 'info',
        message: options.message,
      });

      setTimeout(() => {
        setFeedback({ type: 'info', message: '' });
      }, 2000);
    }

    // Trigger haptic feedback if specified
    if (options.haptic) {
      triggerHapticFeedback(options.haptic);
    }
  }, [triggerHapticFeedback]);

  // Trigger interaction with debouncing
  const triggerInteraction = useCallback((type, options = {}) => {
    if (options.debounce !== false) {
      debounceInteraction(() => {
        registerInteraction(type, options);
      }, options.debounceDelay || 100);
    } else {
      registerInteraction(type, options);
    }
  }, [registerInteraction, debounceInteraction]);

  // Setup gesture detection
  useEffect(() => {
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      const startX = touch.clientX;
      const startY = touch.clientY;

      const handleTouchEnd = (endEvent) => {
        const touch = endEvent.changedTouches[0];
        const endX = touch.clientX;
        const endY = touch.clientY;

        const deltaX = endX - startX;
        const deltaY = endY - startY;

        // Determine swipe direction
        const minSwipeDistance = 50;
        let direction = null;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (Math.abs(deltaX) > minSwipeDistance) {
            direction = deltaX > 0 ? 'right' : 'left';
          }
        } else {
          if (Math.abs(deltaY) > minSwipeDistance) {
            direction = deltaY > 0 ? 'down' : 'up';
          }
        }

        if (direction) {
          handleSwipe({
            type: 'swipe',
            options: {
              direction,
              element: e.target.closest('.micro-swipe-area'),
            },
          });
        }

        document.removeEventListener('touchend', handleTouchEnd);
      };

      document.addEventListener('touchend', handleTouchEnd);
    };

    // Add touch event listeners to swipe areas
    const swipeAreas = document.querySelectorAll('.micro-swipe-area');
    swipeAreas.forEach(area => {
      area.addEventListener('touchstart', handleTouchStart);
    });

    return () => {
      swipeAreas.forEach(area => {
        area.removeEventListener('touchstart', handleTouchStart);
      });
    };
  }, [handleSwipe]);

  // Setup keyboard interactions
  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;

      // Add keyboard focus styles
      if (target.classList.contains('micro-button')) {
        target.classList.add('keyboard-focused');
      }

      // Handle keyboard activation
      if (e.key === 'Enter' || e.key === ' ') {
        if (target.classList.contains('micro-button')) {
          target.classList.add('keyboard-activated');
        }
      }
    };

    const handleKeyUp = (e) => {
      const target = e.target;

      // Remove keyboard activation styles
      if (e.key === 'Enter' || e.key === ' ') {
        if (target.classList.contains('micro-button')) {
          target.classList.remove('keyboard-activated');
        }
      }
    };

    const handleFocusOut = (e) => {
      const target = e.target;

      // Remove keyboard focus styles
      if (target.classList.contains('micro-button')) {
        target.classList.remove('keyboard-focused');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // Cleanup timers and animation frames
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const value = {
    // Core methods
    registerInteraction,
    triggerInteraction,

    // State
    loadingStates,
    feedback,
    interactions,
    gestures,

    // Utilities
    triggerHapticFeedback,
    setLoadingStates,
    setFeedback,
  };

  return (
    <MicroInteractionsContext.Provider value={value}>
      {children}
    </MicroInteractionsContext.Provider>
  );
};

export default MicroInteractionsProvider;