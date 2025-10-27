'use client';

import { useState, useMemo } from 'react';
import { useResume } from '@/contexts/ResumeContext';
import { Resume } from '@/types/resume';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Search,
  MoreVertical,
  Trash2,
  Copy,
  Calendar,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface ResumeListProps {
  onResumeSelect?: (resume: Resume) => void;
  onCreateNew?: () => void;
}

export function ResumeList({ onResumeSelect, onCreateNew }: ResumeListProps) {
  const {
    resumes,
    resume: currentResume,
    loadResume,
    deleteResume,
    duplicateResume,
    createResume,
  } = useResume();

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<Resume | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter resumes based on search query
  const filteredResumes = useMemo(() => {
    if (!searchQuery.trim()) return resumes;

    const query = searchQuery.toLowerCase();
    return resumes.filter((resume) =>
      resume.title.toLowerCase().includes(query)
    );
  }, [resumes, searchQuery]);

  // Handle resume selection
  const handleSelectResume = async (resume: Resume) => {
    try {
      await loadResume(resume.id);
      onResumeSelect?.(resume);
      toast.success('Resume loaded', {
        description: `Loaded "${resume.title}"`,
      });
    } catch {
      toast.error('Failed to load resume', {
        description: 'Please try again.',
      });
    }
  };

  // Handle resume duplication
  const handleDuplicateResume = async (resume: Resume) => {
    try {
      const duplicated = await duplicateResume(resume.id);
      toast.success('Resume duplicated', {
        description: `Created "${duplicated.title}"`,
      });
    } catch {
      toast.error('Failed to duplicate resume', {
        description: 'Please try again.',
      });
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (resume: Resume) => {
    setResumeToDelete(resume);
    setDeleteDialogOpen(true);
  };

  // Handle resume deletion
  const handleConfirmDelete = async () => {
    if (!resumeToDelete) return;

    setIsDeleting(true);
    try {
      await deleteResume(resumeToDelete.id);
      toast.success('Resume deleted', {
        description: `Deleted "${resumeToDelete.title}"`,
      });
      setDeleteDialogOpen(false);
      setResumeToDelete(null);
    } catch {
      toast.error('Failed to delete resume', {
        description: 'Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle create new resume
  const handleCreateNew = async () => {
    try {
      const newResume = await createResume('Untitled Resume', false);
      onCreateNew?.();
      toast.success('Resume created', {
        description: `Created "${newResume.title}"`,
      });
    } catch {
      toast.error('Failed to create resume', {
        description: 'Please try again.',
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My Resumes</h2>
          <Button size="sm" onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            New Resume
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resumes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Resume List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredResumes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">
              {searchQuery ? 'No resumes found' : 'No resumes yet'}
            </p>
            {!searchQuery && (
              <Button variant="outline" size="sm" onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create your first resume
              </Button>
            )}
          </div>
        ) : (
          filteredResumes.map((resume) => (
            <Card
              key={resume.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                currentResume?.id === resume.id
                  ? 'ring-2 ring-primary'
                  : ''
              }`}
              onClick={() => handleSelectResume(resume)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {resume.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3" />
                      <span className="text-xs">
                        Updated {formatDate(resume.updated_at)}
                      </span>
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateResume(resume);
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(resume);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {resume.template_id}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {resume.sections.length} sections
                  </Badge>
                  {resume.metadata?.page_count && (
                    <Badge variant="outline" className="text-xs">
                      {resume.metadata.page_count} {resume.metadata.page_count === 1 ? 'page' : 'pages'}
                    </Badge>
                  )}
                  {resume.metadata?.word_count && (
                    <Badge variant="outline" className="text-xs">
                      {resume.metadata.word_count} words
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resume</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{resumeToDelete?.title}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
