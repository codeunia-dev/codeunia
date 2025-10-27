'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, X, WifiOff } from 'lucide-react';
import { useResume } from '@/contexts/ResumeContext';

interface SaveErrorBannerProps {
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function SaveErrorBanner({ onRetry, onDismiss }: SaveErrorBannerProps) {
  const { error, saveStatus, saveResume, clearError } = useResume();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    if (onRetry) {
      onRetry();
    } else {
      try {
        await saveResume();
      } catch {
        // Error is handled by context
      }
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    } else {
      clearError();
    }
  };

  // Don't show banner if no error or if save was successful
  if (!error || saveStatus === 'saved' || saveStatus === 'idle') {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <div className="flex items-start gap-3">
        {isOnline ? (
          <AlertTriangle className="h-5 w-5 mt-0.5" />
        ) : (
          <WifiOff className="h-5 w-5 mt-0.5" />
        )}
        <div className="flex-1 space-y-2">
          <AlertTitle className="font-semibold">
            {isOnline ? 'Failed to save resume' : 'You are offline'}
          </AlertTitle>
          <AlertDescription className="text-sm">
            {isOnline
              ? error || 'Your changes could not be saved. Please try again.'
              : 'Your changes are being saved locally and will sync when you reconnect.'}
          </AlertDescription>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              className="gap-2"
              disabled={!isOnline}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="gap-2"
            >
              <X className="h-3.5 w-3.5" />
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </Alert>
  );
}
