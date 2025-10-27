'use client';

import { Award } from '@/types/resume';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { Trophy, Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface AwardsSectionProps {
  content: Award[];
  onChange: (content: Award[]) => void;
}

export function AwardsSection({ content, onChange }: AwardsSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(content.map((award) => award.id))
  );

  const handleAddAward = () => {
    const newAward: Award = {
      id: uuidv4(),
      title: '',
      issuer: '',
      date: '',
      description: '',
    };
    onChange([...content, newAward]);
    setExpandedIds((prev) => new Set([...prev, newAward.id]));
  };

  const handleRemoveAward = (id: string) => {
    onChange(content.filter((award) => award.id !== id));
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleUpdateAward = (id: string, updates: Partial<Award>) => {
    onChange(
      content.map((award) =>
        award.id === id ? { ...award, ...updates } : award
      )
    );
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
            <Trophy className="h-5 w-5" />
            Awards & Honors
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddAward}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Award
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {content.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No awards yet</p>
            <p className="text-xs mt-1">Click &ldquo;Add Award&rdquo; to get started</p>
          </div>
        ) : (
          content.map((award, index) => (
            <div key={award.id} className="space-y-4">
              {index > 0 && <Separator />}
              
              {/* Award Entry Header */}
              <div className="flex items-start justify-between">
                <button
                  type="button"
                  onClick={() => toggleExpanded(award.id)}
                  className="flex-1 text-left"
                >
                  <div className="font-medium">
                    {award.title || 'Untitled Award'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {award.issuer
                      ? `${award.issuer}${award.date ? ` • ${new Date(award.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}` : ''}`
                      : 'No issuer specified'}
                  </div>
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAward(award.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Award Entry Form */}
              {expandedIds.has(award.id) && (
                <div className="space-y-4 pl-4 border-l-2 border-muted">
                  {/* Award Title */}
                  <div className="space-y-2">
                    <Label htmlFor={`title-${award.id}`} className="text-sm font-medium">
                      Award Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`title-${award.id}`}
                      value={award.title}
                      onChange={(e) =>
                        handleUpdateAward(award.id, {
                          title: e.target.value,
                        })
                      }
                      placeholder="Best Innovation Award"
                      required
                    />
                  </div>

                  {/* Issuer */}
                  <div className="space-y-2">
                    <Label htmlFor={`issuer-${award.id}`} className="text-sm font-medium">
                      Issuing Organization <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`issuer-${award.id}`}
                      value={award.issuer}
                      onChange={(e) =>
                        handleUpdateAward(award.id, {
                          issuer: e.target.value,
                        })
                      }
                      placeholder="Tech Conference 2024"
                      required
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <Label htmlFor={`date-${award.id}`} className="text-sm font-medium">
                      Date Received <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`date-${award.id}`}
                      type="month"
                      value={award.date}
                      onChange={(e) =>
                        handleUpdateAward(award.id, {
                          date: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor={`description-${award.id}`} className="text-sm font-medium">
                      Description (Optional)
                    </Label>
                    <Textarea
                      id={`description-${award.id}`}
                      value={award.description || ''}
                      onChange={(e) =>
                        handleUpdateAward(award.id, {
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe the award, what you achieved, and why you received it..."
                      rows={3}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      {(award.description || '').length} characters
                    </p>
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
