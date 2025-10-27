'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useResume } from '@/contexts/ResumeContext';
import { SECTION_TYPES, SectionType } from '@/types/resume';
import {
  Plus,
  User,
  GraduationCap,
  Briefcase,
  Code,
  Wrench,
  Award,
  Trophy,
  FileText,
} from 'lucide-react';

// Icon mapping for section types
const SECTION_ICONS: Record<SectionType, React.ComponentType<{ className?: string }>> = {
  personal_info: User,
  education: GraduationCap,
  experience: Briefcase,
  projects: Code,
  skills: Wrench,
  certifications: Award,
  awards: Trophy,
  custom: FileText,
};

export function AddSectionMenu() {
  const { addSection, resume } = useResume();

  if (!resume) return null;

  // Get section types that can be added (exclude personal_info as it's always present)
  const availableSectionTypes = Object.values(SECTION_TYPES).filter(
    (sectionType) => sectionType.type !== 'personal_info'
  );

  const handleAddSection = (type: SectionType) => {
    addSection(type);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5"
          aria-label="Add a new section to your resume"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-64"
        aria-label="Section types"
      >
        <DropdownMenuLabel>Choose a section type</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableSectionTypes.map((sectionType) => {
          const Icon = SECTION_ICONS[sectionType.type];
          return (
            <DropdownMenuItem
              key={sectionType.type}
              onClick={() => handleAddSection(sectionType.type)}
              className="cursor-pointer"
              aria-label={`Add ${sectionType.label} section`}
            >
              <div className="flex items-start gap-3 py-1">
                <Icon className="h-5 w-5 mt-0.5 text-primary" />
                <div className="flex-1">
                  <div className="font-medium">{sectionType.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {sectionType.description}
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
