// @TEST:UI-UX-DEPLOY-005:RESPONSIVE
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MobileOptimizedCard } from '../components/MobileOptimizedCard';

describe('MobileOptimizedCard Component', () => {
  const defaultProps = {
    title: 'Test Card',
    children: <div>Test Content</div>
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render card with title', () => {
    render(<MobileOptimizedCard {...defaultProps} />);

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply responsive padding and spacing', () => {
    const { container } = render(<MobileOptimizedCard {...defaultProps} />);

    const card = container.firstChild;
    expect(card).toHaveClass('p-3', 'sm:p-4', 'lg:p-6');
  });

  it('should render without title when not provided', () => {
    render(
      <MobileOptimizedCard>
        <div>Content Only</div>
      </MobileOptimizedCard>
    );

    expect(screen.getByText('Content Only')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('should handle click events when clickable', () => {
    const handleClick = vi.fn();
    render(
      <MobileOptimizedCard {...defaultProps} onClick={handleClick} />
    );

    const card = screen.getByText('Test Card').closest('article');
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not be clickable when onClick is not provided', () => {
    render(<MobileOptimizedCard {...defaultProps} />);

    const card = screen.getByRole('article');
    expect(card).not.toHaveAttribute('tabindex');
  });

  it('should show loading state when loading prop is true', () => {
    render(<MobileOptimizedCard {...defaultProps} loading={true} />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should not show loading state when loading prop is false', () => {
    render(<MobileOptimizedCard {...defaultProps} loading={false} />);

    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  it('should display action buttons when actions are provided', () => {
    const actions = [
      { label: 'Edit', onClick: vi.fn() },
      { label: 'Delete', onClick: vi.fn() }
    ];

    render(<MobileOptimizedCard {...defaultProps} actions={actions} />);

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should call action handler when action button is clicked', () => {
    const handleEdit = vi.fn();
    const actions = [{ label: 'Edit', onClick: handleEdit }];

    render(<MobileOptimizedCard {...defaultProps} actions={actions} />);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    expect(handleEdit).toHaveBeenCalledTimes(1);
  });

  it('should show timestamp when provided', () => {
    const timestamp = '2024-01-15T10:30:00Z';
    render(<MobileOptimizedCard {...defaultProps} timestamp={timestamp} />);

    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <MobileOptimizedCard {...defaultProps} className="custom-card" />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('custom-card');
  });

  it('should apply hover effects when clickable', () => {
    const { container } = render(
      <MobileOptimizedCard {...defaultProps} onClick={vi.fn()} />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('hover:shadow-lg', 'transition-all', 'duration-200');
  });

  it('should support different variants', () => {
    const { container, rerender } = render(
      <MobileOptimizedCard {...defaultProps} variant="default" />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('bg-white', 'dark:bg-gray-800');

    rerender(<MobileOptimizedCard {...defaultProps} variant="highlighted" />);
    expect(card).toHaveClass(
      'bg-blue-50',
      'dark:bg-blue-900/20',
      'border-blue-200',
      'dark:border-blue-700'
    );
  });

  it('should handle responsive text sizing', () => {
    render(<MobileOptimizedCard {...defaultProps} />);

    const title = screen.getByRole('heading');
    expect(title).toHaveClass('text-lg', 'sm:text-xl', 'lg:text-2xl');
  });

  it('should be accessible with proper ARIA attributes', () => {
    const handleClick = vi.fn();
    render(
      <MobileOptimizedCard
        {...defaultProps}
        onClick={handleClick}
        aria-label="Test card description"
      />
    );

    const card = screen.getByText('Test Card').closest('article');
    expect(card).toHaveAttribute('aria-label', 'Test card description');
    expect(card).toHaveAttribute('tabindex', '0');
  });

  it('should support keyboard navigation when clickable', () => {
    const handleClick = vi.fn();
    render(
      <MobileOptimizedCard {...defaultProps} onClick={handleClick} />
    );

    const card = screen.getByText('Test Card').closest('article');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(card, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });
});