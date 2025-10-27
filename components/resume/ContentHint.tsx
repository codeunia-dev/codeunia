'use client';

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentHintProps {
  show: boolean;
  example?: string;
  characterCount?: number;
  minCharacters?: number;
  className?: string;
}

export function ContentHint({
  show,
  example,
  characterCount,
  minCharacters = 50,
  className,
}: ContentHintProps) {
  if (!show) return null;

  const isMinimal = characterCount !== undefined && characterCount > 0 && characterCount < minCharacters;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Character Count Warning */}
      {isMinimal && (
        <Alert variant="default" className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200">
            This section has minimal content ({characterCount} characters). Consider adding more details
            (recommended: {minCharacters}+ characters).
          </AlertDescription>
        </Alert>
      )}

      {/* Example Content Hint */}
      {example && characterCount === 0 && (
        <Alert variant="default" className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="space-y-2">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Example:
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 italic">
              {example}
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Character Count Display */}
      {characterCount !== undefined && characterCount > 0 && (
        <div className="flex items-center justify-end gap-2">
          <Badge
            variant={characterCount >= minCharacters ? 'default' : 'secondary'}
            className="text-xs"
          >
            {characterCount} characters
          </Badge>
        </div>
      )}
    </div>
  );
}

interface SectionContentHintProps {
  isEmpty: boolean;
  characterCount: number;
  exampleContent: string;
  minCharacters?: number;
  className?: string;
}

export function SectionContentHint({
  isEmpty,
  characterCount,
  exampleContent,
  minCharacters = 50,
  className,
}: SectionContentHintProps) {
  return (
    <ContentHint
      show={isEmpty || characterCount < minCharacters}
      example={isEmpty ? exampleContent : undefined}
      characterCount={isEmpty ? 0 : characterCount}
      minCharacters={minCharacters}
      className={className}
    />
  );
}
