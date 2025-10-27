'use client';

import { Project } from '@/types/resume';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Code, Plus, Trash2, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { SectionContentHint } from '../ContentHint';

interface ProjectsSectionProps {
  content: Project[];
  onChange: (content: Project[]) => void;
}

export function ProjectsSection({ content, onChange }: ProjectsSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(content.map((project) => project.id))
  );
  const [techInputs, setTechInputs] = useState<Record<string, string>>({});

  const handleAddProject = () => {
    const newProject: Project = {
      id: uuidv4(),
      name: '',
      description: '',
      technologies: [],
      url: '',
      github: '',
      start_date: '',
      end_date: '',
    };
    onChange([...content, newProject]);
    setExpandedIds((prev) => new Set([...prev, newProject.id]));
  };

  const handleRemoveProject = (id: string) => {
    onChange(content.filter((project) => project.id !== id));
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    // Clean up tech input state
    setTechInputs((prev) => {
      const newInputs = { ...prev };
      delete newInputs[id];
      return newInputs;
    });
  };

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
    onChange(
      content.map((project) =>
        project.id === id ? { ...project, ...updates } : project
      )
    );
  };

  const handleAddTechnology = (projectId: string) => {
    const techInput = techInputs[projectId]?.trim();
    if (!techInput) return;

    const project = content.find((p) => p.id === projectId);
    if (project && !project.technologies.includes(techInput)) {
      handleUpdateProject(projectId, {
        technologies: [...project.technologies, techInput],
      });
      // Clear input
      setTechInputs((prev) => ({ ...prev, [projectId]: '' }));
    }
  };

  const handleRemoveTechnology = (projectId: string, technology: string) => {
    const project = content.find((p) => p.id === projectId);
    if (project) {
      handleUpdateProject(projectId, {
        technologies: project.technologies.filter((tech) => tech !== technology),
      });
    }
  };

  const handleTechInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    projectId: string
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTechnology(projectId);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Projects
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddProject}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {content.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Code className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No projects yet</p>
            <p className="text-xs mt-1">Click "Add Project" to get started</p>
          </div>
        ) : (
          content.map((project, index) => (
            <div key={project.id} className="space-y-4">
              {index > 0 && <Separator />}
              
              {/* Project Entry Header */}
              <div className="flex items-start justify-between">
                <button
                  type="button"
                  onClick={() => toggleExpanded(project.id)}
                  className="flex-1 text-left"
                >
                  <div className="font-medium">
                    {project.name || 'Untitled Project'}
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {project.description || 'No description'}
                  </div>
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{project.technologies.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveProject(project.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Project Entry Form */}
              {expandedIds.has(project.id) && (
                <div className="space-y-4 pl-4 border-l-2 border-muted">
                  {/* Project Name */}
                  <div className="space-y-2">
                    <Label htmlFor={`name-${project.id}`} className="text-sm font-medium">
                      Project Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`name-${project.id}`}
                      value={project.name}
                      onChange={(e) =>
                        handleUpdateProject(project.id, {
                          name: e.target.value,
                        })
                      }
                      placeholder="E-commerce Platform"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor={`description-${project.id}`} className="text-sm font-medium">
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id={`description-${project.id}`}
                      value={project.description}
                      onChange={(e) =>
                        handleUpdateProject(project.id, {
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe the project, your role, and key features..."
                      rows={3}
                      className="resize-none"
                      required
                    />
                    <SectionContentHint
                      isEmpty={!project.description || project.description.trim().length === 0}
                      characterCount={project.description.length}
                      exampleContent="Built a real-time chat application using React and WebSocket. Implemented user authentication, message encryption, and file sharing. Deployed on AWS with auto-scaling capabilities."
                      minCharacters={50}
                    />
                  </div>

                  {/* Technologies */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Technologies Used <span className="text-destructive">*</span>
                    </Label>
                    
                    {/* Technology Tags Display */}
                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-md">
                        {project.technologies.map((tech) => (
                          <Badge
                            key={tech}
                            variant="secondary"
                            className="gap-1 pr-1"
                          >
                            {tech}
                            <button
                              type="button"
                              onClick={() => handleRemoveTechnology(project.id, tech)}
                              className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Technology Input */}
                    <div className="flex gap-2">
                      <Input
                        value={techInputs[project.id] || ''}
                        onChange={(e) =>
                          setTechInputs((prev) => ({
                            ...prev,
                            [project.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => handleTechInputKeyDown(e, project.id)}
                        placeholder="e.g., React, Node.js, PostgreSQL"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddTechnology(project.id)}
                        disabled={!techInputs[project.id]?.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Press Enter or click + to add a technology
                    </p>
                  </div>

                  {/* URLs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`url-${project.id}`} className="text-sm font-medium">
                        Project URL (Optional)
                      </Label>
                      <Input
                        id={`url-${project.id}`}
                        type="url"
                        value={project.url || ''}
                        onChange={(e) =>
                          handleUpdateProject(project.id, {
                            url: e.target.value,
                          })
                        }
                        placeholder="https://project-demo.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`github-${project.id}`} className="text-sm font-medium">
                        GitHub URL (Optional)
                      </Label>
                      <Input
                        id={`github-${project.id}`}
                        type="url"
                        value={project.github || ''}
                        onChange={(e) =>
                          handleUpdateProject(project.id, {
                            github: e.target.value,
                          })
                        }
                        placeholder="https://github.com/username/repo"
                      />
                    </div>
                  </div>

                  {/* Dates (Optional) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`start-date-${project.id}`} className="text-sm font-medium">
                        Start Date (Optional)
                      </Label>
                      <Input
                        id={`start-date-${project.id}`}
                        type="month"
                        value={project.start_date || ''}
                        onChange={(e) =>
                          handleUpdateProject(project.id, {
                            start_date: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`end-date-${project.id}`} className="text-sm font-medium">
                        End Date (Optional)
                      </Label>
                      <Input
                        id={`end-date-${project.id}`}
                        type="month"
                        value={project.end_date || ''}
                        onChange={(e) =>
                          handleUpdateProject(project.id, {
                            end_date: e.target.value,
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave empty if project is ongoing
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
