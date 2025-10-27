'use client';

import { Skill } from '@/types/resume';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState, KeyboardEvent } from 'react';
import { Wrench, Plus, Trash2, X, GripVertical } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SkillsSectionProps {
  content: Skill[];
  onChange: (content: Skill[]) => void;
}

interface SkillCategoryWithId extends Skill {
  id: string;
}

// Sortable skill category component
function SortableSkillCategory({
  skill,
  onUpdate,
  onRemove,
}: {
  skill: SkillCategoryWithId;
  onUpdate: (id: string, updates: Partial<Skill>) => void;
  onRemove: (id: string) => void;
}) {
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: skill.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleAddSkill = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !skill.items.includes(trimmedValue)) {
      onUpdate(skill.id, {
        items: [...skill.items, trimmedValue],
      });
      setInputValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    } else if (e.key === ',' || e.key === 'Tab') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onUpdate(skill.id, {
      items: skill.items.filter((item) => item !== skillToRemove),
    });
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-3">
      {/* Category Header */}
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-2 cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              value={skill.category}
              onChange={(e) =>
                onUpdate(skill.id, { category: e.target.value })
              }
              placeholder="e.g., Programming Languages, Frameworks, Tools"
              className="font-medium"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(skill.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Skills Tags */}
          {isExpanded && (
            <>
              <div className="flex flex-wrap gap-2 min-h-[2rem] p-2 border rounded-md bg-muted/20">
                {skill.items.length > 0 ? (
                  skill.items.map((item, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(item)}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No skills added yet
                  </span>
                )}
              </div>

              {/* Add Skill Input */}
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a skill and press Enter, comma, or Tab"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSkill}
                  disabled={!inputValue.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Press Enter, comma, or Tab to add multiple skills quickly
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function SkillsSection({ content, onChange }: SkillsSectionProps) {
  // Add unique IDs to skills for drag-and-drop
  const [skillsWithIds, setSkillsWithIds] = useState<SkillCategoryWithId[]>(
    () =>
      content.map((skill) => ({
        ...skill,
        id: uuidv4(),
      }))
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync skillsWithIds with content when content changes externally
  useState(() => {
    if (content.length !== skillsWithIds.length) {
      setSkillsWithIds(
        content.map((skill, index) => ({
          ...skill,
          id: skillsWithIds[index]?.id || uuidv4(),
        }))
      );
    }
  });

  const handleAddCategory = () => {
    const newSkill: SkillCategoryWithId = {
      id: uuidv4(),
      category: '',
      items: [],
    };
    const newSkills = [...skillsWithIds, newSkill];
    setSkillsWithIds(newSkills);
    onChange(newSkills.map(({ id, ...skill }) => skill));
  };

  const handleUpdateCategory = (id: string, updates: Partial<Skill>) => {
    const newSkills = skillsWithIds.map((skill) =>
      skill.id === id ? { ...skill, ...updates } : skill
    );
    setSkillsWithIds(newSkills);
    onChange(newSkills.map(({ id, ...skill }) => skill));
  };

  const handleRemoveCategory = (id: string) => {
    const newSkills = skillsWithIds.filter((skill) => skill.id !== id);
    setSkillsWithIds(newSkills);
    onChange(newSkills.map(({ id, ...skill }) => skill));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = skillsWithIds.findIndex(
        (skill) => skill.id === active.id
      );
      const newIndex = skillsWithIds.findIndex((skill) => skill.id === over.id);

      const newSkills = arrayMove(skillsWithIds, oldIndex, newIndex);
      setSkillsWithIds(newSkills);
      onChange(newSkills.map(({ id, ...skill }) => skill));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Skills
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddCategory}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {skillsWithIds.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wrench className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No skill categories yet</p>
            <p className="text-xs mt-1">
              Click "Add Category" to organize your skills
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={skillsWithIds.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {skillsWithIds.map((skill, index) => (
                  <div key={skill.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <SortableSkillCategory
                      skill={skill}
                      onUpdate={handleUpdateCategory}
                      onRemove={handleRemoveCategory}
                    />
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {skillsWithIds.length > 0 && (
          <>
            {/* Warning for too few skills */}
            {(() => {
              const totalSkills = skillsWithIds.reduce(
                (sum, skill) => sum + skill.items.length,
                0
              );
              return totalSkills < 5 ? (
                <Alert variant="default" className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200">
                    You have {totalSkills} skill{totalSkills !== 1 ? 's' : ''} listed. Consider adding more skills to better showcase your capabilities (aim for at least 5-10).
                  </AlertDescription>
                </Alert>
              ) : null;
            })()}
            
            <div className="pt-2">
              <p className="text-xs text-muted-foreground">
                💡 Tip: Drag categories to reorder them. Organize skills by type
                (e.g., Programming Languages, Frameworks, Tools, Soft Skills)
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
