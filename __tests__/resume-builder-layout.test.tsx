/**
 * Resume Builder Layout Tests
 * Tests for responsive layout behavior
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { ResumeBuilderLayout } from '@/components/resume/ResumeBuilderLayout';
import '@testing-library/jest-dom';
import React from 'react';

// Mock the hooks
const mockUseIsMobile = jest.fn();
const mockUseResume = jest.fn();

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => mockUseIsMobile(),
}));

jest.mock('@/contexts/ResumeContext', () => ({
  useResume: () => mockUseResume(),
  ResumeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock child components
jest.mock('@/components/resume/ResumeEditor', () => ({
  ResumeEditor: () => <div data-testid="resume-editor">Resume Editor</div>,
}));

jest.mock('@/components/resume/ResumePreview', () => ({
  ResumePreview: () => <div data-testid="resume-preview">Resume Preview</div>,
}));

describe('ResumeBuilderLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    mockUseResume.mockReturnValue({
      resume: null,
      resumes: [],
      loading: false,
      saving: false,
      error: null,
    });
    
    mockUseIsMobile.mockReturnValue(false);
  });

  describe('Loading State', () => {
    test('should display loading spinner when loading', () => {
      mockUseResume.mockReturnValue({
        resume: null,
        resumes: [],
        loading: true,
        saving: false,
        error: null,
      });
      
      mockUseIsMobile.mockReturnValue(false);

      render(<ResumeBuilderLayout />);

      expect(screen.getByText('Loading Resume Builder...')).toBeInTheDocument();
    });
  });

  describe('Desktop Layout', () => {
    test('should render split-panel layout on desktop', () => {
      mockUseIsMobile.mockReturnValue(false);

      render(<ResumeBuilderLayout />);

      // Both editor and preview should be visible
      expect(screen.getByTestId('resume-editor')).toBeInTheDocument();
      expect(screen.getByTestId('resume-preview')).toBeInTheDocument();
    });

    test('should not render tabs on desktop', () => {
      mockUseIsMobile.mockReturnValue(false);

      render(<ResumeBuilderLayout />);

      // Tab triggers should not be present
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
      expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    });
  });

  describe('Mobile Layout', () => {
    test('should render tabbed interface on mobile', () => {
      mockUseIsMobile.mockReturnValue(true);

      render(<ResumeBuilderLayout />);

      // Tab triggers should be present
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    test('should show editor by default on mobile', () => {
      mockUseIsMobile.mockReturnValue(true);

      render(<ResumeBuilderLayout />);

      // Editor should be visible by default
      expect(screen.getByTestId('resume-editor')).toBeInTheDocument();
    });
  });

  describe('Responsive Breakpoint Detection', () => {
    test('should handle breakpoint changes', () => {
      // Start with desktop
      mockUseIsMobile.mockReturnValue(false);
      const { rerender } = render(<ResumeBuilderLayout />);

      // Verify split-panel layout
      expect(screen.getByTestId('resume-editor')).toBeInTheDocument();
      expect(screen.getByTestId('resume-preview')).toBeInTheDocument();

      // Switch to mobile
      mockUseIsMobile.mockReturnValue(true);
      rerender(<ResumeBuilderLayout />);

      // Verify tabbed interface
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });
  });

  describe('Hydration Safety', () => {
    test('should handle hydration without errors', () => {
      mockUseIsMobile.mockReturnValue(false);

      const { container } = render(<ResumeBuilderLayout />);

      // Component should render without throwing
      expect(container).toBeInTheDocument();
    });
  });
});
