'use client';

import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ResumeSection } from '@/types/resume';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, Eye, EyeOff, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useResume } from '@/contexts/ResumeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PersonalInfoSection } from './sections/PersonalInfoSection';
import { EducationSection } from './sections/EducationSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { SkillsSection } from './sections/SkillsSection';
import { CertificationsSection } from './sections/CertificationsSection';
import { AwardsSection } from './sections/AwardsSection';
import { CustomSection } from './sections/CustomSection';
import { PersonalInfo, Education, Experience, Project, Skill, Certification, Award, CustomContent } from '@/types/resume';

interface SortableSectionProps {
  section: ResumeSection;
  index: number;
  onKeyDown?: (event: React.KeyboardEvent, index: number) => void;
  autoFocus?: boolean;
}

export function SortableSection({ section, index, onKeyDown, autoFocus }: SortableSectionProps) {
  const { removeSection, toggleSectionVisibility, updateSection, lastAddedSectionId } = useResume();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isNewlyAdded = lastAddedSectionId === section.id;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  // Auto-focus when requested
  useEffect(() => {
    if (autoFocus && sectionRef.current) {
      sectionRef.current.focus();
    }
  }, [autoFocus]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={(node) => {
        setNodeRef(node);
        if (node) {
          (sectionRef as React.MutableRefObject<HTMLDivElement>).current = node;
        }
      }}
      style={style}
      role="listitem"
      tabIndex={0}
      onKeyDown={(e) => onKeyDown?.(e, index)}
      aria-label={`${section.title} section, position ${index + 1}`}
      className={isNewlyAdded ? 'animate-fade-in' : ''}
    >
      <Card className={`${!section.visible ? 'opacity-60' : ''} transition-smooth`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              {/* Drag Handle */}
              <button
                className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-muted rounded"
                {...attributes}
                {...listeners}
                aria-label={`Drag to reorder ${section.title} section. Use Alt+Arrow Up or Alt+Arrow Down to reorder with keyboard.`}
                tabIndex={-1}
              >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </button>

              {/* Section Title - Clickable on mobile to collapse/expand */}
              {isMobile ? (
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  {isCollapsed ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              ) : (
                <CardTitle className="text-lg">{section.title}</CardTitle>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {/* Toggle Visibility */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSectionVisibility(section.id)}
                aria-label={section.visible ? 'Hide section' : 'Show section'}
              >
                {section.visible ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>

              {/* Delete Section */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Delete section"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Section</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete the &quot;{section.title}&quot; section?
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => removeSection(section.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>

        {/* Collapsible Content on Mobile */}
        {(!isMobile || !isCollapsed) && (
          <CardContent>
          {/* Render section-specific editor */}
          {section.type === 'personal_info' && (
            <PersonalInfoSection
              content={section.content as PersonalInfo}
              onChange={(content) => updateSection(section.id, content)}
              autoFocus={isNewlyAdded}
            />
          )}
          
          {section.type === 'education' && (
            <EducationSection
              content={section.content as Education[]}
              onChange={(content) => updateSection(section.id, content)}
            />
          )}
          
          {section.type === 'experience' && (
            <ExperienceSection
              content={section.content as Experience[]}
              onChange={(content) => updateSection(section.id, content)}
            />
          )}
          
          {section.type === 'projects' && (
            <ProjectsSection
              content={section.content as Project[]}
              onChange={(content) => updateSection(section.id, content)}
            />
          )}
          
          {section.type === 'skills' && (
            <SkillsSection
              content={section.content as Skill[]}
              onChange={(content) => updateSection(section.id, content)}
            />
          )}
          
          {section.type === 'certifications' && (
            <CertificationsSection
              content={section.content as Certification[]}
              onChange={(content) => updateSection(section.id, content)}
            />
          )}
          
          {section.type === 'awards' && (
            <AwardsSection
              content={section.content as Award[]}
              onChange={(content) => updateSection(section.id, content)}
            />
          )}
          
          {section.type === 'custom' && (
            <CustomSection
              content={section.content as CustomContent}
              onChange={(content) => updateSection(section.id, content)}
              sectionTitle={section.title}
            />
          )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
