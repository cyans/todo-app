// @TEST:TAG-UX-ENHANCED-001
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '../ThemeProvider';
import AnimatedComponent from '../AnimatedComponent';

// Test component that consumes animations
const TestAnimatedComponent = () => {
  return (
    <div>
      <AnimatedComponent animationType="fade" className="test-element">
        <div data-testid="fade-content">Fade Content</div>
      </AnimatedComponent>

      <AnimatedComponent animationType="slide" direction="up" className="test-element">
        <div data-testid="slide-content">Slide Content</div>
      </AnimatedComponent>

      <AnimatedComponent animationType="scale" className="test-element">
        <div data-testid="scale-content">Scale Content</div>
      </AnimatedComponent>

      <AnimatedComponent animationType="bounce" className="test-element">
        <div data-testid="bounce-content">Bounce Content</div>
      </AnimatedComponent>
    </div>
  );
};

describe('AnimatedComponent - Advanced Animations and Transitions', () => {
  beforeEach(() => {
    cleanup();
    // Clear any animation-related styles
    document.documentElement.removeAttribute('style');
  });

  afterEach(() => {
    cleanup();
  });

  it('should apply fade animation correctly', () => {
    render(
      <ThemeProvider>
        <TestAnimatedComponent />
      </ThemeProvider>
    );

    const fadeContent = screen.getByTestId('fade-content');
    const fadeElement = fadeContent.closest('.test-element');

    // Should have fade animation classes
    expect(fadeElement).toHaveClass('animate-fade');
  });

  it('should apply slide animation with correct direction', () => {
    render(
      <ThemeProvider>
        <TestAnimatedComponent />
      </ThemeProvider>
    );

    const slideContent = screen.getByTestId('slide-content');
    const slideElement = slideContent.closest('.test-element');

    // Should have slide animation classes with direction
    expect(slideElement).toHaveClass('animate-slide-up');
  });

  it('should apply scale animation correctly', () => {
    render(
      <ThemeProvider>
        <TestAnimatedComponent />
      </ThemeProvider>
    );

    const scaleContent = screen.getByTestId('scale-content');
    const scaleElement = scaleContent.closest('.test-element');

    // Should have scale animation classes
    expect(scaleElement).toHaveClass('animate-scale');
  });

  it('should apply bounce animation correctly', () => {
    render(
      <ThemeProvider>
        <TestAnimatedComponent />
      </ThemeProvider>
    );

    const bounceContent = screen.getByTestId('bounce-content');
    const bounceElement = bounceContent.closest('.test-element');

    // Should have bounce animation classes
    expect(bounceElement).toHaveClass('animate-bounce');
  });

  it('should support animation duration customization', () => {
    render(
      <ThemeProvider>
        <AnimatedComponent animationType="fade" duration="slow" className="test-duration">
          <div data-testid="duration-content">Duration Test</div>
        </AnimatedComponent>
      </ThemeProvider>
    );

    const content = screen.getByTestId('duration-content');
    const element = content.closest('.test-duration');

    // Should have duration-specific class
    expect(element).toHaveClass('animate-duration-slow');
  });

  it('should support animation delay customization', () => {
    render(
      <ThemeProvider>
        <AnimatedComponent animationType="fade" delay={200} className="test-delay">
          <div data-testid="delay-content">Delay Test</div>
        </AnimatedComponent>
      </ThemeProvider>
    );

    const content = screen.getByTestId('delay-content');
    const element = content.closest('.test-delay');

    // Should have delay-specific class
    expect(element).toHaveClass('animate-delay-200');
  });

  it('should support infinite animation loop', () => {
    render(
      <ThemeProvider>
        <AnimatedComponent animationType="bounce" infinite className="test-infinite">
          <div data-testid="infinite-content">Infinite Test</div>
        </AnimatedComponent>
      </ThemeProvider>
    );

    const content = screen.getByTestId('infinite-content');
    const element = content.closest('.test-infinite');

    // Should have infinite animation class
    expect(element).toHaveClass('animate-infinite');
  });

  it('should support animation easing functions', () => {
    render(
      <ThemeProvider>
        <AnimatedComponent animationType="fade" easing="ease-out" className="test-easing">
          <div data-testid="easing-content">Easing Test</div>
        </AnimatedComponent>
      </ThemeProvider>
    );

    const content = screen.getByTestId('easing-content');
    const element = content.closest('.test-easing');

    // Should have easing-specific class
    expect(element).toHaveClass('animate-ease-ease-out');
  });

  it('should handle animation onMount trigger', () => {
    render(
      <ThemeProvider>
        <AnimatedComponent animationType="fade" trigger="onMount" className="test-mount">
          <div data-testid="mount-content">Mount Test</div>
        </AnimatedComponent>
      </ThemeProvider>
    );

    const content = screen.getByTestId('mount-content');
    const element = content.closest('.test-mount');

    // Should have mount animation class
    expect(element).toHaveClass('animate-on-mount');
  });

  it('should handle animation onHover trigger', () => {
    render(
      <ThemeProvider>
        <AnimatedComponent animationType="scale" trigger="onHover" className="test-hover">
          <div data-testid="hover-content">Hover Test</div>
        </AnimatedComponent>
      </ThemeProvider>
    );

    const content = screen.getByTestId('hover-content');
    const element = content.closest('.test-hover');

    // Should have hover animation class
    expect(element).toHaveClass('animate-on-hover');
  });

  it('should handle animation onClick trigger', () => {
    render(
      <ThemeProvider>
        <AnimatedComponent animationType="bounce" trigger="onClick" className="test-click">
          <div data-testid="click-content">Click Test</div>
        </AnimatedComponent>
      </ThemeProvider>
    );

    const content = screen.getByTestId('click-content');
    const element = content.closest('.test-click');

    // Should have click animation class
    expect(element).toHaveClass('animate-on-click');
  });

  it('should handle animation onScroll trigger', () => {
    render(
      <ThemeProvider>
        <AnimatedComponent animationType="fade" trigger="onScroll" className="test-scroll">
          <div data-testid="scroll-content">Scroll Test</div>
        </AnimatedComponent>
      </ThemeProvider>
    );

    const content = screen.getByTestId('scroll-content');
    const element = content.closest('.test-scroll');

    // Should have scroll animation class
    expect(element).toHaveClass('animate-on-scroll');
  });

  it('should support animation callbacks', () => {
    const onAnimationStart = vi.fn();
    const onAnimationEnd = vi.fn();

    render(
      <ThemeProvider>
        <AnimatedComponent
          animationType="fade"
          onAnimationStart={onAnimationStart}
          onAnimationEnd={onAnimationEnd}
          className="test-callbacks"
        >
          <div data-testid="callbacks-content">Callbacks Test</div>
        </AnimatedComponent>
      </ThemeProvider>
    );

    const content = screen.getByTestId('callbacks-content');
    const element = content.closest('.test-callbacks');

    // Should have callback support class
    expect(element).toHaveClass('animate-with-callbacks');
  });

  it('should handle theme-aware animations', () => {
    render(
      <ThemeProvider>
        <AnimatedComponent animationType="fade" themeAware className="test-theme-aware">
          <div data-testid="theme-aware-content">Theme Aware Test</div>
        </AnimatedComponent>
      </ThemeProvider>
    );

    const content = screen.getByTestId('theme-aware-content');
    const element = content.closest('.test-theme-aware');

    // Should have theme-aware animation class
    expect(element).toHaveClass('animate-theme-aware');
  });

  it('should support reduced motion for accessibility', () => {
    // Mock prefers-reduced-motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(
      <ThemeProvider>
        <AnimatedComponent animationType="fade" className="test-reduced-motion">
          <div data-testid="reduced-motion-content">Reduced Motion Test</div>
        </AnimatedComponent>
      </ThemeProvider>
    );

    const content = screen.getByTestId('reduced-motion-content');
    const element = content.closest('.test-reduced-motion');

    // Should have reduced motion class
    expect(element).toHaveClass('animate-reduced-motion');
  });

  it('should support staggered animations for lists', () => {
    render(
      <ThemeProvider>
        <AnimatedComponent animationType="fade" stagger={100} className="test-stagger">
          <div data-testid="stagger-content">Stagger Test</div>
        </AnimatedComponent>
      </ThemeProvider>
    );

    const content = screen.getByTestId('stagger-content');
    const element = content.closest('.test-stagger');

    // Should have stagger animation class
    expect(element).toHaveClass('animate-stagger');
  });

  it('should support animation chaining', () => {
    render(
      <ThemeProvider>
        <AnimatedComponent
          animationType="fade"
          chain={['scale', 'slide']}
          className="test-chain"
        >
          <div data-testid="chain-content">Chain Test</div>
        </AnimatedComponent>
      </ThemeProvider>
    );

    const content = screen.getByTestId('chain-content');
    const element = content.closest('.test-chain');

    // Should have chained animation class
    expect(element).toHaveClass('animate-chain');
  });
});