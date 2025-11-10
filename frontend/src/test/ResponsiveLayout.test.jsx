// @TEST:UI-UX-DEPLOY-005:RESPONSIVE
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ResponsiveLayout } from '../components/ResponsiveLayout';

describe('ResponsiveLayout Component', () => {
  it('should render children correctly', () => {
    render(
      <ResponsiveLayout>
        <div data-testid="test-content">Test Content</div>
      </ResponsiveLayout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('should apply responsive container classes', () => {
    const { container } = render(
      <ResponsiveLayout>
        <div>Test</div>
      </ResponsiveLayout>
    );

    const layout = container.firstChild;
    expect(layout).toHaveClass('container', 'mx-auto', 'px-3', 'sm:px-4', 'lg:px-6', 'xl:px-8');
  });

  it('should handle custom className prop', () => {
    const { container } = render(
      <ResponsiveLayout className="custom-class">
        <div>Test</div>
      </ResponsiveLayout>
    );

    const layout = container.firstChild;
    expect(layout).toHaveClass('custom-class');
  });

  it('should render header when title is provided', () => {
    render(
      <ResponsiveLayout title="Test Title">
        <div>Content</div>
      </ResponsiveLayout>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should render subtitle when provided', () => {
    render(
      <ResponsiveLayout title="Title" subtitle="Test Subtitle">
        <div>Content</div>
      </ResponsiveLayout>
    );

    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('should not render header when title is not provided', () => {
    render(
      <ResponsiveLayout>
        <div>Content</div>
      </ResponsiveLayout>
    );

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('should apply responsive padding to main content', () => {
    const { container } = render(
      <ResponsiveLayout>
        <div>Content</div>
      </ResponsiveLayout>
    );

    const main = container.querySelector('main');
    expect(main).toHaveClass('py-4', 'sm:py-6', 'lg:py-8', 'xl:py-12');
  });

  it('should handle max-width customization', () => {
    const { container } = render(
      <ResponsiveLayout maxWidth="7xl">
        <div>Content</div>
      </ResponsiveLayout>
    );

    const layout = container.firstChild;
    expect(layout).toHaveClass('max-w-7xl');
  });

  it('should apply background gradient by default', () => {
    const { container } = render(
      <ResponsiveLayout>
        <div>Content</div>
      </ResponsiveLayout>
    );

    const layout = container.firstChild;
    expect(layout).toHaveClass(
      'bg-gradient-to-br',
      'from-blue-50',
      'via-white',
      'to-purple-50'
    );
  });

  it('should support custom background classes', () => {
    const { container } = render(
      <ResponsiveLayout background="bg-gray-100">
        <div>Content</div>
      </ResponsiveLayout>
    );

    const layout = container.firstChild;
    expect(layout).toHaveClass('bg-gray-100');
  });
});