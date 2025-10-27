'use client';

import { useState, useCallback } from 'react';
import { Upload, FileJson, AlertCircle, CheckCircle2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ResumeImportService, ImportResult } from '@/lib/services/resume-import';
import { useResume } from '@/contexts/ResumeContext';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ImportState = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const { importFromJSON } = useResume();
  const [state, setState] = useState<ImportState>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const resetState = useCallback(() => {
    setState('idle');
    setProgress(0);
    setResult(null);
    setDragActive(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onOpenChange(false);
  }, [resetState, onOpenChange]);

  const processFile = async (file: File) => {
    try {
      setState('uploading');
      setProgress(20);

      // Validate file type
      if (!ResumeImportService.validateFileType(file)) {
        setResult({
          success: false,
          errors: ['Invalid file type. Please upload a JSON file.'],
          warnings: [],
          fieldsPopulated: 0,
        });
        setState('error');
        return;
      }

      // Validate file size
      if (!ResumeImportService.validateFileSize(file, 5)) {
        setResult({
          success: false,
          errors: ['File size exceeds 5MB limit.'],
          warnings: [],
          fieldsPopulated: 0,
        });
        setState('error');
        return;
      }

      setProgress(40);
      setState('processing');

      // Read file content
      const fileContent = await file.text();
      setProgress(60);

      // Import resume data
      const importResult = await importFromJSON(fileContent);
      setProgress(100);

      setResult(importResult);
      setState(importResult.success ? 'success' : 'error');

      // Close dialog after successful import
      if (importResult.success) {
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (error) {
      setResult({
        success: false,
        errors: [`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        fieldsPopulated: 0,
      });
      setState('error');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const renderContent = () => {
    switch (state) {
      case 'idle':
        return (
          <div className="space-y-4">
            <div
              className={`
                relative border-2 border-dashed rounded-lg p-8
                transition-colors duration-200
                ${dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
                }
              `}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="p-4 rounded-full bg-primary/10">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    Drop your resume JSON file here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse
                  </p>
                </div>

                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={state !== 'idle'}
                />
              </div>
            </div>

            <Alert>
              <FileJson className="h-4 w-4" />
              <AlertDescription>
                Upload a JSON file exported from this resume builder or compatible format.
                Maximum file size: 5MB.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'uploading':
      case 'processing':
        return (
          <div className="space-y-4 py-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 rounded-full bg-primary/10 animate-pulse">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              
              <div className="space-y-2 text-center w-full">
                <p className="text-lg font-medium">
                  {state === 'uploading' ? 'Uploading file...' : 'Processing resume data...'}
                </p>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  {progress}% complete
                </p>
              </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="space-y-4 py-8 animate-fade-in">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 rounded-full bg-green-500/10 animate-scale-in">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              
              <div className="space-y-2 text-center">
                <p className="text-lg font-medium text-green-600 dark:text-green-400">
                  🎉 Import successful!
                </p>
                <p className="text-sm text-muted-foreground">
                  {result?.fieldsPopulated || 0} fields populated
                </p>
              </div>

              {result?.warnings && result.warnings.length > 0 && (
                <Alert className="w-full">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      {result.warnings.map((warning, index) => (
                        <p key={index} className="text-sm">{warning}</p>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Import failed</p>
                  {result?.errors && result.errors.length > 0 && (
                    <ul className="list-disc list-inside space-y-1">
                      {result.errors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={resetState}>
                Try Again
              </Button>
              <Button variant="default" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Import Resume</DialogTitle>
            {state !== 'uploading' && state !== 'processing' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <DialogDescription>
            Import your resume data from a JSON file
          </DialogDescription>
        </DialogHeader>

        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
