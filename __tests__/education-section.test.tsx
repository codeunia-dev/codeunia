import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EducationSection } from '@/components/resume/sections/EducationSection';
import { Education } from '@/types/resume';

describe('EducationSection', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render empty state when no education entries exist', () => {
    render(<EducationSection content={[]} onChange={mockOnChange} />);
    
    expect(screen.getByText('No education entries yet')).toBeInTheDocument();
    expect(screen.getByText('Click "Add Education" to get started')).toBeInTheDocument();
  });

  it('should render add education button', () => {
    render(<EducationSection content={[]} onChange={mockOnChange} />);
    
    expect(screen.getByRole('button', { name: /add education/i })).toBeInTheDocument();
  });

  it('should add a new education entry when add button is clicked', () => {
    render(<EducationSection content={[]} onChange={mockOnChange} />);
    
    const addButton = screen.getByRole('button', { name: /add education/i });
    fireEvent.click(addButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          institution: '',
          degree: '',
          field: '',
          current: false,
        })
      ])
    );
  });

  it('should render education entry with all required fields', () => {
    const education: Education = {
      id: '1',
      institution: 'MIT',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      start_date: '2018-09',
      end_date: '2022-05',
      current: false,
      gpa: '3.9',
      achievements: ['Dean\'s List'],
    };

    render(<EducationSection content={[education]} onChange={mockOnChange} />);
    
    expect(screen.getByText('MIT')).toBeInTheDocument();
    expect(screen.getByText('Bachelor of Science in Computer Science')).toBeInTheDocument();
  });

  it('should update institution field', () => {
    const education: Education = {
      id: '1',
      institution: '',
      degree: '',
      field: '',
      start_date: '',
      current: false,
    };

    render(<EducationSection content={[education]} onChange={mockOnChange} />);
    
    const institutionInput = screen.getByPlaceholderText('University of California, Berkeley');
    fireEvent.change(institutionInput, { target: { value: 'Stanford University' } });
    
    expect(mockOnChange).toHaveBeenCalledWith([
      expect.objectContaining({
        institution: 'Stanford University',
      })
    ]);
  });

  it('should handle current checkbox correctly', () => {
    const education: Education = {
      id: '1',
      institution: 'MIT',
      degree: 'PhD',
      field: 'AI',
      start_date: '2022-09',
      current: false,
    };

    render(<EducationSection content={[education]} onChange={mockOnChange} />);
    
    const currentCheckbox = screen.getByRole('checkbox', { name: /i currently study here/i });
    fireEvent.click(currentCheckbox);
    
    expect(mockOnChange).toHaveBeenCalledWith([
      expect.objectContaining({
        current: true,
        end_date: undefined,
      })
    ]);
  });

  it('should add achievement to education entry', () => {
    const education: Education = {
      id: '1',
      institution: 'MIT',
      degree: 'BS',
      field: 'CS',
      start_date: '2018-09',
      current: false,
      achievements: [],
    };

    render(<EducationSection content={[education]} onChange={mockOnChange} />);
    
    // Find the achievements section and click its Add button
    const achievementsLabel = screen.getByText('Achievements & Honors (Optional)');
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

  it('should remove education entry', () => {
    const education: Education = {
      id: '1',
      institution: 'MIT',
      degree: 'BS',
      field: 'CS',
      start_date: '2018-09',
      current: false,
    };

    render(<EducationSection content={[education]} onChange={mockOnChange} />);
    
    const deleteButton = screen.getByRole('button', { name: '' });
    fireEvent.click(deleteButton);
    
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('should render multiple education entries', () => {
    const educations: Education[] = [
      {
        id: '1',
        institution: 'MIT',
        degree: 'BS',
        field: 'CS',
        start_date: '2018-09',
        current: false,
      },
      {
        id: '2',
        institution: 'Stanford',
        degree: 'MS',
        field: 'AI',
        start_date: '2022-09',
        current: true,
      },
    ];

    render(<EducationSection content={educations} onChange={mockOnChange} />);
    
    expect(screen.getByText('MIT')).toBeInTheDocument();
    expect(screen.getByText('Stanford')).toBeInTheDocument();
  });
});
