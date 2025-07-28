import React from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, User, MapPin, Briefcase } from 'lucide-react';

export default function ProfileView() {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center">Profile not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {profile.display_name || `${profile.first_name} ${profile.last_name}`}
          </CardTitle>
          <CardDescription>Your public profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {profile.location || 'Location not set'}
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            {profile.current_position || 'Position not set'} at {profile.company || 'Company not set'}
          </div>
          <div>
            <h2 className="text-lg font-medium">Bio</h2>
            <p>{profile.bio || 'No bio available.'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
