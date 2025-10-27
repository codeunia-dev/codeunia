'use client';

import { Resume } from '@/types/resume';
import { useEffect, useState, lazy, Suspense } from 'react';

// Lazy load template components for better performance
const ModernTemplate = lazy(() => import('./ModernTemplate').then(m => ({ default: m.ModernTemplate })));
const ClassicTemplate = lazy(() => import('./ClassicTemplate').then(m => ({ default: m.ClassicTemplate })));
const MinimalTemplate = lazy(() => import('./MinimalTemplate').then(m => ({ default: m.MinimalTemplate })));
const CreativeTemplate = lazy(() => import('./CreativeTemplate').then(m => ({ default: m.CreativeTemplate })));
const ExecutiveTemplate = lazy(() => import('./ExecutiveTemplate').then(m => ({ default: m.ExecutiveTemplate })));

// Template registry mapping template IDs to their lazy-loaded components
const TEMPLATES: Record<string, React.ComponentType<{ resume: Resume }>> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  creative: CreativeTemplate,
  executive: ExecutiveTemplate,
};

// Default template if none is specified or template ID is invalid
const DEFAULT_TEMPLATE = 'modern';

interface TemplateRendererProps {
  resume: Resume | null;
}

export function TemplateRenderer({ resume }: TemplateRendererProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState<string>(DEFAULT_TEMPLATE);

  // Handle template switching with animation
  useEffect(() => {
    if (!resume) return;

    const newTemplateId = resume.template_id || DEFAULT_TEMPLATE;
    
    // If template changed, trigger transition animation
    if (newTemplateId !== currentTemplateId) {
      setIsTransitioning(true);
      
      // Update template after brief fade out
      const timeoutId = setTimeout(() => {
        setCurrentTemplateId(newTemplateId);
        setIsTransitioning(false);
      }, 150);

      return () => clearTimeout(timeoutId);
    }
  }, [resume, currentTemplateId]);

  // Return null if no resume is provided
  if (!resume) {
    return null;
  }

  // Get the template component, fallback to default if not found
  const TemplateComponent = TEMPLATES[currentTemplateId] || TEMPLATES[DEFAULT_TEMPLATE];

  // Validate that we have a valid template component
  if (!TemplateComponent) {
    console.error(`Template "${currentTemplateId}" not found, using default template`);
    const DefaultTemplate = TEMPLATES[DEFAULT_TEMPLATE];
    return <DefaultTemplate resume={resume} />;
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Loading template...</div>
      </div>
    }>
      <div
        className={`transition-opacity duration-300 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <TemplateComponent resume={resume} />
      </div>
    </Suspense>
  );
}
