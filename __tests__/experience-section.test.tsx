import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExperienceSection } from '@/components/resume/sections/ExperienceSection';
import { Experience } from '@/types/resume';

describe('ExperienceSection', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render empty state when no experience entries exist', () => {
    render(<ExperienceSection content={[]} onChange={mockOnChange} />);
    
    expect(screen.getByText('No work experience entries yet')).toBeInTheDocument();
    expect(screen.getByText('Click "Add Experience" to get started')).toBeInTheDocument();
  });

  it('should render add experience button', () => {
    render(<ExperienceSection content={[]} onChange={mockOnChange} />);
    
    expect(screen.getByRole('button', { name: /add experience/i })).toBeInTheDocument();
  });

  it('should add a new experience entry when add button is clicked', () => {
    render(<ExperienceSection content={[]} onChange={mockOnChange} />);
    
    const addButton = screen.getByRole('button', { name: /add experience/i });
    fireEvent.click(addButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          company: '',
          position: '',
          location: '',
          current: false,
          description: '',
          achievements: [],
        })
      ])
    );
  });

  it('should render experience entry with all required fields', () => {
    const experience: Experience = {
      id: '1',
      company: 'Google',
      position: 'Software Engineer',
      location: 'Mountain View, CA',
      start_date: '2020-01',
      end_date: '2023-05',
      current: false,
      description: 'Developed scalable web applications',
      achievements: ['Led team of 5 engineers'],
    };

    render(<ExperienceSection content={[experience]} onChange={mockOnChange} />);
    
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Google • Mountain View, CA')).toBeInTheDocument();
  });

  it('should update position field', () => {
    const experience: Experience = {
      id: '1',
      company: '',
      position: '',
      location: '',
      start_date: '',
      current: false,
      description: '',
      achievements: [],
    };

    render(<ExperienceSection content={[experience]} onChange={mockOnChange} />);
    
    const positionInput = screen.getByPlaceholderText('Software Engineer');
    fireEvent.change(positionInput, { target: { value: 'Senior Developer' } });
    
    expect(mockOnChange).toHaveBeenCalledWith([
      expect.objectContaining({
        position: 'Senior Developer',
      })
    ]);
  });

  it('should update company field', () => {
    const experience: Experience = {
      id: '1',
      company: '',
      position: '',
      location: '',
      start_date: '',
      current: false,
      description: '',
      achievements: [],
    };

    render(<ExperienceSection content={[experience]} onChange={mockOnChange} />);
    
    const companyInput = screen.getByPlaceholderText('Tech Company Inc.');
    fireEvent.change(companyInput, { target: { value: 'Microsoft' } });
    
    expect(mockOnChange).toHaveBeenCalledWith([
      expect.objectContaining({
        company: 'Microsoft',
      })
    ]);
  });

  it('should update description field', () => {
    const experience: Experience = {
      id: '1',
      company: 'Google',
      position: 'Engineer',
      location: 'CA',
      start_date: '2020-01',
      current: false,
      description: '',
      achievements: [],
    };

    render(<ExperienceSection content={[experience]} onChange={mockOnChange} />);
    
    const descriptionInput = screen.getByPlaceholderText(/Describe your role/i);
    fireEvent.change(descriptionInput, { target: { value: 'Built amazing products' } });
    
    expect(mockOnChange).toHaveBeenCalledWith([
      expect.objectContaining({
        description: 'Built amazing products',
      })
    ]);
  });

  it('should handle current position checkbox correctly', () => {
    const experience: Experience = {
      id: '1',
      company: 'Google',
      position: 'Software Engineer',
      location: 'CA',
      start_date: '2020-01',
      current: false,
      description: 'Working on cool stuff',
      achievements: [],
    };

    render(<ExperienceSection content={[experience]} onChange={mockOnChange} />);
    
    const currentCheckbox = screen.getByRole('checkbox', { name: /i currently work here/i });
    fireEvent.click(currentCheckbox);
    
    expect(mockOnChange).toHaveBeenCalledWith([
      expect.objectContaining({
        current: true,
        end_date: undefined,
      })
    ]);
  });

  it('should add achievement to experience entry', () => {
    const experience: Experience = {
      id: '1',
      company: 'Google',
      position: 'Engineer',
      location: 'CA',
      start_date: '2020-01',
      current: false,
      description: 'Working',
      achievements: [],
    };

    render(<ExperienceSection content={[experience]} onChange={mockOnChange} />);
    
    // Find the achievements section and click its Add button
    const achievementsLabel = screen.getByText('Key Achievements & Responsibilities');
    const achievementsSection = achievementsLabel.closest('div');
    
    if (achievementsSection) {
      const addButton = achievementsSection.querySelector('button');
      if (addButton) {
        fireEvent.click(addButton);
        
        expect(mockOnChange).toHaveBeenCalledWith([
          expect.objectContaining({
            achievements: [''],
          })
        ]);
      }
    }
  });

  it('should remove experience entry', () => {
    const experience: Experience = {
      id: '1',
      company: 'Google',
      position: 'Engineer',
      location: 'CA',
      start_date: '2020-01',
      current: false,
      description: 'Working',
      achievements: [],
    };

    render(<ExperienceSection content={[experience]} onChange={mockOnChange} />);
    
    const deleteButton = screen.getByRole('button', { name: '' });
    fireEvent.click(deleteButton);
    
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('should render multiple experience entries', () => {
    const experiences: Experience[] = [
      {
        id: '1',
        company: 'Google',
        position: 'Software Engineer',
        location: 'CA',
        start_date: '2020-01',
        current: false,
        description: 'Working',
        achievements: [],
      },
      {
        id: '2',
        company: 'Microsoft',
        position: 'Senior Engineer',
        location: 'WA',
        start_date: '2023-06',
        current: true,
        description: 'Leading',
        achievements: [],
      },
    ];

    render(<ExperienceSection content={experiences} onChange={mockOnChange} />);
    
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Senior Engineer')).toBeInTheDocument();
  });

  it('should display character count for description', () => {
    const experience: Experience = {
      id: '1',
      company: 'Google',
      position: 'Engineer',
      location: 'CA',
      start_date: '2020-01',
      current: false,
      description: 'Test description',
      achievements: [],
    };

    render(<ExperienceSection content={[experience]} onChange={mockOnChange} />);
    
    expect(screen.getByText('16 characters')).toBeInTheDocument();
  });
});
