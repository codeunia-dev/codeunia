'use client';

import { useState, lazy, Suspense } from 'react';
import { useResume } from '@/contexts/ResumeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Save,
  Settings,
  Check,
  Loader2,
  AlertCircle,
  Upload,
  ChevronDown,
  Copy,
  MoreVertical,
  Download,
  Palette,
} from 'lucide-react';
import { toast } from 'sonner';
import { TemplateSelector } from './TemplateSelector';
import { ExportMenu } from './ExportMenu';
import { SaveAsDialog } from './SaveAsDialog';

// Lazy load large components for better performance
const StyleCustomizer = lazy(() => import('./StyleCustomizer').then(m => ({ default: m.StyleCustomizer })));
const ImportDialog = lazy(() => import('./ImportDialog').then(m => ({ default: m.ImportDialog })));

export function ResumeToolbar() {
  const {
    resume,
    saveResume,
    saving,
    saveStatus,
  } = useResume();

  const isMobile = useIsMobile();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [saveAsDialogOpen, setSaveAsDialogOpen] = useState(false);
  const [styleSheetOpen, setStyleSheetOpen] = useState(false);

  // Handle manual save
  const handleSave = async () => {
    try {
      await saveResume();
      toast.success('Resume saved', {
        description: 'Your changes have been saved successfully.',
      });
    } catch {
      toast.error('Save failed', {
        description: 'Failed to save your resume. Please try again.',
      });
    }
  };

  // Get save button icon and text
  const getSaveButtonContent = () => {
    switch (saveStatus) {
      case 'saving':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: 'Saving...',
        };
      case 'saved':
        return {
          icon: <Check className="h-4 w-4" />,
          text: 'Saved',
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          text: 'Error',
        };
      default:
        return {
          icon: <Save className="h-4 w-4" />,
          text: 'Save',
        };
    }
  };

  const saveButtonContent = getSaveButtonContent();

  return (
    <div 
      className="border-b bg-background px-4 py-2 sm:py-3"
      role="toolbar"
      aria-label="Resume builder toolbar"
    >
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left side - Resume title */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h1 className="text-base sm:text-lg font-semibold truncate">
            {resume?.title || 'Untitled Resume'}
          </h1>
        </div>

        {/* Right side - Actions */}
        {isMobile ? (
          // Mobile: Compact menu with all actions
          <div className="flex items-center gap-1">
            {/* Quick Save Button */}
            <Button
              variant={saveStatus === 'error' ? 'destructive' : 'default'}
              size="sm"
              onClick={handleSave}
              disabled={!resume || saving || saveStatus === 'saving'}
              className="px-2"
              aria-label={`Save resume. Status: ${saveButtonContent.text}. Keyboard shortcut: Ctrl+S`}
            >
              {saveButtonContent.icon}
            </Button>

            {/* More Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="px-2"
                  aria-label="More actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleSave} disabled={!resume}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSaveAsDialogOpen(true)} disabled={!resume}>
                  <Copy className="h-4 w-4 mr-2" />
                  Save As...
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setImportDialogOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <div className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    <ExportMenu compact />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <div className="w-full">
                    <Palette className="h-4 w-4 mr-2" />
                    <TemplateSelector compact />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStyleSheetOpen(true)} disabled={!resume}>
                  <Settings className="h-4 w-4 mr-2" />
                  Customize Style
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          // Desktop: Full toolbar
          <div className="flex items-center gap-2">
            {/* Import Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportDialogOpen(true)}
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Import</span>
            </Button>

            {/* Template Selector */}
            <TemplateSelector />

            {/* Export Menu */}
            <ExportMenu />

            {/* Settings Menu */}
            <Sheet open={styleSheetOpen} onOpenChange={setStyleSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" disabled={!resume}>
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Customize</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Customize Style</SheetTitle>
                  <SheetDescription>
                    Adjust fonts, colors, and spacing to personalize your resume
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <Suspense fallback={
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  }>
                    <StyleCustomizer />
                  </Suspense>
                </div>
              </SheetContent>
            </Sheet>

            {/* Save Button with Dropdown */}
            <DropdownMenu>
              <div className="flex items-center">
                <Button
                  variant={saveStatus === 'error' ? 'destructive' : 'default'}
                  size="sm"
                  onClick={handleSave}
                  disabled={!resume || saving || saveStatus === 'saving'}
                  className="rounded-r-none"
                >
                  {saveButtonContent.icon}
                  <span className="hidden sm:inline">{saveButtonContent.text}</span>
                </Button>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={saveStatus === 'error' ? 'destructive' : 'default'}
                    size="sm"
                    disabled={!resume || saving || saveStatus === 'saving'}
                    className="rounded-l-none border-l px-2"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </div>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSave} disabled={!resume}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSaveAsDialogOpen(true)} disabled={!resume}>
                  <Copy className="h-4 w-4 mr-2" />
                  Save As...
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Import Dialog */}
      <Suspense fallback={null}>
        <ImportDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} />
      </Suspense>
      
      {/* Save As Dialog */}
      <SaveAsDialog open={saveAsDialogOpen} onOpenChange={setSaveAsDialogOpen} />

      {/* Style Customizer Sheet for Mobile */}
      {isMobile && (
        <Sheet open={styleSheetOpen} onOpenChange={setStyleSheetOpen}>
          <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Customize Style</SheetTitle>
              <SheetDescription>
                Adjust fonts, colors, and spacing to personalize your resume
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <Suspense fallback={
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              }>
                <StyleCustomizer />
              </Suspense>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
