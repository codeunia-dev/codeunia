'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Resume,
  ResumeSection,
  SectionType,
  SectionContent,
  ResumeStyling,
  ResumeMetadata,
  ResumeError,
  ResumeErrorCode,
  DEFAULT_STYLING,
  DEFAULT_METADATA,
  DEFAULT_PERSONAL_INFO,
  SECTION_TYPES,
  DeepPartial,
  ResumeInsert,
  ResumeUpdate,
} from '@/types/resume';
import { Profile } from '@/types/profile';
import { ResumeImportService, ImportResult } from '@/lib/services/resume-import';
import { updateResumeMetadata } from '@/lib/services/resume-metadata';
import { ResumeScoringService, ScoringResult } from '@/lib/services/resume-scoring';
import { saveToLocalStorage, loadFromLocalStorage, removeFromLocalStorage } from '@/lib/storage/offline-storage';

// Context Type Definition
export interface ResumeContextType {
  // State
  resume: Resume | null;
  resumes: Resume[];
  loading: boolean;
  saving: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  error: string | null;
  announcement: string;
  lastAddedSectionId: string | null;

  // Resume CRUD
  createResume: (title: string, autoFill?: boolean) => Promise<Resume>;
  loadResume: (id: string) => Promise<void>;
  saveResume: () => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
  duplicateResume: (id: string, newTitle?: string) => Promise<Resume>;
  updateResumeTitle: (title: string) => void;

  // Section Management
  addSection: (type: SectionType) => void;
  removeSection: (sectionId: string) => void;
  reorderSections: (sections: ResumeSection[]) => void;
  updateSection: (sectionId: string, content: Partial<SectionContent>) => void;
  toggleSectionVisibility: (sectionId: string) => void;

  // Styling
  updateStyling: (styling: Partial<ResumeStyling>) => void;
  applyTemplate: (templateId: string) => void;

  // Metadata
  updateMetadata: (metadata: Partial<ResumeMetadata>) => void;

  // Auto-fill
  autoFillFromProfile: (profile: Profile) => Promise<void>;

  // Import
  importFromJSON: (jsonString: string) => Promise<ImportResult>;

  // Utilities
  calculateScore: () => number;
  getDetailedScore: () => ScoringResult;
  clearError: () => void;
  refreshResumes: () => Promise<void>;
  setAutoSaveEnabled: (enabled: boolean) => void;
}

// Create Context
const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

// Provider Props
interface ResumeProviderProps {
  children: React.ReactNode;
  initialResumes?: Resume[];
  userProfile?: Profile | null;
}

// Helper function to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper function to create default section
const createDefaultSection = (type: SectionType, order: number): ResumeSection => {
  const sectionInfo = SECTION_TYPES[type];
  let defaultContent: SectionContent;

  switch (type) {
    case 'personal_info':
      defaultContent = DEFAULT_PERSONAL_INFO;
      break;
    case 'education':
    case 'experience':
    case 'projects':
    case 'certifications':
    case 'awards':
      defaultContent = [];
      break;
    case 'skills':
      defaultContent = [];
      break;
    case 'custom':
      defaultContent = { title: '', content: '' };
      break;
    default:
      defaultContent = [];
  }

  return {
    id: generateId(),
    type,
    title: sectionInfo.defaultTitle,
    order,
    visible: true,
    content: defaultContent,
  };
};

