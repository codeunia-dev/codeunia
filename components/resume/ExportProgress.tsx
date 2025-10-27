'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface ExportProgressProps {
  format: string;
  onComplete?: () => void;
}

export function ExportProgress({ format, onComplete }: ExportProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progress for better UX
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90; // Stop at 90% until actual completion
        }
        return prev + 10;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100 && onComplete) {
      onComplete();
    }
  }, [progress, onComplete]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <div className="flex-1">
          <p className="text-sm font-medium">Exporting as {format.toUpperCase()}</p>
          <p className="text-xs text-muted-foreground">
            {progress < 30 && 'Preparing document...'}
            {progress >= 30 && progress < 60 && 'Rendering content...'}
            {progress >= 60 && progress < 90 && 'Finalizing export...'}
            {progress >= 90 && 'Almost done...'}
          </p>
        </div>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
