'use client';

import { useResume } from '@/contexts/ResumeContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import { SortableSection } from './SortableSection';
import { AddSectionMenu } from './AddSectionMenu';
import { MetadataDisplay } from './MetadataDisplay';
import { SuggestionPanel } from './SuggestionPanel';

export function ResumeEditor() {
  const { resume, updateResumeTitle, reorderSections } = useResume();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [focusedSectionIndex, setFocusedSectionIndex] = useState<number>(-1);

  // Configure drag sensors with touch support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms press delay for touch
        tolerance: 5, // 5px movement tolerance
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && resume) {
      const oldIndex = resume.sections.findIndex((s) => s.id === active.id);
      const newIndex = resume.sections.findIndex((s) => s.id === over.id);

      const reorderedSections = arrayMove(resume.sections, oldIndex, newIndex);
      reorderSections(reorderedSections);
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Handle keyboard-based section reordering
  const handleSectionKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (!resume) return;

    const isArrowUp = event.key === 'ArrowUp' && event.altKey;
    const isArrowDown = event.key === 'ArrowDown' && event.altKey;

    if (isArrowUp || isArrowDown) {
      event.preventDefault();
      
      const newIndex = isArrowUp ? index - 1 : index + 1;
      
      if (newIndex >= 0 && newIndex < resume.sections.length) {
        const reorderedSections = arrayMove(resume.sections, index, newIndex);
        reorderSections(reorderedSections);
        setFocusedSectionIndex(newIndex);
      }
    }
  };

  const activeSection = resume?.sections.find((s) => s.id === activeId);

  if (!resume) {
    return (
      <div className="h-full overflow-y-auto p-6 space-y-6 bg-background">
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">
              No resume selected
            </p>
            <p className="text-sm text-muted-foreground">
              Create or select a resume to start editing
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="resume-editor"
      className="h-full overflow-y-auto p-6 space-y-6 bg-background"
      role="region"
      aria-label="Resume editor"
    >
      {/* Resume Title Input */}
      <div className="space-y-2">
        <Label htmlFor="resume-title" className="text-sm font-medium">
          Resume Title
        </Label>
        <Input
          id="resume-title"
          value={resume.title}
          onChange={(e) => updateResumeTitle(e.target.value)}
          placeholder="e.g., Software Engineer Resume"
          className="text-lg font-semibold"
          aria-describedby="resume-title-description"
        />
        <p id="resume-title-description" className="sr-only">
          Enter a descriptive title for your resume to help you identify it later
        </p>
      </div>

      {/* Sections Container with Drag-and-Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="space-y-4" role="list" aria-label="Resume sections">
          <SortableContext
            items={resume.sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {resume.sections.map((section, index) => (
              <SortableSection 
                key={section.id} 
                section={section}
                index={index}
                onKeyDown={handleSectionKeyDown}
                autoFocus={focusedSectionIndex === index}
              />
            ))}
          </SortableContext>

          <DragOverlay>
            {activeSection ? (
              <div className="bg-card border-2 border-primary rounded-lg p-4 shadow-lg opacity-90">
                <h3 className="font-semibold">{activeSection.title}</h3>
              </div>
            ) : null}
          </DragOverlay>
        </div>
      </DndContext>

      {/* Add Section Button */}
      <AddSectionMenu />

      {/* Suggestion Panel */}
      <SuggestionPanel />

      {/* Metadata Display */}
      <MetadataDisplay />
    </div>
  );
}