// Provider Component
export function ResumeProvider({ children, initialResumes = [], userProfile }: ResumeProviderProps) {
  const [resume, setResume] = useState<Resume | null>(null);
  const [resumes, setResumes] = useState<Resume[]>(initialResumes);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string>('');
  const [lastAddedSectionId, setLastAddedSectionId] = useState<string | null>(null);

  const supabase = createClient();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveEnabledRef = useRef(true);
  const lastSavedResumeRef = useRef<string>('');
  const saveQueueRef = useRef<Resume[]>([]);
  const isSavingRef = useRef(false);
  const optimisticStateRef = useRef<Resume | null>(null);

  // Create a new resume
  const createResume = useCallback(
    async (title: string, autoFill = false): Promise<Resume> => {
      try {
        setLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new ResumeError('User not authenticated', ResumeErrorCode.UNAUTHORIZED);
        }

        // Create default sections
        const defaultSections: ResumeSection[] = [
          createDefaultSection('personal_info', 0),
          createDefaultSection('education', 1),
          createDefaultSection('experience', 2),
          createDefaultSection('skills', 3),
        ];

        const newResume: ResumeInsert = {
          user_id: user.id,
          title: title || 'Untitled Resume',
          template_id: 'modern',
          sections: defaultSections as unknown,
          styling: DEFAULT_STYLING as unknown,
          metadata: DEFAULT_METADATA as unknown,
        };

        const { data, error: insertError } = await supabase
          .from('resumes')
          .insert(newResume)
          .select()
          .single();

        if (insertError) {
          throw new ResumeError('Failed to create resume', ResumeErrorCode.SAVE_FAILED, insertError);
        }

        const createdResume: Resume = {
          ...data,
          sections: defaultSections,
          styling: DEFAULT_STYLING,
          metadata: DEFAULT_METADATA,
        };

        setResume(createdResume);
        setResumes((prev) => [createdResume, ...prev]);

        // Auto-fill if requested and profile is available
        if (autoFill && userProfile) {
          await autoFillFromProfile(userProfile);
        }

        return createdResume;
      } catch (err) {
        const errorMessage = err instanceof ResumeError ? err.message : 'Failed to create resume';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [supabase, userProfile]
  );

  // Load a resume by ID
  const loadResume = useCallback(
    async (id: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('resumes')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) {
          throw new ResumeError('Failed to load resume', ResumeErrorCode.LOAD_FAILED, fetchError);
        }

        if (!data) {
          throw new ResumeError('Resume not found', ResumeErrorCode.NOT_FOUND);
        }

        const loadedResume: Resume = {
          ...data,
          sections: (data.sections as ResumeSection[]) || [],
          styling: (data.styling as ResumeStyling) || DEFAULT_STYLING,
          metadata: (data.metadata as ResumeMetadata) || DEFAULT_METADATA,
        };

        setResume(loadedResume);
      } catch (err) {
        const errorMessage = err instanceof ResumeError ? err.message : 'Failed to load resume';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // Save the current resume
  const saveResume = useCallback(async (): Promise<void> => {
    if (!resume) return;

    try {
      setSaving(true);
      setSaveStatus('saving');
      setError(null);

      // Update metadata before saving
      const updatedResume = updateResumeMetadata(resume);
      setResume(updatedResume);

      // Save to local storage first (offline fallback)
      saveToLocalStorage(updatedResume);

      const updateData: ResumeUpdate = {
        title: updatedResume.title,
        template_id: updatedResume.template_id,
        sections: updatedResume.sections as unknown,
        styling: updatedResume.styling as unknown,
        metadata: updatedResume.metadata as unknown,
      };

      const { error: updateError } = await supabase
        .from('resumes')
        .update(updateData)
        .eq('id', updatedResume.id);

      if (updateError) {
        throw new ResumeError('Failed to save resume', ResumeErrorCode.SAVE_FAILED, updateError);
      }

      // Remove from local storage after successful save
      removeFromLocalStorage(updatedResume.id);

      setSaveStatus('saved');
      setAnnouncement('Resume saved successfully');

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);

      // Update resumes list
      setResumes((prev) =>
        prev.map((r) => (r.id === updatedResume.id ? { ...updatedResume, updated_at: new Date().toISOString() } : r))
      );
    } catch (err) {
      const errorMessage = err instanceof ResumeError ? err.message : 'Failed to save resume';
      setError(errorMessage);
      setSaveStatus('error');
      
      // Keep in local storage if save failed
      if (resume) {
        saveToLocalStorage(resume);
      }
      
      throw err;
    } finally {
      setSaving(false);
    }
  }, [resume, supabase]);

  // Delete a resume
  const deleteResume = useCallback(
    async (id: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const { error: deleteError } = await supabase.from('resumes').delete().eq('id', id);

        if (deleteError) {
          throw new ResumeError('Failed to delete resume', ResumeErrorCode.SAVE_FAILED, deleteError);
        }

        setResumes((prev) => prev.filter((r) => r.id !== id));

        if (resume?.id === id) {
          setResume(null);
        }
      } catch (err) {
        const errorMessage = err instanceof ResumeError ? err.message : 'Failed to delete resume';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [resume, supabase]
  );

  // Duplicate a resume
  const duplicateResume = useCallback(
    async (id: string, newTitle?: string): Promise<Resume> => {
      try {
        setLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new ResumeError('User not authenticated', ResumeErrorCode.UNAUTHORIZED);
        }

        // Find the resume to duplicate
        const originalResume = resumes.find((r) => r.id === id);
        if (!originalResume) {
          throw new ResumeError('Resume not found', ResumeErrorCode.NOT_FOUND);
        }

        const duplicateData: ResumeInsert = {
          user_id: user.id,
          title: newTitle || `${originalResume.title} (Copy)`,
          template_id: originalResume.template_id,
          sections: originalResume.sections as unknown,
          styling: originalResume.styling as unknown,
          metadata: { ...originalResume.metadata, export_count: 0, last_exported: undefined } as unknown,
        };

        const { data, error: insertError } = await supabase
          .from('resumes')
          .insert(duplicateData)
          .select()
          .single();

        if (insertError) {
          throw new ResumeError('Failed to duplicate resume', ResumeErrorCode.SAVE_FAILED, insertError);
        }

        const duplicatedResume: Resume = {
          ...data,
          sections: originalResume.sections,
          styling: originalResume.styling,
          metadata: { ...originalResume.metadata, export_count: 0, last_exported: undefined },
        };

        setResumes((prev) => [duplicatedResume, ...prev]);

        return duplicatedResume;
      } catch (err) {
        const errorMessage = err instanceof ResumeError ? err.message : 'Failed to duplicate resume';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [resumes, supabase]
  );

  // Update resume title with optimistic update
  const updateResumeTitle = useCallback((title: string) => {
    setResume((prev) => {
      if (!prev) return null;
      
      // Store previous state for potential rollback
      optimisticStateRef.current = prev;
      
      // Apply optimistic update immediately
      return { ...prev, title };
    });
  }, []);

  // Add a section with optimistic update
  const addSection = useCallback((type: SectionType) => {
    setResume((prev) => {
      if (!prev) return null;

      // Store previous state for potential rollback
      optimisticStateRef.current = prev;

      const newSection = createDefaultSection(type, prev.sections.length);
      const sectionInfo = SECTION_TYPES[type];
      setAnnouncement(`${sectionInfo.defaultTitle} section added`);
      setLastAddedSectionId(newSection.id);
      
      // Clear the lastAddedSectionId after a short delay
      setTimeout(() => setLastAddedSectionId(null), 500);
      
      // Apply optimistic update immediately
      return {
        ...prev,
        sections: [...prev.sections, newSection],
      };
    });
  }, []);

  // Remove a section with optimistic update
  const removeSection = useCallback((sectionId: string) => {
    setResume((prev) => {
      if (!prev) return null;

      // Store previous state for potential rollback
      optimisticStateRef.current = prev;

      const sectionToRemove = prev.sections.find((s) => s.id === sectionId);
      if (sectionToRemove) {
        setAnnouncement(`${sectionToRemove.title} section removed`);
      }

      const filteredSections = prev.sections.filter((s) => s.id !== sectionId);
      // Reorder remaining sections
      const reorderedSections = filteredSections.map((s, index) => ({ ...s, order: index }));

      // Apply optimistic update immediately
      return {
        ...prev,
        sections: reorderedSections,
      };
    });
  }, []);

  // Reorder sections with optimistic update
  const reorderSections = useCallback((sections: ResumeSection[]) => {
    setResume((prev) => {
      if (!prev) return null;

      // Store previous state for potential rollback
      optimisticStateRef.current = prev;

      // Update order property
      const reorderedSections = sections.map((s, index) => ({ ...s, order: index }));
      setAnnouncement('Section order updated');

      // Apply optimistic update immediately
      return {
        ...prev,
        sections: reorderedSections,
      };
    });
  }, []);

  // Update section content with optimistic update
  const updateSection = useCallback((sectionId: string, content: Partial<SectionContent>) => {
    setResume((prev) => {
      if (!prev) return null;

      // Store previous state for potential rollback
      optimisticStateRef.current = prev;

      // Apply optimistic update immediately
      return {
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === sectionId ? { ...s, content: { ...s.content, ...content } as SectionContent } : s
        ),
      };
    });
  }, []);

  // Toggle section visibility
  const toggleSectionVisibility = useCallback((sectionId: string) => {
    setResume((prev) => {
      if (!prev) return null;

      const section = prev.sections.find((s) => s.id === sectionId);
      if (section) {
        setAnnouncement(`${section.title} section ${section.visible ? 'hidden' : 'shown'}`);
      }

      return {
        ...prev,
        sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, visible: !s.visible } : s)),
      };
    });
  }, []);

  // Update styling with optimistic update
  const updateStyling = useCallback((styling: Partial<ResumeStyling>) => {
    setResume((prev) => {
      if (!prev) return null;

      // Store previous state for potential rollback
      optimisticStateRef.current = prev;

      // Apply optimistic update immediately
      return {
        ...prev,
        styling: { ...prev.styling, ...styling },
      };
    });
  }, []);

  // Apply template with optimistic update
  const applyTemplate = useCallback((templateId: string) => {
    setResume((prev) => {
      if (!prev) return null;

      // Store previous state for potential rollback
      optimisticStateRef.current = prev;

      // Apply optimistic update immediately
      return {
        ...prev,
        template_id: templateId,
      };
    });
  }, []);

  // Update metadata
  const updateMetadata = useCallback((metadata: Partial<ResumeMetadata>) => {
    setResume((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        metadata: { ...prev.metadata, ...metadata },
      };
    });
  }, []);

  // Auto-fill from profile
  const autoFillFromProfile = useCallback(
    async (profile: Profile): Promise<void> => {
      if (!resume) return;

      try {
        setError(null);

        // Find personal info section
        const personalInfoSection = resume.sections.find((s) => s.type === 'personal_info');
        if (!personalInfoSection) return;

        // Get user email from auth
        const { data: { user } } = await supabase.auth.getUser();
        const email = user?.email || '';

        // Map profile data to personal info
        const updatedPersonalInfo = {
          full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
          email: email,
          phone: profile.phone || '',
          location: profile.location || '',
          linkedin: profile.linkedin_url || '',
          github: profile.github_url || '',
          website: profile.twitter_url || '',
          summary: profile.bio || '',
        };

        updateSection(personalInfoSection.id, updatedPersonalInfo);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to auto-fill from profile';
        setError(errorMessage);
      }
    },
    [resume, updateSection, supabase]
  );

  // Import from JSON
  const importFromJSON = useCallback(
    async (jsonString: string): Promise<ImportResult> => {
      try {
        setLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new ResumeError('User not authenticated', ResumeErrorCode.UNAUTHORIZED);
        }

        // Import and validate data
        const result = await ResumeImportService.importFromJSON(jsonString, user.id);

        if (!result.success || !result.resume) {
          return result;
        }

        // Create new resume with imported data
        const importedResume: ResumeInsert = {
          user_id: user.id,
          title: result.resume.title || 'Imported Resume',
          template_id: result.resume.template_id || 'modern',
          sections: result.resume.sections as unknown,
          styling: result.resume.styling as unknown,
          metadata: result.resume.metadata as unknown,
        };

        const { data, error: insertError } = await supabase
          .from('resumes')
          .insert(importedResume)
          .select()
          .single();

        if (insertError) {
          throw new ResumeError('Failed to save imported resume', ResumeErrorCode.SAVE_FAILED, insertError);
        }

        const createdResume: Resume = {
          ...data,
          sections: result.resume.sections || [],
          styling: result.resume.styling || DEFAULT_STYLING,
          metadata: result.resume.metadata || DEFAULT_METADATA,
        };

        setResume(createdResume);
        setResumes((prev) => [createdResume, ...prev]);

        return result;
      } catch (err) {
        const errorMessage = err instanceof ResumeError ? err.message : 'Failed to import resume';
        setError(errorMessage);
        return {
          success: false,
          errors: [errorMessage],
          warnings: [],
          fieldsPopulated: 0,
        };
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // Calculate completeness score (simple version)
  const calculateScore = useCallback((): number => {
    return ResumeScoringService.calculateScore(resume).totalScore;
  }, [resume]);

  // Get detailed scoring result
  const getDetailedScore = useCallback((): ScoringResult => {
    return ResumeScoringService.calculateScore(resume);
  }, [resume]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
    setSaveStatus('idle');
  }, []);

  // Refresh resumes list
  const refreshResumes = useCallback(async (): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error: fetchError } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (fetchError) {
        throw new ResumeError('Failed to refresh resumes', ResumeErrorCode.LOAD_FAILED, fetchError);
      }

      const loadedResumes: Resume[] = (data || []).map((r) => ({
        ...r,
        sections: (r.sections as ResumeSection[]) || [],
        styling: (r.styling as ResumeStyling) || DEFAULT_STYLING,
        metadata: (r.metadata as ResumeMetadata) || DEFAULT_METADATA,
      }));

      setResumes(loadedResumes);
    } catch (err) {
      console.error('Failed to refresh resumes:', err);
    }
  }, [supabase]);

  // Enable/disable auto-save
  const setAutoSaveEnabled = useCallback((enabled: boolean) => {
    autoSaveEnabledRef.current = enabled;
    if (!enabled && saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  }, []);

  // Process save queue
  const processSaveQueue = useCallback(async () => {
    if (isSavingRef.current || saveQueueRef.current.length === 0) return;

    isSavingRef.current = true;
    
    // Get the latest resume from the queue (discard intermediate states)
    const latestResume = saveQueueRef.current[saveQueueRef.current.length - 1];
    saveQueueRef.current = [];

    try {
      setSaving(true);
      setSaveStatus('saving');
      setError(null);

      // Update metadata before saving
      const updatedResume = updateResumeMetadata(latestResume);

      // Save to local storage first (offline fallback)
      saveToLocalStorage(updatedResume);

      const updateData: ResumeUpdate = {
        title: updatedResume.title,
        template_id: updatedResume.template_id,
        sections: updatedResume.sections as unknown,
        styling: updatedResume.styling as unknown,
        metadata: updatedResume.metadata as unknown,
      };

      const { error: updateError } = await supabase
        .from('resumes')
        .update(updateData)
        .eq('id', updatedResume.id);

      if (updateError) {
        throw new ResumeError('Failed to save resume', ResumeErrorCode.SAVE_FAILED, updateError);
      }

      // Remove from local storage after successful save
      removeFromLocalStorage(updatedResume.id);

      setSaveStatus('saved');
      setAnnouncement('Resume saved successfully');
      lastSavedResumeRef.current = JSON.stringify(updatedResume);

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);

      // Update resumes list
      setResumes((prev) =>
        prev.map((r) => (r.id === updatedResume.id ? { ...updatedResume, updated_at: new Date().toISOString() } : r))
      );
    } catch (err) {
      const errorMessage = err instanceof ResumeError ? err.message : 'Failed to save resume';
      setError(errorMessage);
      setSaveStatus('error');
      
      // Rollback to previous state if available
      if (optimisticStateRef.current) {
        setResume(optimisticStateRef.current);
        setAnnouncement('Changes reverted due to save error');
      }
      
      // Keep in local storage if save failed
      if (latestResume) {
        saveToLocalStorage(latestResume);
      }
    } finally {
      setSaving(false);
      isSavingRef.current = false;
      
      // Process any new items that were added to the queue while saving
      if (saveQueueRef.current.length > 0) {
        processSaveQueue();
      }
    }
  }, [supabase]);

  // Debounced auto-save effect with save queue
  useEffect(() => {
    if (!resume || !autoSaveEnabledRef.current) return;

    // Create a snapshot of the current resume
    const currentSnapshot = JSON.stringify(resume);

    // Skip if nothing changed
    if (currentSnapshot === lastSavedResumeRef.current) return;

    // Add to save queue
    saveQueueRef.current.push(resume);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save (2 seconds)
    saveTimeoutRef.current = setTimeout(() => {
      processSaveQueue();
    }, 2000);

    // Cleanup on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [resume, processSaveQueue]);

  const contextValue: ResumeContextType = {
    resume,
    resumes,
    loading,
    saving,
    saveStatus,
    error,
    announcement,
    lastAddedSectionId,
    createResume,
    loadResume,
    saveResume,
    deleteResume,
    duplicateResume,
    updateResumeTitle,
    addSection,
    removeSection,
    reorderSections,
    updateSection,
    toggleSectionVisibility,
    updateStyling,
    applyTemplate,
    updateMetadata,
    autoFillFromProfile,
    importFromJSON,
    calculateScore,
    getDetailedScore,
    clearError,
    refreshResumes,
    setAutoSaveEnabled,
  };

  return <ResumeContext.Provider value={contextValue}>{children}</ResumeContext.Provider>;
}

// Custom hook to use the Resume Context
export function useResume() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}
