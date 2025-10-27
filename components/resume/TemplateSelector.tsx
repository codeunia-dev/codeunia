'use client';

import { useState } from 'react';
import { useResume } from '@/contexts/ResumeContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Template metadata with descriptions and visual characteristics
const TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean design with purple accents and two-column layout',
    color: 'from-purple-600 to-indigo-600',
    preview: 'Modern template with gradient headers and sidebar for skills',
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional single-column layout with serif fonts',
    color: 'from-slate-700 to-slate-900',
    preview: 'Professional single-column layout with conservative styling',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra-clean with maximum whitespace and simple typography',
    color: 'from-gray-600 to-gray-800',
    preview: 'Minimalist design focusing on content hierarchy',
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bold and colorful design with unique structure',
    color: 'from-orange-500 to-pink-600',
    preview: 'Eye-catching layout with vibrant colors and visual elements',
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Professional layout for senior positions with elegant typography',
    color: 'from-blue-700 to-blue-900',
    preview: 'Sophisticated design with refined spacing and branding',
  },
];

interface TemplateSelectorProps {
  trigger?: React.ReactNode;
  compact?: boolean;
}

export function TemplateSelector({ trigger, compact = false }: TemplateSelectorProps) {
  const { resume, applyTemplate } = useResume();
  const [open, setOpen] = useState(false);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentTemplateId = resume?.template_id || 'modern';

  const handleTemplateSelect = (templateId: string) => {
    if (templateId === currentTemplateId) {
      setOpen(false);
      return;
    }

    // Trigger transition animation
    setIsTransitioning(true);

    // Apply template after brief animation
    setTimeout(() => {
      applyTemplate(templateId);
      setIsTransitioning(false);
      
      // Close dialog after template is applied
      setTimeout(() => {
        setOpen(false);
      }, 300);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          compact ? (
            <span className="w-full" onClick={() => setOpen(true)}>
              Templates
            </span>
          ) : (
            <Button variant="outline" size="sm">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Template</span>
            </Button>
          )
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Choose a Template
          </DialogTitle>
          <DialogDescription>
            Select a template that best represents your personal brand. Your content will be preserved.
          </DialogDescription>
        </DialogHeader>

        {/* Template Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {TEMPLATES.map((template) => {
            const isSelected = template.id === currentTemplateId;
            const isHovered = hoveredTemplate === template.id;

            return (
              <div
                key={template.id}
                className={cn(
                  'relative group cursor-pointer rounded-lg border-2 transition-all duration-300',
                  isSelected
                    ? 'border-purple-600 shadow-lg shadow-purple-200 dark:shadow-purple-900/50'
                    : 'border-border hover:border-purple-400 hover:shadow-md',
                  isTransitioning && 'pointer-events-none opacity-50'
                )}
                onClick={() => handleTemplateSelect(template.id)}
                onMouseEnter={() => setHoveredTemplate(template.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
              >
                {/* Template Thumbnail */}
                <div className="relative aspect-[8.5/11] overflow-hidden rounded-t-lg bg-white">
                  {/* Thumbnail Preview */}
                  <div className="absolute inset-0 p-4 scale-[0.35] origin-top-left">
                    <TemplateThumbnail template={template} />
                  </div>

                  {/* Hover Overlay */}
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300',
                      isHovered ? 'opacity-100' : 'opacity-0'
                    )}
                  >
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <p className="text-sm font-medium">{template.preview}</p>
                    </div>
                  </div>

                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 animate-fade-in">
                      <Badge className="bg-purple-600 text-white">
                        <Check className="h-3 w-3 mr-1" />
                        Selected
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Template Info */}
                <div className="p-4 bg-background">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg">{template.name}</h3>
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full bg-gradient-to-br',
                        template.color,
                        'transition-transform duration-300',
                        isHovered && 'scale-110'
                      )}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>

                {/* Hover Effect Border */}
                <div
                  className={cn(
                    'absolute inset-0 rounded-lg bg-gradient-to-br pointer-events-none transition-opacity duration-300',
                    template.color,
                    isHovered ? 'opacity-10' : 'opacity-0'
                  )}
                />
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            💡 Tip: Hover over a template to see a preview description. Your content will automatically adapt to the new layout.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Template Thumbnail Component - Renders a miniature version of each template
function TemplateThumbnail({ template }: { template: typeof TEMPLATES[0] }) {
  return (
    <div className="w-[850px] h-[1100px] bg-white p-12 text-[10px]">
      {/* Header with gradient based on template color */}
      <div className="mb-6 pb-4 border-b-2" style={{ borderColor: getTemplateColor(template.id) }}>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: getTemplateColor(template.id) }}
        >
          Your Name
        </h1>
        <div className="flex gap-3 text-gray-600 text-xs">
          <span>email@example.com</span>
          <span>•</span>
          <span>(555) 123-4567</span>
          <span>•</span>
          <span>City, State</span>
        </div>
      </div>

      {/* Content sections */}
      <div className={cn(
        template.id === 'modern' ? 'grid grid-cols-3 gap-6' : 'space-y-4'
      )}>
        {/* Main content */}
        <div className={cn(template.id === 'modern' ? 'col-span-2' : '')}>
          {/* Experience Section */}
          <div className="mb-4">
            <h2
              className="text-sm font-bold mb-2 uppercase"
              style={{ color: getTemplateColor(template.id) }}
            >
              Experience
            </h2>
            <div className="space-y-2">
              <div className="border-l-2 pl-2" style={{ borderColor: getTemplateColor(template.id) }}>
                <div className="font-bold text-xs">Job Title</div>
                <div className="text-xs text-gray-600">Company Name • 2020 - Present</div>
                <div className="text-xs text-gray-700 mt-1">
                  Brief description of responsibilities and achievements.
                </div>
              </div>
            </div>
          </div>

          {/* Education Section */}
          <div>
            <h2
              className="text-sm font-bold mb-2 uppercase"
              style={{ color: getTemplateColor(template.id) }}
            >
              Education
            </h2>
            <div className="border-l-2 pl-2" style={{ borderColor: getTemplateColor(template.id) }}>
              <div className="font-bold text-xs">Degree Name</div>
              <div className="text-xs text-gray-600">University Name • 2016 - 2020</div>
            </div>
          </div>
        </div>

        {/* Sidebar for Modern template */}
        {template.id === 'modern' && (
          <div className="space-y-4">
            <div className="bg-purple-50 p-3 rounded">
              <h2 className="text-sm font-bold mb-2 text-purple-700 uppercase">Skills</h2>
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-0.5 bg-purple-200 text-purple-700 rounded text-xs">
                  Skill 1
                </span>
                <span className="px-2 py-0.5 bg-purple-200 text-purple-700 rounded text-xs">
                  Skill 2
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get template primary color
function getTemplateColor(templateId: string): string {
  const colorMap: Record<string, string> = {
    modern: '#9333ea', // purple-600
    classic: '#334155', // slate-700
    minimal: '#4b5563', // gray-600
    creative: '#f97316', // orange-500
    executive: '#1d4ed8', // blue-700
  };
  return colorMap[templateId] || '#9333ea';
}
