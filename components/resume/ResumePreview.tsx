'use client';

import { useResume } from '@/contexts/ResumeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';
import { PreviewToolbar } from './PreviewToolbar';
import { TemplateRenderer } from './templates/TemplateRenderer';
import { useState, useEffect, useRef } from 'react';

// Constants for page calculations
const PAGE_HEIGHT_INCHES = 11;
const PAGE_WIDTH_INCHES = 8.5;
const PIXELS_PER_INCH = 96; // Standard screen DPI
const PAGE_HEIGHT_PX = PAGE_HEIGHT_INCHES * PIXELS_PER_INCH;

export function ResumePreview() {
  const { resume, updateMetadata } = useResume();
  const isMobile = useIsMobile();
  const [zoom, setZoom] = useState(100);
  const [isUpdating, setIsUpdating] = useState(false);
  const [pageBreaks, setPageBreaks] = useState<number[]>([]);
  const [fitToScreen, setFitToScreen] = useState(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousResumeRef = useRef<string>('');
  const contentRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  
  // Pinch-to-zoom state
  const initialPinchDistance = useRef<number>(0);
  const initialZoom = useRef<number>(100);

  // Detect content changes and trigger smooth update animation
  useEffect(() => {
    if (!resume) return;

    const currentSnapshot = JSON.stringify(resume);
    
    // Skip if this is the first render or nothing changed
    if (!previousResumeRef.current) {
      previousResumeRef.current = currentSnapshot;
      return;
    }

    if (currentSnapshot === previousResumeRef.current) return;

    // Trigger update animation with smooth transition
    setIsUpdating(true);

    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Reset animation state after 300ms for smooth transition
    updateTimeoutRef.current = setTimeout(() => {
      setIsUpdating(false);
      previousResumeRef.current = currentSnapshot;
    }, 300);

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [resume]);

  // Calculate page breaks and update metadata
  useEffect(() => {
    if (!resume || !contentRef.current) return;

    // Use requestAnimationFrame to ensure DOM is fully rendered
    const calculatePageBreaks = () => {
      requestAnimationFrame(() => {
        if (!contentRef.current) return;

        const contentHeight = contentRef.current.scrollHeight;
        const padding = 0.5 * PIXELS_PER_INCH * 2; // Top and bottom padding
        const effectivePageHeight = PAGE_HEIGHT_PX - padding;
        
        // Calculate number of pages
        const pageCount = Math.ceil(contentHeight / effectivePageHeight);
        
        // Calculate page break positions
        const breaks: number[] = [];
        for (let i = 1; i < pageCount; i++) {
          breaks.push(i * effectivePageHeight);
        }
        
        setPageBreaks(breaks);
        
        // Update metadata with new page count
        if (updateMetadata && resume.metadata.page_count !== pageCount) {
          updateMetadata({ page_count: pageCount });
        }
      });
    };

    // Calculate immediately
    calculatePageBreaks();

    // Recalculate after a short delay to ensure all content is rendered
    const timeoutId = setTimeout(calculatePageBreaks, 100);

    return () => clearTimeout(timeoutId);
  }, [resume, updateMetadata]);

  // Calculate fit-to-screen zoom on mobile
  useEffect(() => {
    if (!isMobile || !previewContainerRef.current || !fitToScreen) return;

    const calculateFitZoom = () => {
      if (!previewContainerRef.current) return;
      
      const containerWidth = previewContainerRef.current.clientWidth;
      const pageWidthInches = 8.5;
      const pageWidthPx = pageWidthInches * PIXELS_PER_INCH;
      const padding = 32; // 16px padding on each side
      
      const fitZoom = ((containerWidth - padding) / pageWidthPx) * 100;
      setZoom(Math.min(100, Math.max(50, fitZoom)));
    };

    calculateFitZoom();
    window.addEventListener('resize', calculateFitZoom);
    
    return () => window.removeEventListener('resize', calculateFitZoom);
  }, [isMobile, fitToScreen]);

  // Pinch-to-zoom handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || e.touches.length !== 2) return;
    
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const distance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    
    initialPinchDistance.current = distance;
    initialZoom.current = zoom;
    setFitToScreen(false); // Disable fit-to-screen when user manually zooms
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || e.touches.length !== 2 || initialPinchDistance.current === 0) return;
    
    e.preventDefault(); // Prevent default pinch-zoom behavior
    
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const distance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    
    const scale = distance / initialPinchDistance.current;
    const newZoom = Math.min(150, Math.max(50, initialZoom.current * scale));
    
    setZoom(Math.round(newZoom));
  };

  const handleTouchEnd = () => {
    initialPinchDistance.current = 0;
  };



  return (
    <div 
      className="h-full flex flex-col bg-muted/20"
      role="region"
      aria-label="Resume preview"
    >
      {/* Preview Toolbar */}
      <PreviewToolbar
        zoom={zoom}
        onZoomChange={setZoom}
        pageCount={resume?.metadata?.page_count || 1}
        fitToScreen={fitToScreen}
        onFitToScreenChange={setFitToScreen}
        isMobile={isMobile}
      />

      {/* Preview Content */}
      <div 
        ref={previewContainerRef}
        className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        aria-label="Resume preview content"
      >
        {resume ? (
          <div className="relative">
            <div
              id="resume-preview"
              role="document"
              aria-label={`${resume.title} preview at ${zoom}% zoom`}
              className={`bg-white shadow-2xl transition-all duration-500 ${
                isUpdating ? 'opacity-90 scale-[0.995]' : 'opacity-100 scale-100'
              }`}
              style={{
                transform: `scale(${zoom / 100}) ${isUpdating ? 'scale(0.995)' : ''}`,
                transformOrigin: 'top center',
                width: '8.5in',
                minHeight: '11in',
                paddingTop: `${resume.styling.margin_top}in`,
                paddingBottom: `${resume.styling.margin_bottom}in`,
                paddingLeft: `${resume.styling.margin_left}in`,
                paddingRight: `${resume.styling.margin_right}in`,
              }}
            >
              <div ref={contentRef}>
                {/* Use TemplateRenderer to render resume with selected template */}
                <TemplateRenderer resume={resume} />
              </div>
            </div>
            
            {/* Page Break Indicators */}
            {pageBreaks.map((breakPosition, index) => (
              <div
                key={index}
                className="absolute left-0 right-0 pointer-events-none"
                style={{
                  top: `${breakPosition}px`,
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                }}
              >
                <div className="relative">
                  <div className="h-px bg-red-500 opacity-50" />
                  <div className="absolute right-2 -top-3 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                    Page {index + 1} / {index + 2}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No resume selected. Create or select a resume to see the preview.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
