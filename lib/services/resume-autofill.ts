import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/profile';
import { PersonalInfo } from '@/types/resume';

export class ResumeAutoFillService {
  /**
   * Fetch user profile and auth data for auto-filling resume
   */
  static async getUserDataForAutoFill(): Promise<{
    profile: Profile | null;
    email: string | null;
  }> {
    const supabase = createClient();

    try {
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Error fetching user:', authError);
        return { profile: null, email: null };
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return { profile: null, email: user.email || null };
      }

      return {
        profile: profile as Profile,
        email: user.email || null,
      };
    } catch (error) {
      console.error('Error in getUserDataForAutoFill:', error);
      return { profile: null, email: null };
    }
  }

  /**
   * Map profile data to resume personal info section
   */
  static mapProfileToPersonalInfo(
    profile: Profile | null,
    email: string | null
  ): Partial<PersonalInfo> {
    if (!profile && !email) {
      return {};
    }

    const personalInfo: Partial<PersonalInfo> = {};

    if (profile) {
      // Map name
      if (profile.first_name || profile.last_name) {
        personalInfo.full_name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      }

      // Map contact info
      if (profile.phone) {
        personalInfo.phone = profile.phone;
      }

      if (profile.location) {
        personalInfo.location = profile.location;
      }

      // Map social links
      if (profile.linkedin_url) {
        personalInfo.linkedin = profile.linkedin_url;
      }

      if (profile.github_url) {
        personalInfo.github = profile.github_url;
      }

      if (profile.twitter_url) {
        personalInfo.website = profile.twitter_url;
      }

      // Map bio to summary
      if (profile.bio) {
        personalInfo.summary = profile.bio;
      }
    }

    // Add email from auth
    if (email) {
      personalInfo.email = email;
    }

    return personalInfo;
  }

  /**
   * Auto-fill resume from user profile
   */
  static async autoFillResume(): Promise<Partial<PersonalInfo>> {
    const { profile, email } = await this.getUserDataForAutoFill();
    return this.mapProfileToPersonalInfo(profile, email);
  }
}
