import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PersonalInfoSection } from '@/components/resume/sections/PersonalInfoSection';
import { PersonalInfo } from '@/types/resume';

describe('PersonalInfoSection', () => {
  const mockOnChange = jest.fn();
  
  const defaultContent: PersonalInfo = {
    full_name: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    summary: '',
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all required fields', () => {
    render(<PersonalInfoSection content={defaultContent} onChange={mockOnChange} />);
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
  });

  it('renders optional fields', () => {
    render(<PersonalInfoSection content={defaultContent} onChange={mockOnChange} />);
    
    expect(screen.getByLabelText(/website/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/linkedin/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/github/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/professional summary/i)).toBeInTheDocument();
  });

  it('calls onChange when full name is updated', () => {
    render(<PersonalInfoSection content={defaultContent} onChange={mockOnChange} />);
    
    const input = screen.getByLabelText(/full name/i);
    fireEvent.change(input, { target: { value: 'John Doe' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultContent,
      full_name: 'John Doe',
    });
  });

  it('validates email format and shows error for invalid email', async () => {
    const { rerender } = render(<PersonalInfoSection content={defaultContent} onChange={mockOnChange} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    
    // Enter invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    // Rerender with updated content
    const updatedContent = { ...defaultContent, email: 'invalid-email' };
    rerender(<PersonalInfoSection content={updatedContent} onChange={mockOnChange} />);
    
    fireEvent.blur(emailInput);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('does not show error for valid email', async () => {
    render(<PersonalInfoSection content={defaultContent} onChange={mockOnChange} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    
    // Enter valid email
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.blur(emailInput);
    
    await waitFor(() => {
      expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument();
    });
  });

  it('validates website URL and shows error for invalid URL', async () => {
    const { rerender } = render(<PersonalInfoSection content={defaultContent} onChange={mockOnChange} />);
    
    const websiteInput = screen.getByLabelText(/website/i);
    
    // Enter invalid URL
    fireEvent.change(websiteInput, { target: { value: 'not a url' } });
    
    // Rerender with updated content
    const updatedContent = { ...defaultContent, website: 'not a url' };
    rerender(<PersonalInfoSection content={updatedContent} onChange={mockOnChange} />);
    
    fireEvent.blur(websiteInput);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument();
    });
  });

  it('accepts valid website URL', async () => {
    render(<PersonalInfoSection content={defaultContent} onChange={mockOnChange} />);
    
    const websiteInput = screen.getByLabelText(/website/i);
    
    // Enter valid URL
    fireEvent.change(websiteInput, { target: { value: 'https://johndoe.com' } });
    fireEvent.blur(websiteInput);
    
    await waitFor(() => {
      expect(screen.queryByText(/please enter a valid url/i)).not.toBeInTheDocument();
    });
  });

  it('validates LinkedIn URL format', async () => {
    const { rerender } = render(<PersonalInfoSection content={defaultContent} onChange={mockOnChange} />);
    
    const linkedinInput = screen.getByLabelText(/linkedin/i);
    
    // Enter invalid LinkedIn URL (with spaces which are not allowed)
    fireEvent.change(linkedinInput, { target: { value: 'not a linkedin url' } });
    
    // Rerender with updated content
    const updatedContent = { ...defaultContent, linkedin: 'not a linkedin url' };
    rerender(<PersonalInfoSection content={updatedContent} onChange={mockOnChange} />);
    
    fireEvent.blur(linkedinInput);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid linkedin url or username/i)).toBeInTheDocument();
    });
  });

  it('accepts valid LinkedIn username', async () => {
    render(<PersonalInfoSection content={defaultContent} onChange={mockOnChange} />);
    
    const linkedinInput = screen.getByLabelText(/linkedin/i);
    
    // Enter valid username
    fireEvent.change(linkedinInput, { target: { value: 'johndoe' } });
    fireEvent.blur(linkedinInput);
    
    await waitFor(() => {
      expect(screen.queryByText(/please enter a valid linkedin url or username/i)).not.toBeInTheDocument();
    });
  });

  it('validates GitHub URL format', async () => {
    const { rerender } = render(<PersonalInfoSection content={defaultContent} onChange={mockOnChange} />);
    
    const githubInput = screen.getByLabelText(/github/i);
    
    // Enter invalid GitHub URL (with spaces which are not allowed)
    fireEvent.change(githubInput, { target: { value: 'not a github url' } });
    
    // Rerender with updated content
    const updatedContent = { ...defaultContent, github: 'not a github url' };
    rerender(<PersonalInfoSection content={updatedContent} onChange={mockOnChange} />);
    
    fireEvent.blur(githubInput);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid github url or username/i)).toBeInTheDocument();
    });
  });

  it('accepts valid GitHub username', async () => {
    render(<PersonalInfoSection content={defaultContent} onChange={mockOnChange} />);
    
    const githubInput = screen.getByLabelText(/github/i);
    
    // Enter valid username
    fireEvent.change(githubInput, { target: { value: 'johndoe' } });
    fireEvent.blur(githubInput);
    
    await waitFor(() => {
      expect(screen.queryByText(/please enter a valid github url or username/i)).not.toBeInTheDocument();
    });
  });

  it('displays character count for summary', () => {
    const contentWithSummary: PersonalInfo = {
      ...defaultContent,
      summary: 'This is a test summary',
    };
    
    render(<PersonalInfoSection content={contentWithSummary} onChange={mockOnChange} />);
    
    expect(screen.getByText(/22 characters/i)).toBeInTheDocument();
  });

  it('updates summary and character count', () => {
    render(<PersonalInfoSection content={defaultContent} onChange={mockOnChange} />);
    
    const summaryInput = screen.getByLabelText(/professional summary/i);
    fireEvent.change(summaryInput, { target: { value: 'New summary text' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultContent,
      summary: 'New summary text',
    });
  });

  it('displays pre-filled content correctly', () => {
    const filledContent: PersonalInfo = {
      full_name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 555-1234',
      location: 'San Francisco, CA',
      website: 'https://johndoe.com',
      linkedin: 'linkedin.com/in/johndoe',
      github: 'github.com/johndoe',
      summary: 'Experienced software engineer',
    };
    
    render(<PersonalInfoSection content={filledContent} onChange={mockOnChange} />);
    
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('+1 555-1234')).toBeInTheDocument();
    expect(screen.getByDisplayValue('San Francisco, CA')).toBeInTheDocument();
  });
});
