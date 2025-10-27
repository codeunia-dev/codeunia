import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ResumeBuilderClient } from '@/components/resume/ResumeBuilderClient';
import { Resume, ResumeSection, ResumeStyling, ResumeMetadata } from '@/types/resume';
import { Profile } from '@/types/profile';

export default async function ResumeBuilderPage() {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/auth/signin');
  }
  
  // Fetch user's resumes
  const { data: resumesData } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });
  
  // Transform resumes data
  const resumes: Resume[] = (resumesData || []).map((r) => ({
    ...r,
    sections: (r.sections as ResumeSection[]) || [],
    styling: (r.styling as ResumeStyling) || {},
    metadata: (r.metadata as ResumeMetadata) || {},
  }));
  
  // Fetch user profile for auto-fill
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  const profile: Profile | null = profileData || null;
  
  return (
    <ResumeBuilderClient 
      initialResumes={resumes}
      userProfile={profile}
    />
  );
}
