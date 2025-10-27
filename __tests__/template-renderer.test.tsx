import React from 'react';
import { render, screen } from '@testing-library/react';
import { TemplateRenderer } from '@/components/resume/templates/TemplateRenderer';
import { Resume } from '@/types/resume';

// Mock the template components
jest.mock('@/components/resume/templates/ModernTemplate', () => ({
  ModernTemplate: ({ resume }: { resume: Resume }) => (
    <div data-testid="modern-template">Modern Template: {resume.title}</div>
  ),
}));

jest.mock('@/components/resume/templates/ClassicTemplate', () => ({
  ClassicTemplate: ({ resume }: { resume: Resume }) => (
    <div data-testid="classic-template">Classic Template: {resume.title}</div>
  ),
}));

jest.mock('@/components/resume/templates/MinimalTemplate', () => ({
  MinimalTemplate: ({ resume }: { resume: Resume }) => (
    <div data-testid="minimal-template">Minimal Template: {resume.title}</div>
  ),
}));

jest.mock('@/components/resume/templates/CreativeTemplate', () => ({
  CreativeTemplate: ({ resume }: { resume: Resume }) => (
    <div data-testid="creative-template">Creative Template: {resume.title}</div>
  ),
}));

jest.mock('@/components/resume/templates/ExecutiveTemplate', () => ({
  ExecutiveTemplate: ({ resume }: { resume: Resume }) => (
    <div data-testid="executive-template">Executive Template: {resume.title}</div>
  ),
}));

const createMockResume = (templateId: string): Resume => ({
  id: '1',
  user_id: 'user-1',
  title: 'Test Resume',
  template_id: templateId,
  sections: [],
  styling: {
    font_family: 'Arial',
    font_size_body: 12,
    font_size_heading: 16,
    color_primary: '#000000',
    color_text: '#333333',
    color_accent: '#666666',
    margin_top: 1,
    margin_bottom: 1,
    margin_left: 1,
    margin_right: 1,
    line_height: 1.5,
    section_spacing: 1,
  },
  metadata: {
    page_count: 1,
    word_count: 0,
    completeness_score: 0,
    export_count: 0,
  },
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
});

describe('TemplateRenderer', () => {
  it('should render null when no resume is provided', () => {
    const { container } = render(<TemplateRenderer resume={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render ModernTemplate when template_id is "modern"', () => {
    const resume = createMockResume('modern');
    render(<TemplateRenderer resume={resume} />);
    expect(screen.getByTestId('modern-template')).toBeInTheDocument();
    expect(screen.getByText('Modern Template: Test Resume')).toBeInTheDocument();
  });

  it('should render ClassicTemplate when template_id is "classic"', async () => {
    const resume = createMockResume('classic');
    render(<TemplateRenderer resume={resume} />);
    // Wait for template transition to complete
    await screen.findByTestId('classic-template');
    expect(screen.getByTestId('classic-template')).toBeInTheDocument();
  });

  it('should render MinimalTemplate when template_id is "minimal"', async () => {
    const resume = createMockResume('minimal');
    render(<TemplateRenderer resume={resume} />);
    // Wait for template transition to complete
    await screen.findByTestId('minimal-template');
    expect(screen.getByTestId('minimal-template')).toBeInTheDocument();
  });

  it('should render CreativeTemplate when template_id is "creative"', async () => {
    const resume = createMockResume('creative');
    render(<TemplateRenderer resume={resume} />);
    // Wait for template transition to complete
    await screen.findByTestId('creative-template');
    expect(screen.getByTestId('creative-template')).toBeInTheDocument();
  });

  it('should render ExecutiveTemplate when template_id is "executive"', async () => {
    const resume = createMockResume('executive');
    render(<TemplateRenderer resume={resume} />);
    // Wait for template transition to complete
    await screen.findByTestId('executive-template');
    expect(screen.getByTestId('executive-template')).toBeInTheDocument();
  });

  it('should default to ModernTemplate when template_id is invalid', () => {
    const resume = createMockResume('invalid-template');
    render(<TemplateRenderer resume={resume} />);
    expect(screen.getByTestId('modern-template')).toBeInTheDocument();
  });

  it('should default to ModernTemplate when template_id is empty', () => {
    const resume = createMockResume('');
    render(<TemplateRenderer resume={resume} />);
    expect(screen.getByTestId('modern-template')).toBeInTheDocument();
  });
});
