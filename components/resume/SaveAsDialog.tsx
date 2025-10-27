'use client';

import { useState } from 'react';
import { useResume } from '@/contexts/ResumeContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface SaveAsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveAsDialog({ open, onOpenChange }: SaveAsDialogProps) {
  const { resume, duplicateResume, loadResume } = useResume();
  const [newTitle, setNewTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Reset state when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && resume) {
      setNewTitle(`${resume.title} (Copy)`);
    } else {
      setNewTitle('');
    }
    onOpenChange(newOpen);
  };

  // Handle save as
  const handleSaveAs = async () => {
    if (!resume) return;
    
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
      toast.error('Invalid title', {
        description: 'Please enter a valid resume title.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const duplicated = await duplicateResume(resume.id, trimmedTitle);
      
      // Load the new resume
      await loadResume(duplicated.id);
      
      toast.success('Resume saved successfully! ✓', {
        description: `Created "${duplicated.title}"`,
        duration: 4000,
      });
      
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save as', {
        description: 'Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSaving) {
      e.preventDefault();
      handleSaveAs();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Resume As</DialogTitle>
          <DialogDescription>
            Create a copy of your resume with a new name. The current resume will remain unchanged.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="resume-title">Resume Title</Label>
            <Input
              id="resume-title"
              placeholder="Enter resume title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveAs}
            disabled={isSaving || !newTitle.trim()}
          >
            {isSaving ? 'Saving...' : 'Save As'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
