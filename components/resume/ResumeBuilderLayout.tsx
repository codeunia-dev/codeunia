'use client';

import { useResume } from '@/contexts/ResumeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useFocusVisible } from '@/hooks/useFocusManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ResumeEditor } from './ResumeEditor';
import { ResumePreview } from './ResumePreview';
import { ResumeToolbar } from './ResumeToolbar';
import { SaveErrorBanner } from './SaveErrorBanner';
import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { FileEdit, Eye, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import toast from 'react-hot-toast';
import { LiveRegion } from '@/components/accessibility/LiveRegion';
import { FullPageLoadingSkeleton, ResumeListSkeleton } from './LoadingSkeleton';

// Lazy load large components for better performance
const ResumeList = lazy(() => import('./ResumeList').then(m => ({ default: m.ResumeList })));

export function ResumeBuilderLayout() {
  const { loading, saveResume, resume, announcement } = useResume();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const [resumeListOpen, setResumeListOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Touch gesture state
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Enable focus visible indicators for keyboard navigation
  useFocusVisible();

  // Keyboard shortcuts
  useKeyboardShortcuts(
    [
      {
        key: 's',
        ctrl: true,
        handler: (e) => {
          e.preventDefault();
          if (resume) {
            saveResume();
            toast.success('Resume saved successfully');
          }
        },
        description: 'Save resume',
      },
      {
        key: 'e',
        ctrl: true,
        handler: (e) => {
          e.preventDefault();
          setShowExportMenu(true);
        },
        description: 'Open export menu',
      },
      {
        key: 'Escape',
        handler: (e) => {
          e.preventDefault();
          if (resumeListOpen) {
            setResumeListOpen(false);
          } else if (showExportMenu) {
            setShowExportMenu(false);
          }
        },
        description: 'Close dialogs',
      },
    ],
    mounted && !loading
  );

  // Handle hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle swipe gestures for tab switching on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    
    const swipeThreshold = 50; // Minimum swipe distance in pixels
    const swipeDistance = touchStartX.current - touchEndX.current;

    // Swipe left (next tab)
    if (swipeDistance > swipeThreshold && activeTab === 'editor') {
      setActiveTab('preview');
    }
    
    // Swipe right (previous tab)
    if (swipeDistance < -swipeThreshold && activeTab === 'preview') {
      setActiveTab('editor');
    }

    // Reset touch positions
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (loading || !mounted) {
    return <FullPageLoadingSkeleton />;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Skip to main content link for keyboard navigation */}
      <a href="#resume-editor" className="skip-link">
        Skip to resume editor
      </a>
      
      {/* Live Region for Screen Reader Announcements */}
      <LiveRegion message={announcement} />
      
      {/* Toolbar */}
      <ResumeToolbar />
      
      {/* Save Error Banner */}
      <div className="px-4 pt-4">
        <SaveErrorBanner />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {isMobile ? (
          // Mobile: Tabbed Interface with Resume List Sheet and Swipe Gestures
          <>
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col"
            >
              <div className="border-b bg-background px-4">
                <div className="flex items-center gap-2">
                  <Sheet open={resumeListOpen} onOpenChange={setResumeListOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm" className="mr-2">
                        <List className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-full sm:max-w-md p-0">
                      <SheetHeader className="sr-only">
                        <SheetTitle>Resume List</SheetTitle>
                      </SheetHeader>
                      <Suspense fallback={<ResumeListSkeleton />}>
                        <ResumeList 
                          onResumeSelect={() => setResumeListOpen(false)}
                          onCreateNew={() => setResumeListOpen(false)}
                        />
                      </Suspense>
                    </SheetContent>
                  </Sheet>
                  <TabsList className="flex-1 grid grid-cols-2 h-12">
                    <TabsTrigger value="editor" className="flex items-center gap-2">
                      <FileEdit className="h-4 w-4" />
                      <span>Edit</span>
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>Preview</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
              <div
                ref={tabsContainerRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="flex-1 overflow-hidden"
              >
                <TabsContent 
                  value="editor" 
                  className={`h-full m-0 overflow-hidden ${
                    activeTab === 'editor' ? 'animate-slide-in-left' : ''
                  }`}
                >
                  <ResumeEditor />
                </TabsContent>
                <TabsContent 
                  value="preview" 
                  className={`h-full m-0 overflow-hidden ${
                    activeTab === 'preview' ? 'animate-slide-in-right' : ''
                  }`}
                >
                  <ResumePreview />
                </TabsContent>
              </div>
            </Tabs>
          </>
        ) : (
          // Desktop: Split-Panel Layout with Resume List Sidebar
          <div className="flex-1 flex">
            {/* Resume List Sidebar */}
            <div className="w-80 border-r flex flex-col">
              <Suspense fallback={<ResumeListSkeleton />}>
                <ResumeList />
              </Suspense>
            </div>

            {/* Editor Panel */}
            <div className="w-[40%] min-w-[400px] max-w-[600px] flex flex-col">
              <ResumeEditor />
            </div>

            {/* Separator */}
            <Separator orientation="vertical" className="h-full" />

            {/* Preview Panel */}
            <div className="flex-1 flex flex-col">
              <ResumePreview />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
