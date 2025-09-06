// Imports
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, User, Mail, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client function to avoid build-time initialization
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
}

// MemberData interface
interface MemberData {
  memberId: string;
  name: string;
  email: string;
  joinDate: string;
  membershipStatus: 'active' | 'expired' | 'pending';
  memberType: 'student' | 'professional' | 'alumni';
  location?: string;
  avatar?: string;
}

// ✅ Fetch member by short ID
async function getMemberData(memberId: string): Promise<MemberData | null> {
  const suffix = memberId.replace(/^CU-/, '').toLowerCase();

  const supabase = getSupabaseClient();
  // Fetch all (or paginated) and find match by ID suffix
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*');

  if (error || !profiles) {
    console.error('Supabase error:', error);
    return null;
  }

  const matched = profiles.find((p) => p.id.toLowerCase().endsWith(suffix));
  if (!matched) return null;

  return {
    memberId: `CU-${matched.id.slice(-4)}`,
    name: [matched.first_name, matched.last_name].filter(Boolean).join(' ') || 'Member',
    email: matched.email || '',
    joinDate: matched.created_at || new Date().toISOString(),
    membershipStatus: (matched.membership_status as 'active' | 'expired' | 'pending') || 'active',
    memberType: (matched.member_type as 'student' | 'professional' | 'alumni') || 'student',
    location: matched.location,
    avatar: matched.avatar_url
  };
}

export async function generateMetadata({ params }: { params: Promise<{ memberId: string }> }): Promise<Metadata> {
    const { memberId } = await params;
    const memberData = await getMemberData(memberId);
  
    if (!memberData) {
      return {
        title: 'Member Not Found | Codeunia',
        description: 'This QR code is invalid or the member does not exist.',
      };
    }
  
    return {
      title: `${memberData.name}'s Membership | Codeunia`,
      description: `Verify ${memberData.name}'s membership on Codeunia.`,
    };
  }
  

// ✅ Page handler
export default async function VerifyMemberPage({ params }: { params: Promise<{ memberId: string }> }) {
    const { memberId } = await params;
    const memberData = await getMemberData(memberId);
  
    if (!memberData) {
      notFound();
    }

  const joinDate = new Date(memberData.joinDate);
  const formattedJoinDate = joinDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Codeunia</h1>
          <p className="mt-2 text-sm text-gray-600">Member Verification</p>
        </div>

        <Card className="shadow-lg overflow-hidden bg-white">
  <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
    <div className="flex items-center justify-between">
      <CardTitle className="text-xl flex items-center gap-2">
        <User className="h-6 w-6" />
        Member Verification
      </CardTitle>
      {memberData.membershipStatus === 'active' ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
          Active
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertCircle className="h-3.5 w-3.5 mr-1" />
          {memberData.membershipStatus === 'pending' ? 'Pending' : 'Expired'}
        </span>
      )}
    </div>
  </CardHeader>

  <CardContent className="p-6 bg-white text-black">
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-3xl font-bold text-purple-600 mb-4 border-2 border-purple-200">
          {memberData.name.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-xl font-bold text-black">{memberData.name}</h2>
        <div className="flex items-center justify-center gap-2 text-gray-700 text-sm mt-1">
          <Mail className="h-4 w-4" />
          <span>{memberData.email}</span>
        </div>
        {memberData.location && (
          <div className="flex items-center justify-center gap-2 text-gray-700 text-sm mt-1">
            <MapPin className="h-4 w-4" />
            <span>{memberData.location}</span>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-700 flex items-center gap-1">
            <User className="h-4 w-4" />
            Member ID
          </span>
          <span className="font-mono font-medium text-black">{memberData.memberId}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-700 flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Member Since
          </span>
          <span className="text-black">{formattedJoinDate}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">Member Type</span>
          <span className="text-black capitalize">
            {memberData.memberType}
          </span>
        </div>
      </div>

      <div className="pt-4">
        <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Link href="/">
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  </CardContent>
</Card>


        <div className="mt-6 text-center text-xs text-gray-500">
          <p>This verification is powered by Codeunia</p>
          <p className="mt-1">© {new Date().getFullYear()} Codeunia. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}