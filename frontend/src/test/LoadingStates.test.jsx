// @TEST:UI-UX-DEPLOY-005:UX-ENHANCEMENT
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  LoadingSpinner,
  LoadingSkeleton,
  LoadingProgress,
  LoadingDots,
  LoadingPulse
} from '../components/LoadingStates';

describe('LoadingStates Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('LoadingSpinner', () => {
    it('should render spinner with default props', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });

    it('should render with custom size', () => {
      render(<LoadingSpinner size="lg" />);

      const spinner = screen.getByRole('status');
      expect(spinner.firstChild).toHaveClass('animate-spin', 'rounded-full', 'h-8', 'w-8');
    });

    it('should render with custom color', () => {
      render(<LoadingSpinner color="primary" />);

      const spinner = screen.getByRole('status');
      expect(spinner.firstChild).toHaveClass('border-blue-600');
    });

    it('should render with custom className', () => {
      render(<LoadingSpinner className="custom-spinner" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('custom-spinner');
    });

    it('should render with custom label', () => {
      render(<LoadingSpinner label="Custom loading text" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Custom loading text');
    });

    it('should show text when showText is true', () => {
      render(<LoadingSpinner showText />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show custom text', () => {
      render(<LoadingSpinner showText text="Please wait" />);

      expect(screen.getByText('Please wait')).toBeInTheDocument();
    });
  });

  describe('LoadingSkeleton', () => {
    it('should render skeleton with default props', () => {
      const { container } = render(<LoadingSkeleton />);

      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('animate-pulse', 'bg-gray-200', 'dark:bg-gray-700', 'rounded');
    });

    it('should render with custom variant', () => {
      const { container } = render(<LoadingSkeleton variant="text" />);

      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('h-4', 'w-full');
    });

    it('should render with custom width and height', () => {
      const { container } = render(<LoadingSkeleton width="w-32" height="h-6" />);

      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('w-32', 'h-6');
    });

    it('should render with custom className', () => {
      const { container } = render(<LoadingSkeleton className="custom-skeleton" />);

      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('custom-skeleton');
    });

    it('should render circular skeleton', () => {
      const { container } = render(<LoadingSkeleton variant="circle" />);

      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('rounded-full');
    });

    it('should render rectangular skeleton', () => {
      const { container } = render(<LoadingSkeleton variant="rectangular" />);

      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('rounded-md');
    });
  });

  describe('LoadingProgress', () => {
    it('should render progress bar with default props', () => {
      render(<LoadingProgress />);

      const progress = screen.getByRole('progressbar');
      expect(progress).toBeInTheDocument();
      expect(progress).toHaveAttribute('aria-valuenow', '0');
      expect(progress).toHaveAttribute('aria-valuemin', '0');
      expect(progress).toHaveAttribute('aria-valuemax', '100');
    });

    it('should render with custom progress value', () => {
      render(<LoadingProgress value={50} />);

      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('aria-valuenow', '50');
    });

    it('should render with custom size', () => {
      const { container } = render(<LoadingProgress size="lg" />);

      const progress = container.querySelector('.bg-gray-200');
      expect(progress).toHaveClass('h-3');
    });

    it('should render with custom color', () => {
      const { container } = render(<LoadingProgress color="success" />);

      const progressBar = container.querySelector('.bg-green-500');
      expect(progressBar).toBeInTheDocument();
    });

    it('should render with show percentage', () => {
      render(<LoadingProgress value={75} showPercentage />);

      // The percentage is shown in a visually hidden span for accessibility
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('aria-valuenow', '75');
    });

    it('should render with custom label', () => {
      render(<LoadingProgress label="Uploading files" />);

      expect(screen.getByText('Uploading files')).toBeInTheDocument();
    });

    it('should render with striped animation', () => {
      const { container } = render(<LoadingProgress striped />);

      const progressBar = container.querySelector('.animate-pulse');
      expect(progressBar).toBeInTheDocument();
    });

    it('should clamp value to valid range', () => {
      render(<LoadingProgress value={150} />);

      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('aria-valuenow', '100');
    });

    it('should clamp negative values', () => {
      render(<LoadingProgress value={-10} />);

      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveAttribute('aria-valuenow', '0');
    });
  });

  describe('LoadingDots', () => {
    it('should render loading dots with default props', () => {
      render(<LoadingDots />);

      const dots = screen.getByRole('status');
      expect(dots).toBeInTheDocument();
      expect(dots).toHaveAttribute('aria-label', 'Loading');
    });

    it('should render with custom size', () => {
      const { container } = render(<LoadingDots size="lg" />);

      const dotElements = container.querySelectorAll('.bg-current');
      expect(dotElements[0]).toHaveClass('w-3', 'h-3');
    });

    it('should render with custom color', () => {
      const { container } = render(<LoadingDots color="primary" />);

      const dotsContainer = container.firstChild;
      expect(dotsContainer).toHaveClass('text-blue-600');
    });

    it('should render with custom count', () => {
      const { container } = render(<LoadingDots count={5} />);

      const dotElements = container.querySelectorAll('.bg-current');
      expect(dotElements).toHaveLength(5);
    });

    it('should render with custom className', () => {
      render(<LoadingDots className="custom-dots" />);

      const dots = screen.getByRole('status');
      expect(dots).toHaveClass('custom-dots');
    });

    it('should render with animation', () => {
      const { container } = render(<LoadingDots />);

      const dotElements = container.querySelectorAll('.bg-current');
      expect(dotElements[1]).toHaveClass('animate-bounce');
    });
  });

  describe('LoadingPulse', () => {
    it('should render pulse with default props', () => {
      render(<LoadingPulse />);

      const pulse = screen.getByRole('status');
      expect(pulse).toBeInTheDocument();
      expect(pulse).toHaveAttribute('aria-label', 'Loading');
    });

    it('should render with custom size', () => {
      const { container } = render(<LoadingPulse size="lg" />);

      const pulseElements = container.querySelectorAll('.bg-blue-400');
      // Should have two divs with the size classes
      expect(pulseElements[0]).toHaveClass('h-10', 'w-10');
      expect(pulseElements[1]).toHaveClass('h-10', 'w-10');
    });

    it('should render with custom color', () => {
      const { container } = render(<LoadingPulse color="success" />);

      const pulseElement = container.querySelector('.bg-green-400');
      expect(pulseElement).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<LoadingPulse className="custom-pulse" />);

      const pulse = screen.getByRole('status');
      expect(pulse).toHaveClass('custom-pulse');
    });

    it('should render with show text', () => {
      render(<LoadingPulse showText text="Processing..." />);

      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('should render with inline display', () => {
      const { container } = render(<LoadingPulse inline />);

      const pulse = container.firstChild;
      expect(pulse).toHaveClass('inline-flex');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Loading');
      expect(spinner).toHaveAttribute('aria-live', 'polite');
    });

    it('should be keyboard accessible when interactive', () => {
      const { container } = render(<LoadingSpinner interactive />);

      // Interactive spinner should render as a button element
      const element = container.querySelector('button');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Animation Timing', () => {
    it('should apply custom animation duration', () => {
      const { container } = render(<LoadingSpinner animationDuration="slow" />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toHaveClass('duration-1000');
    });

    it('should apply fast animation', () => {
      const { container } = render(<LoadingSpinner animationDuration="fast" />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toHaveClass('duration-300');
    });
  });
});