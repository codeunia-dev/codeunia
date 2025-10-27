'use client';

import { Experience } from '@/types/resume';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { Briefcase, Plus, Trash2, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { SectionContentHint } from '../ContentHint';

interface ExperienceSectionProps {
  content: Experience[];
  onChange: (content: Experience[]) => void;
}

export function ExperienceSection({ content, onChange }: ExperienceSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(content.map((exp) => exp.id))
  );

  const handleAddExperience = () => {
    const newExperience: Experience = {
      id: uuidv4(),
      company: '',
      position: '',
      location: '',
      start_date: '',
      end_date: '',
      current: false,
      description: '',
      achievements: [],
    };
    onChange([...content, newExperience]);
    setExpandedIds((prev) => new Set([...prev, newExperience.id]));
  };

  const handleRemoveExperience = (id: string) => {
    onChange(content.filter((exp) => exp.id !== id));
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleUpdateExperience = (id: string, updates: Partial<Experience>) => {
    onChange(
      content.map((exp) =>
        exp.id === id ? { ...exp, ...updates } : exp
      )
    );
  };

  const handleAddAchievement = (id: string) => {
    const experience = content.find((exp) => exp.id === id);
    if (experience) {
      handleUpdateExperience(id, {
        achievements: [...experience.achievements, ''],
      });
    }
  };

  const handleUpdateAchievement = (
    experienceId: string,
    achievementIndex: number,
    value: string
  ) => {
    const experience = content.find((exp) => exp.id === experienceId);
    if (experience) {
      const newAchievements = [...experience.achievements];
      newAchievements[achievementIndex] = value;
      handleUpdateExperience(experienceId, { achievements: newAchievements });
    }
  };

  const handleRemoveAchievement = (experienceId: string, achievementIndex: number) => {
    const experience = content.find((exp) => exp.id === experienceId);
    if (experience) {
      const newAchievements = experience.achievements.filter(
        (_, index) => index !== achievementIndex
      );
      handleUpdateExperience(experienceId, { achievements: newAchievements });
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
            <Briefcase className="h-5 w-5" />
            Work Experience
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddExperience}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Experience
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {content.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No work experience entries yet</p>
            <p className="text-xs mt-1">Click "Add Experience" to get started</p>
          </div>
        ) : (
          content.map((experience, index) => (
            <div key={experience.id} className="space-y-4">
              {index > 0 && <Separator />}
              
              {/* Experience Entry Header */}
              <div className="flex items-start justify-between">
                <button
                  type="button"
                  onClick={() => toggleExpanded(experience.id)}
                  className="flex-1 text-left"
                >
                  <div className="font-medium">
                    {experience.position || 'Untitled Position'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {experience.company
                      ? `${experience.company}${experience.location ? ` • ${experience.location}` : ''}`
                      : 'No company specified'}
                  </div>
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveExperience(experience.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Experience Entry Form */}
              {expandedIds.has(experience.id) && (
                <div className="space-y-4 pl-4 border-l-2 border-muted">
                  {/* Position */}
                  <div className="space-y-2">
                    <Label htmlFor={`position-${experience.id}`} className="text-sm font-medium">
                      Position / Job Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`position-${experience.id}`}
                      value={experience.position}
                      onChange={(e) =>
                        handleUpdateExperience(experience.id, {
                          position: e.target.value,
                        })
                      }
                      placeholder="Software Engineer"
                      required
                    />
                  </div>

                  {/* Company and Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`company-${experience.id}`} className="text-sm font-medium">
                        Company <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`company-${experience.id}`}
                        value={experience.company}
                        onChange={(e) =>
                          handleUpdateExperience(experience.id, {
                            company: e.target.value,
                          })
                        }
                        placeholder="Tech Company Inc."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`location-${experience.id}`} className="text-sm font-medium">
                        Location <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`location-${experience.id}`}
                        value={experience.location}
                        onChange={(e) =>
                          handleUpdateExperience(experience.id, {
                            location: e.target.value,
                          })
                        }
                        placeholder="San Francisco, CA"
                        required
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`start-date-${experience.id}`} className="text-sm font-medium">
                        Start Date <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`start-date-${experience.id}`}
                        type="month"
                        value={experience.start_date}
                        onChange={(e) =>
                          handleUpdateExperience(experience.id, {
                            start_date: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`end-date-${experience.id}`} className="text-sm font-medium">
                        End Date {!experience.current && <span className="text-destructive">*</span>}
                      </Label>
                      <Input
                        id={`end-date-${experience.id}`}
                        type="month"
                        value={experience.end_date || ''}
                        onChange={(e) =>
                          handleUpdateExperience(experience.id, {
                            end_date: e.target.value,
                          })
                        }
                        disabled={experience.current}
                        required={!experience.current}
                      />
                    </div>
                  </div>

                  {/* Current Position Checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`current-${experience.id}`}
                      checked={experience.current}
                      onCheckedChange={(checked) =>
                        handleUpdateExperience(experience.id, {
                          current: checked === true,
                          end_date: checked === true ? undefined : experience.end_date,
                        })
                      }
                    />
                    <Label
                      htmlFor={`current-${experience.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      I currently work here
                    </Label>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor={`description-${experience.id}`} className="text-sm font-medium">
                      Job Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id={`description-${experience.id}`}
                      value={experience.description}
                      onChange={(e) =>
                        handleUpdateExperience(experience.id, {
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe your role, responsibilities, and key contributions..."
                      rows={3}
                      className="resize-none"
                      required
                    />
                    <SectionContentHint
                      isEmpty={!experience.description || experience.description.trim().length === 0}
                      characterCount={experience.description.length}
                      exampleContent="Led development of microservices architecture serving 1M+ users. Collaborated with cross-functional teams to deliver features on time. Mentored 3 junior developers and conducted code reviews."
                      minCharacters={50}
                    />
                  </div>

                  {/* Achievements */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Key Achievements & Responsibilities
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddAchievement(experience.id)}
                        className="gap-1 h-8"
                      >
                        <Plus className="h-3 w-3" />
                        Add
                      </Button>
                    </div>

                    {experience.achievements.length > 0 ? (
                      <div className="space-y-2">
                        {experience.achievements.map((achievement, achievementIndex) => (
                          <div
                            key={achievementIndex}
                            className="flex items-start gap-2"
                          >
                            <span className="text-muted-foreground mt-3 text-sm">•</span>
                            <Input
                              value={achievement}
                              onChange={(e) =>
                                handleUpdateAchievement(
                                  experience.id,
                                  achievementIndex,
                                  e.target.value
                                )
                              }
                              placeholder="Led a team of 5 engineers to deliver..."
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRemoveAchievement(experience.id, achievementIndex)
                              }
                              className="mt-1"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Add bullet points highlighting your key achievements, responsibilities, and impact
                      </p>
                    )}
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
