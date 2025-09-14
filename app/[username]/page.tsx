import { notFound } from 'next/navigation';
import { PublicProfileView } from "@/components/users/PublicProfileView";
import { reservedUsernameService } from '@/lib/services/reserved-usernames';
import { createClient } from '@/lib/supabase/server';
import Header from "@/components/header";
import Footer from "@/components/footer";

interface UsernamePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function UsernamePage({ params }: UsernamePageProps) {
  const { username } = await params;

  // Check if username is reserved
  try {
    const isReserved = await reservedUsernameService.isReservedUsername(username);
    if (isReserved) {
      notFound();
    }
  } catch {
    // Fallback to hardcoded check if database is not available
    if (reservedUsernameService.isFallbackReservedUsername(username)) {
      notFound();
    }
  }

  // Check if the username actually exists in the database
  try {
    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, username, is_public')
      .eq('username', username)
      .eq('is_public', true)
      .single();
    
    // If there's an error or no profile found, show 404
    if (error || !profile) {
      notFound();
    }
  } catch (error) {
    // If there's any error, show 404
    notFound();
  }

  // If we get here, the username exists and is public
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <main className="flex-1 w-full flex flex-col gap-8 p-6 max-w-6xl mx-auto pt-24">
          <PublicProfileView username={username} />
        </main>
      </div>
      <Footer />
    </>
  );
}

// Generate metadata for the page
export async function generateMetadata({ params }: UsernamePageProps) {
  const { username } = await params;

  try {
    const isReserved = await reservedUsernameService.isReservedUsername(username);
    if (isReserved) {
      return {
        title: 'Page Not Found',
        description: 'The requested page could not be found.'
      };
    }
  } catch {
    // Fallback to hardcoded check if database is not available
    if (reservedUsernameService.isFallbackReservedUsername(username)) {
      return {
        title: 'Page Not Found',
        description: 'The requested page could not be found.'
      };
    }
  }

  return {
    title: `${username} - Codeunia Profile`,
    description: `View ${username}'s profile on Codeunia - hackathons, contests, skills, and achievements.`,
    openGraph: {
      title: `${username} - Codeunia Profile`,
      description: `View ${username}'s profile on Codeunia - hackathons, contests, skills, and achievements.`,
      url: `https://codeunia.com/${username}`,
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title: `${username} - Codeunia Profile`,
      description: `View ${username}'s profile on Codeunia - hackathons, contests, skills, and achievements.`,
    }
  };
} 