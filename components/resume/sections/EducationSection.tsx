'use client';

import { Education } from '@/types/resume';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { GraduationCap, Plus, Trash2, X, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { validateDateRange } from '@/lib/validation/resume-validation';

interface EducationSectionProps {
  content: Education[];
  onChange: (content: Education[]) => void;
}

export function EducationSection({ content, onChange }: EducationSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(content.map((edu) => edu.id))
  );
  const [dateErrors, setDateErrors] = useState<Record<string, string>>({});

  const handleAddEducation = () => {
    const newEducation: Education = {
      id: uuidv4(),
      institution: '',
      degree: '',
      field: '',
      start_date: '',
      end_date: '',
      current: false,
      gpa: '',
      achievements: [],
    };
    onChange([...content, newEducation]);
    setExpandedIds((prev) => new Set([...prev, newEducation.id]));
  };

  const handleRemoveEducation = (id: string) => {
    onChange(content.filter((edu) => edu.id !== id));
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleUpdateEducation = (id: string, updates: Partial<Education>) => {
    const updatedEducation = content.find((edu) => edu.id === id);
    if (updatedEducation) {
      const newEducation = { ...updatedEducation, ...updates };
      
      // Validate date range
      const validation = validateDateRange(
        newEducation.start_date,
        newEducation.end_date,
        newEducation.current
      );
      
      if (!validation.isValid && validation.error) {
        setDateErrors((prev) => ({ ...prev, [id]: validation.error! }));
      } else {
        setDateErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[id];
          return newErrors;
        });
      }
    }
    
    onChange(
      content.map((edu) =>
        edu.id === id ? { ...edu, ...updates } : edu
      )
    );
  };

  const handleAddAchievement = (id: string) => {
    const education = content.find((edu) => edu.id === id);
    if (education) {
      handleUpdateEducation(id, {
        achievements: [...(education.achievements || []), ''],
      });
    }
  };

  const handleUpdateAchievement = (
    educationId: string,
    achievementIndex: number,
    value: string
  ) => {
    const education = content.find((edu) => edu.id === educationId);
    if (education) {
      const newAchievements = [...(education.achievements || [])];
      newAchievements[achievementIndex] = value;
      handleUpdateEducation(educationId, { achievements: newAchievements });
    }
  };

  const handleRemoveAchievement = (educationId: string, achievementIndex: number) => {
    const education = content.find((edu) => edu.id === educationId);
    if (education) {
      const newAchievements = (education.achievements || []).filter(
        (_, index) => index !== achievementIndex
      );
      handleUpdateEducation(educationId, { achievements: newAchievements });
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
            <GraduationCap className="h-5 w-5" />
            Education
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddEducation}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Education
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {content.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No education entries yet</p>
            <p className="text-xs mt-1">Click &ldquo;Add Education&rdquo; to get started</p>
          </div>
        ) : (
          content.map((education, index) => (
            <div key={education.id} className="space-y-4">
              {index > 0 && <Separator />}
              
              {/* Education Entry Header */}
              <div className="flex items-start justify-between">
                <button
                  type="button"
                  onClick={() => toggleExpanded(education.id)}
                  className="flex-1 text-left"
                >
                  <div className="font-medium">
                    {education.institution || 'Untitled Institution'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {education.degree && education.field
                      ? `${education.degree} in ${education.field}`
                      : education.degree || education.field || 'No degree specified'}
                  </div>
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveEducation(education.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Education Entry Form */}
              {expandedIds.has(education.id) && (
                <div className="space-y-4 pl-4 border-l-2 border-muted">
                  {/* Institution */}
                  <div className="space-y-2">
                    <Label htmlFor={`institution-${education.id}`} className="text-sm font-medium">
                      Institution <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`institution-${education.id}`}
                      value={education.institution}
                      onChange={(e) =>
                        handleUpdateEducation(education.id, {
                          institution: e.target.value,
                        })
                      }
                      placeholder="University of California, Berkeley"
                      required
                    />
                  </div>

                  {/* Degree and Field */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`degree-${education.id}`} className="text-sm font-medium">
                        Degree <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`degree-${education.id}`}
                        value={education.degree}
                        onChange={(e) =>
                          handleUpdateEducation(education.id, {
                            degree: e.target.value,
                          })
                        }
                        placeholder="Bachelor of Science"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`field-${education.id}`} className="text-sm font-medium">
                        Field of Study <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`field-${education.id}`}
                        value={education.field}
                        onChange={(e) =>
                          handleUpdateEducation(education.id, {
                            field: e.target.value,
                          })
                        }
                        placeholder="Computer Science"
                        required
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`start-date-${education.id}`} className="text-sm font-medium">
                          Start Date <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`start-date-${education.id}`}
                          type="month"
                          value={education.start_date}
                          onChange={(e) =>
                            handleUpdateEducation(education.id, {
                              start_date: e.target.value,
                            })
                          }
                          aria-invalid={!!dateErrors[education.id]}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`end-date-${education.id}`} className="text-sm font-medium">
                          End Date {!education.current && <span className="text-destructive">*</span>}
                        </Label>
                        <Input
                          id={`end-date-${education.id}`}
                          type="month"
                          value={education.end_date || ''}
                          onChange={(e) =>
                            handleUpdateEducation(education.id, {
                              end_date: e.target.value,
                            })
                          }
                          disabled={education.current}
                          aria-invalid={!!dateErrors[education.id]}
                          required={!education.current}
                        />
                      </div>
                    </div>
                    {dateErrors[education.id] && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {dateErrors[education.id]}
                      </p>
                    )}
                  </div>

                  {/* Current Checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`current-${education.id}`}
                      checked={education.current}
                      onCheckedChange={(checked) =>
                        handleUpdateEducation(education.id, {
                          current: checked === true,
                          end_date: checked === true ? undefined : education.end_date,
                        })
                      }
                    />
                    <Label
                      htmlFor={`current-${education.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      I currently study here
                    </Label>
                  </div>

                  {/* GPA */}
                  <div className="space-y-2">
                    <Label htmlFor={`gpa-${education.id}`} className="text-sm font-medium">
                      GPA (Optional)
                    </Label>
                    <Input
                      id={`gpa-${education.id}`}
                      value={education.gpa || ''}
                      onChange={(e) =>
                        handleUpdateEducation(education.id, {
                          gpa: e.target.value,
                        })
                      }
                      placeholder="3.8 / 4.0"
                    />
                  </div>

                  {/* Achievements */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Achievements & Honors (Optional)
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddAchievement(education.id)}
                        className="gap-1 h-8"
                      >
                        <Plus className="h-3 w-3" />
                        Add
                      </Button>
                    </div>

                    {education.achievements && education.achievements.length > 0 && (
                      <div className="space-y-2">
                        {education.achievements.map((achievement, achievementIndex) => (
                          <div
                            key={achievementIndex}
                            className="flex items-start gap-2"
                          >
                            <span className="text-muted-foreground mt-3 text-sm">•</span>
                            <Input
                              value={achievement}
                              onChange={(e) =>
                                handleUpdateAchievement(
                                  education.id,
                                  achievementIndex,
                                  e.target.value
                                )
                              }
                              placeholder="Dean's List, Summa Cum Laude, etc."
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRemoveAchievement(education.id, achievementIndex)
                              }
                              className="mt-1"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {(!education.achievements || education.achievements.length === 0) && (
                      <p className="text-xs text-muted-foreground">
                        Add notable achievements, honors, or awards received during your studies
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
