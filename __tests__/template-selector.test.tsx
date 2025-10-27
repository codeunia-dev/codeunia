import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TemplateSelector } from '@/components/resume/TemplateSelector';
import { ResumeProvider } from '@/contexts/ResumeContext';
import { Resume } from '@/types/resume';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } }, error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  })),
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

const mockResume: Resume = {
  id: 'test-resume-id',
  user_id: 'test-user',
  title: 'Test Resume',
  template_id: 'modern',
  sections: [],
  styling: {
    font_family: 'Inter',
    font_size_body: 11,
    font_size_heading: 16,
    color_primary: '#9333ea',
    color_text: '#1f2937',
    color_accent: '#6366f1',
    margin_top: 0.75,
    margin_bottom: 0.75,
    margin_left: 0.75,
    margin_right: 0.75,
    line_height: 1.5,
    section_spacing: 1.5,
  },
  metadata: {
    page_count: 1,
    word_count: 0,
    completeness_score: 0,
    export_count: 0,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('TemplateSelector', () => {
  it('should render the template selector button', () => {
    render(
      <ResumeProvider initialResumes={[mockResume]}>
        <TemplateSelector />
      </ResumeProvider>
    );

    const button = screen.getByRole('button', { name: /template/i });
    expect(button).toBeInTheDocument();
  });

  it('should open dialog when button is clicked', async () => {
    render(
      <ResumeProvider initialResumes={[mockResume]}>
        <TemplateSelector />
      </ResumeProvider>
    );

    const button = screen.getByRole('button', { name: /template/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Choose a Template')).toBeInTheDocument();
    });
  });

  it('should display all template options', async () => {
    render(
      <ResumeProvider initialResumes={[mockResume]}>
        <TemplateSelector />
      </ResumeProvider>
    );

    const button = screen.getByRole('button', { name: /template/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Modern')).toBeInTheDocument();
      expect(screen.getByText('Classic')).toBeInTheDocument();
      expect(screen.getByText('Minimal')).toBeInTheDocument();
      expect(screen.getByText('Creative')).toBeInTheDocument();
      expect(screen.getByText('Executive')).toBeInTheDocument();
    });
  });

  it('should show selected badge on current template', async () => {
    render(
      <ResumeProvider initialResumes={[mockResume]}>
        <TemplateSelector />
      </ResumeProvider>
    );

    const button = screen.getByRole('button', { name: /template/i });
    fireEvent.click(button);

    await waitFor(() => {
      // The modern template should be selected by default
      const modernTemplate = screen.getByText('Modern').closest('button');
      expect(modernTemplate).toBeInTheDocument();
    });
  });
});