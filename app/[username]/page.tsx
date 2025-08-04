import { notFound } from 'next/navigation';
import { PublicProfileView } from "@/components/users/PublicProfileView";
import { reservedUsernameService } from '@/lib/services/reserved-usernames';
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

  // For now, treat all non-reserved usernames as profile routes
  // In the future, this could be expanded to handle other username-based routes
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