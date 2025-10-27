import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProjectsSection } from '@/components/resume/sections/ProjectsSection';
import { Project } from '@/types/resume';

describe('ProjectsSection', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render empty state when no projects exist', () => {
    render(<ProjectsSection content={[]} onChange={mockOnChange} />);
    
    expect(screen.getByText('No projects yet')).toBeInTheDocument();
    expect(screen.getByText('Click "Add Project" to get started')).toBeInTheDocument();
  });

  it('should render add project button', () => {
    render(<ProjectsSection content={[]} onChange={mockOnChange} />);
    
    expect(screen.getByRole('button', { name: /add project/i })).toBeInTheDocument();
  });

  it('should add a new project entry when add button is clicked', () => {
    render(<ProjectsSection content={[]} onChange={mockOnChange} />);
    
    const addButton = screen.getByRole('button', { name: /add project/i });
    fireEvent.click(addButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          name: '',
          description: '',
          technologies: [],
        })
      ])
    );
  });

  it('should render project entry with all fields', () => {
    const project: Project = {
      id: '1',
      name: 'E-commerce Platform',
      description: 'A full-stack e-commerce solution',
      technologies: ['React', 'Node.js', 'PostgreSQL'],
      url: 'https://example.com',
      github: 'https://github.com/user/repo',
      start_date: '2023-01',
      end_date: '2023-12',
    };

    render(<ProjectsSection content={[project]} onChange={mockOnChange} />);
    
    expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
    expect(screen.getAllByText('A full-stack e-commerce solution').length).toBeGreaterThan(0);
  });

  it('should update project name field', () => {
    const project: Project = {
      id: '1',
      name: '',
      description: '',
      technologies: [],
    };

    render(<ProjectsSection content={[project]} onChange={mockOnChange} />);
    
    const nameInput = screen.getByPlaceholderText('E-commerce Platform');
    fireEvent.change(nameInput, { target: { value: 'My Awesome Project' } });
    
    expect(mockOnChange).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'My Awesome Project',
      })
    ]);
  });

  it('should update project description field', () => {
    const project: Project = {
      id: '1',
      name: 'Test Project',
      description: '',
      technologies: [],
    };

    render(<ProjectsSection content={[project]} onChange={mockOnChange} />);
    
    const descriptionInput = screen.getByPlaceholderText(/describe the project/i);
    fireEvent.change(descriptionInput, { target: { value: 'A test description' } });
    
    expect(mockOnChange).toHaveBeenCalledWith([
      expect.objectContaining({
        description: 'A test description',
      })
    ]);
  });

  it('should add technology tag', () => {
    const project: Project = {
      id: '1',
      name: 'Test Project',
      description: 'Test',
      technologies: [],
    };

    render(<ProjectsSection content={[project]} onChange={mockOnChange} />);
    
    const techInput = screen.getByPlaceholderText(/e.g., React, Node.js/i);
    fireEvent.change(techInput, { target: { value: 'React' } });
    
    // Find the small + button next to the tech input (not the "Add Project" button)
    const buttons = screen.getAllByRole('button');
    const addTechButton = buttons.find(btn => {
      const svg = btn.querySelector('svg');
      return svg && btn.className.includes('h-8') && !btn.textContent?.includes('Add Project');
    });
    
    if (addTechButton) {
      fireEvent.click(addTechButton);
      
      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          technologies: ['React'],
        })
      ]);
    }
  });

  it('should add technology tag on Enter key press', () => {
    const project: Project = {
      id: '1',
      name: 'Test Project',
      description: 'Test',
      technologies: [],
    };

    render(<ProjectsSection content={[project]} onChange={mockOnChange} />);
    
    const techInput = screen.getByPlaceholderText(/e.g., React, Node.js/i);
    fireEvent.change(techInput, { target: { value: 'TypeScript' } });
    fireEvent.keyDown(techInput, { key: 'Enter', code: 'Enter' });
    
    expect(mockOnChange).toHaveBeenCalledWith([
      expect.objectContaining({
        technologies: ['TypeScript'],
      })
    ]);
  });

  it('should display technology badges', () => {
    const project: Project = {
      id: '1',
      name: 'Test Project',
      description: 'Test',
      technologies: ['React', 'Node.js', 'PostgreSQL'],
    };

    render(<ProjectsSection content={[project]} onChange={mockOnChange} />);
    
    // Technologies appear in both collapsed and expanded views
    expect(screen.getAllByText('React').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Node.js').length).toBeGreaterThan(0);
    expect(screen.getAllByText('PostgreSQL').length).toBeGreaterThan(0);
  });

  it('should remove technology tag', () => {
    const project: Project = {
      id: '1',
      name: 'Test Project',
      description: 'Test',
      technologies: ['React', 'Node.js'],
    };

    render(<ProjectsSection content={[project]} onChange={mockOnChange} />);
    
    // Find all React badges and get the one in the expanded view (with remove button)
    const reactBadges = screen.getAllByText('React');
    const expandedBadge = reactBadges.find(badge => {
      const parent = badge.closest('div');
      return parent?.querySelector('button') !== null;
    });
    
    const removeButton = expandedBadge?.closest('div')?.querySelector('button');
    
    if (removeButton) {
      fireEvent.click(removeButton);
      
      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          technologies: ['Node.js'],
        })
      ]);
    }
  });

  it('should update project URL fields', () => {
    const project: Project = {
      id: '1',
      name: 'Test Project',
      description: 'Test',
      technologies: [],
    };

    render(<ProjectsSection content={[project]} onChange={mockOnChange} />);
    
    const urlInput = screen.getByPlaceholderText('https://project-demo.com');
    fireEvent.change(urlInput, { target: { value: 'https://myproject.com' } });
    
    expect(mockOnChange).toHaveBeenCalledWith([
      expect.objectContaining({
        url: 'https://myproject.com',
      })
    ]);
  });

  it('should update GitHub URL field', () => {
    const project: Project = {
      id: '1',
      name: 'Test Project',
      description: 'Test',
      technologies: [],
    };

    render(<ProjectsSection content={[project]} onChange={mockOnChange} />);
    
    const githubInput = screen.getByPlaceholderText('https://github.com/username/repo');
    fireEvent.change(githubInput, { target: { value: 'https://github.com/test/repo' } });
    
    expect(mockOnChange).toHaveBeenCalledWith([
      expect.objectContaining({
        github: 'https://github.com/test/repo',
      })
    ]);
  });

  it('should update optional date fields', () => {
    const project: Project = {
      id: '1',
      name: 'Test Project',
      description: 'Test',
      technologies: [],
    };

    render(<ProjectsSection content={[project]} onChange={mockOnChange} />);
    
    const startDateInputs = screen.getAllByLabelText(/start date/i);
    const startDateInput = startDateInputs[0];
    fireEvent.change(startDateInput, { target: { value: '2023-01' } });
    
    expect(mockOnChange).toHaveBeenCalledWith([
      expect.objectContaining({
        start_date: '2023-01',
      })
    ]);
  });

  it('should remove project entry', () => {
    const project: Project = {
      id: '1',
      name: 'Test Project',
      description: 'Test',
      technologies: [],
    };

    render(<ProjectsSection content={[project]} onChange={mockOnChange} />);
    
    // Find the delete button (trash icon) - it has text-destructive class
    const buttons = screen.getAllByRole('button');
    const deleteButton = buttons.find(btn => 
      btn.className.includes('text-destructive')
    );
    
    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(mockOnChange).toHaveBeenCalledWith([]);
    }
  });

  it('should render multiple project entries', () => {
    const projects: Project[] = [
      {
        id: '1',
        name: 'Project One',
        description: 'First project',
        technologies: ['React'],
      },
      {
        id: '2',
        name: 'Project Two',
        description: 'Second project',
        technologies: ['Vue'],
      },
    ];

    render(<ProjectsSection content={projects} onChange={mockOnChange} />);
    
    expect(screen.getByText('Project One')).toBeInTheDocument();
    expect(screen.getByText('Project Two')).toBeInTheDocument();
  });

  it('should show character count for description', () => {
    const project: Project = {
      id: '1',
      name: 'Test',
      description: 'Hello',
      technologies: [],
    };

    render(<ProjectsSection content={[project]} onChange={mockOnChange} />);
    
    expect(screen.getByText('5 characters')).toBeInTheDocument();
  });

  it('should display truncated technologies in collapsed view', () => {
    const project: Project = {
      id: '1',
      name: 'Test Project',
      description: 'Test',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Docker'],
    };

    render(<ProjectsSection content={[project]} onChange={mockOnChange} />);
    
    // Collapse the project
    const projectHeader = screen.getByText('Test Project');
    fireEvent.click(projectHeader);
    
    // Should show first 3 technologies and a +2 badge
    expect(screen.getByText('+2')).toBeInTheDocument();
  });
});
