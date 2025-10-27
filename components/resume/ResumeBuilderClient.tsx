'use client';

import { ResumeProvider } from '@/contexts/ResumeContext';
import { ResumeBuilderLayout } from './ResumeBuilderLayout';
import { Resume } from '@/types/resume';
import { Profile } from '@/types/profile';

interface ResumeBuilderClientProps {
  initialResumes: Resume[];
  userProfile: Profile | null;
}

export function ResumeBuilderClient({ 
  initialResumes, 
  userProfile 
}: ResumeBuilderClientProps) {
  return (
    <ResumeProvider 
      initialResumes={initialResumes}
      userProfile={userProfile}
    >
      <ResumeBuilderLayout />
    </ResumeProvider>
  );
}
