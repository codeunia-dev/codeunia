'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface PreviewToolbarProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  pageCount: number;
  fitToScreen?: boolean;
  onFitToScreenChange?: (fit: boolean) => void;
  isMobile?: boolean;
}

const ZOOM_LEVELS = [50, 75, 100, 125, 150];

export function PreviewToolbar({ 
  zoom, 
  onZoomChange, 
  pageCount,
  fitToScreen = false,
  onFitToScreenChange,
  isMobile = false
}: PreviewToolbarProps) {
  const handleZoomIn = () => {
    if (onFitToScreenChange) {
      onFitToScreenChange(false);
    }
    const currentIndex = ZOOM_LEVELS.indexOf(zoom);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      onZoomChange(ZOOM_LEVELS[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    if (onFitToScreenChange) {
      onFitToScreenChange(false);
    }
    const currentIndex = ZOOM_LEVELS.indexOf(zoom);
    if (currentIndex > 0) {
      onZoomChange(ZOOM_LEVELS[currentIndex - 1]);
    }
  };

  const handleFitToScreen = () => {
    if (onFitToScreenChange) {
      onFitToScreenChange(!fitToScreen);
    }
  };

  const canZoomIn = zoom < ZOOM_LEVELS[ZOOM_LEVELS.length - 1];
  const canZoomOut = zoom > ZOOM_LEVELS[0];

  return (
    <div className="flex items-center justify-between p-2 sm:p-4 border-b bg-background">
      {/* Zoom Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          disabled={!canZoomOut || fitToScreen}
          aria-label="Zoom out"
          title="Zoom out"
          className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="min-w-[60px] sm:min-w-[70px] font-medium h-8 sm:h-9 text-xs sm:text-sm"
              aria-label={`Current zoom level: ${zoom}%`}
              disabled={fitToScreen}
            >
              {fitToScreen ? 'Fit' : `${zoom}%`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {ZOOM_LEVELS.map((level) => (
              <DropdownMenuItem
                key={level}
                onClick={() => {
                  if (onFitToScreenChange) {
                    onFitToScreenChange(false);
                  }
                  onZoomChange(level);
                }}
                className={zoom === level && !fitToScreen ? 'bg-accent' : ''}
              >
                {level}%
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          disabled={!canZoomIn || fitToScreen}
          aria-label="Zoom in"
          title="Zoom in"
          className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        {/* Fit to Screen Button (Mobile Only) */}
        {isMobile && onFitToScreenChange && (
          <Button
            variant={fitToScreen ? 'default' : 'outline'}
            size="sm"
            onClick={handleFitToScreen}
            aria-label="Fit to screen"
            title="Fit to screen"
            className={cn(
              "h-8 w-8 sm:h-9 sm:w-auto sm:px-3",
              fitToScreen && "bg-primary text-primary-foreground"
            )}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Page Count Indicator */}
      <Badge variant="secondary" className="font-medium text-xs sm:text-sm">
        <span className="hidden sm:inline">Page </span>{pageCount}
      </Badge>
    </div>
  );
}
