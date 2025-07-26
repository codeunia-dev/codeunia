"use client";

import React, { useRef, useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { 
  Loader2, 
  Download, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Calendar, 
  Mail, 
  Edit3,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CodeuniaLogo from '@/components/codeunia-logo';

interface MembershipCardProps {
  uid: string;
}

interface UserData {
  name: string;
  email: string;
  joinDate: string;
  avatar: string;
  membershipStatus: 'active' | 'expired' | 'pending';
  memberType: 'student' | 'professional' | 'alumni';
}

const MembershipCard: React.FC<MembershipCardProps> = ({ uid }) => {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const cardRef = useRef<HTMLDivElement>(null);
  const pdfContentRef = useRef<HTMLDivElement>(null);
  
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copiedId, setCopiedId] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  const hasCompletedProfile = profile && (() => {
    const requiredFields = [
      'first_name',
      'last_name',
      'display_name',
      'bio',
      'phone',
      'github_url',
      'linkedin_url',
      'twitter_url',
      'current_position',
      'company',
      'location',
      'skills'
    ] as const;
  
    return requiredFields.every((field) => {
      const value = profile[field];
      if (Array.isArray(value)) return value.length > 0;
      return Boolean(value);
    });
  })();
  

  // Calculate profile completion percentage
  const getProfileCompletionPercentage = () => {
    if (!profile) return 0;
  
    const requiredFields = [
      'first_name',
      'last_name',
      'display_name',
      'bio',
      'phone',
      'github_url',
      'linkedin_url',
      'twitter_url',
      'current_position',
      'company',
      'location',
      'skills'
    ] as const;
  
    const completedFields = requiredFields.filter((field) => {
      const value = profile[field];
      if (Array.isArray(value)) return value.length > 0;
      return Boolean(value);
    });
  
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };
  

  // Generate member ID from user data
  const memberId = `CU-${uid.slice(-4)}`;


  // Calculate membership duration
  const getMembershipDuration = (joinDate: string) => {
    const join = new Date(joinDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - join.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
  };

  // Copy member ID to clipboard
  const copyMemberId = async () => {
    try {
      await navigator.clipboard.writeText(memberId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (err) {
      console.error('Failed to copy member ID:', err);
    }
  };

  // Enhanced PDF generation with loading states
  const handleDownload = async () => {
    if (!pdfContentRef.current) return;
    
    setIsGeneratingPdf(true);
    setDownloadStatus('idle');
    
    try {
      const canvas = await html2canvas(pdfContentRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${memberId}-membership-card.pdf`);
      
      setDownloadStatus('success');
      setTimeout(() => setDownloadStatus('idle'), 3000);
    } catch (error) {
      console.error('PDF generation failed:', error);
      setDownloadStatus('error');
      setTimeout(() => setDownloadStatus('idle'), 5000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Initialize user data
  useEffect(() => {
    const initializeUserData = () => {
      if (user && profile && hasCompletedProfile) {
        const name = profile.first_name && profile.last_name 
          ? `${profile.first_name} ${profile.last_name}`
          : profile.display_name || user.email?.split('@')[0] || 'Member';
        
        const joinDate = profile.created_at || user.created_at || new Date().toISOString();
        
        setUserData({
          name,
          email: user.email || 'member@codeunia.com',
          joinDate,
          avatar: name.charAt(0).toUpperCase(),
          membershipStatus: 'active',
          memberType: 'student'
        });
      }
      setIsLoading(false);
    };

    initializeUserData();
  }, [user, profile, hasCompletedProfile]);

  // Loading state
  if (loading || isLoading) {
    return (
      <div className="flex flex-col items-center p-8">
        <div className="w-[500px] h-[300px] bg-gray-100 rounded-3xl flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <p className="text-gray-600 font-medium">Loading membership card...</p>
          </div>
        </div>
      </div>
    );
  }

  // Profile completion prompt for users without completed profiles
  if (!hasCompletedProfile) {
    return (
      <div className="flex flex-col items-center p-8">
        <div className="w-[500px] h-[370px] bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-2xl border border-gray-200 flex items-center justify-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
          
          <div className="text-center space-y-6 relative z-10">
            {/* Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
             <User className="h-10 w-10 text-white" />
           </div>


            
            {/* Title */}
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">Complete Your Profile</h3>
              <p className="text-gray-600 max-w-sm">
                To get your personalized membership card, please complete your profile with your name and details.
              </p>
            </div>
            
            {/* Progress indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Profile Completion</span>
                <span className="text-purple-600 font-semibold">{getProfileCompletionPercentage()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProfileCompletionPercentage()}%` }}
                ></div>
              </div>
            </div>
            
            {/* CTA Button */}
            <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <Link href="/protected/profile" className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Complete Profile
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            
            {/* Benefits preview */}
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-purple-500" />
                <span>Personalized Card</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-blue-500" />
                <span>Download PDF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full membership card for users with completed profiles
  return (
    <>
      {/* Hidden PDF Content - Only visible when generating PDF */}
      <div 
        ref={pdfContentRef} 
        className="fixed -left-[9999px] top-0 bg-white flex flex-col items-center"
        style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}
      >
        {/* PDF Header */}
        <div className="text-center mb-8 max-w-4xl">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mr-4">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <h1 className="text-4xl font-bold text-purple-600">CodeUnia</h1>
          </div>
          <p className="text-xl text-blue-600 font-semibold mb-2">CodeUnia members achieve great things</p>
        </div>

        {/* Thank You Section */}
        <div className="mb-8 text-center max-w-3xl">
          <h2 className="text-2xl font-bold text-blue-600 mb-2">THANK YOU</h2>
          <p className="text-sm text-yellow-600 font-semibold mb-4">FOR YOUR MEMBERSHIP</p>
          
          <p className="text-sm text-gray-700 mb-4">
            You are a valued member of the CodeUnia Community.
          </p>
          
          <p className="text-sm text-gray-700 mb-6">
            Below is a digital version of your membership card for easy access to your membership 
            information. You can also access this in your CodeUnia Profile or in the CodeUnia app anytime!
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8 text-sm max-w-5xl">
          <div>
            <h3 className="font-bold text-blue-600 mb-2">Local CodeUnia Community</h3>
            <p className="text-gray-700 mb-4">
              Get involved with colleagues at your local CodeUnia Community, 
              who can help connect you to professionals who can advance your goals.
            </p>
            
            <h4 className="font-bold text-blue-600 mb-1">Technical Publications</h4>
            <p className="text-gray-700 mb-4">
              Take advantage of discounts and access to cutting-edge journals, magazines, and 
              digital publications.
            </p>
            
            <h4 className="font-bold text-blue-600 mb-1">Professional Network</h4>
            <p className="text-gray-700">
              Build a professional network from the wealth of university expertise and connections 
              found within CodeUnia.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-blue-600 mb-2">Local CodeUnia Student Branch</h3>
            <p className="text-gray-700 mb-4">
              Join and enjoy exciting technical competitions, expert speakers, 
              professional networking, and colleagues for life.
            </p>
            
            <h4 className="font-bold text-blue-600 mb-1">Career Opportunities</h4>
            <p className="text-gray-700 mb-4">
              Drive your career goals forward with online learning, 
              job listings, a consultants network, and more!
            </p>
            
            <h4 className="font-bold text-blue-600 mb-1">Local Activities</h4>
            <p className="text-gray-700">
              Through your local CodeUnia community, events and conferences - 
              there are many ways to become involved.
            </p>
          </div>
        </div>

        {/* Membership Card in PDF */}
        <div className="flex justify-center mb-8">
  <div className="bg-white rounded-lg shadow-lg border border-gray-300" style={{ width: '420px', height: '280px' }}>
    <div className="flex h-full">
      {/* Left Section - Member Info */}
      <div className="flex-1 p-4 bg-gradient-to-br from-gray-50 to-white rounded-l-lg">
        {/* Student Member Badge */}
        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full border border-blue-200">
            {userData?.memberType?.toUpperCase() || 'STUDENT'} MEMBER
          </span>
        </div>

        {/* Organization Title */}
        <div className="mb-4">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            CODEUNIA
          </h1>
          <p className="text-xs text-gray-500 font-medium">ORGANIZATION</p>
        </div>

        {/* Member Name */}
        <div className="mb-3">
          <div className="text-sm text-gray-600">Member: 
            <span className="text-blue-600 font-semibold ml-1">{userData?.name}</span>
          </div>
        </div>

        {/* Member ID */}
        <div className="mb-3">
          <div className="text-sm text-gray-600">Member ID: 
            <span className="text-blue-600 font-mono font-bold">{memberId}</span>
          </div>
        </div>

        {/* Status and Year */}
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded border border-green-200">
            {userData?.membershipStatus === 'active' ? 'Active Member' : 'Inactive Member'}
          </span>
          <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded border border-yellow-200">
            {new Date().getFullYear()}
          </span>
        </div>

        {/* Validity Info */}
        <div className="text-[10px] text-gray-600 space-y-1">
          <div>Valued Codeunia Member for {userData ? getMembershipDuration(userData.joinDate) : '1 Year'}</div>
          <div className="font-semibold">Valid through 31 December {new Date().getFullYear()}</div>
        </div>
      </div>

      {/* Right Section - Purple Background with Logo */}
      <div className="w-36 bg-gradient-to-br from-purple-600 to-purple-800 p-4 flex flex-col items-center justify-center text-white relative rounded-r-lg">
        {/* Logo Circle */}
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-lg">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>

        {/* CodeUnia Text */}
        <div className="text-center mb-4">
          <h2 className="text-sm font-bold tracking-wide">CodeUnia</h2>
          <p className="text-xs text-purple-200 mt-1">Empowering Coders</p>
        </div>

        {/* Footer */}
        <div className="absolute bottom-3 left-2 right-2 text-center">
          <div className="text-xs text-purple-200 mb-1">Powered by Codeunia</div>
          <div className="text-xs text-purple-300">connect@codeunia.com</div>
        </div>
      </div>
    </div>
  </div>
</div>

        {/* Footer Info */}
        <div className="text-center text-xs text-gray-600 mt-8">
          <p className="mb-2">
            <span className="font-semibold">Make the Most of Your Membership.</span> Learn about these and all CodeUnia member benefits at{' '}
            <span className="text-blue-600 font-semibold">codeunia.com/benefits</span>
          </p>
        </div>
      </div>

      {/* Visible Card for Display */}
      <div className="flex flex-col items-center p-8">
        {/* Status Alerts */}
        {downloadStatus === 'success' && (
          <Alert className="mb-4 w-full max-w-md">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>Membership card downloaded successfully!</AlertDescription>
          </Alert>
        )}
        
        {downloadStatus === 'error' && (
          <Alert className="mb-4 w-full max-w-md" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to download membership card. Please try again.</AlertDescription>
          </Alert>
        )}

        {/* Main Card */}
        <div className="relative transform hover:scale-[1.02] transition-all duration-300 ease-out">
          <div
            ref={cardRef}
            className="flex bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden w-[500px] h-[300px]"
          >
            {/* Left Section - Member Info */}
            <div className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-white">
              {/* Member Type Badge */}
              <div className="mb-4">
                <span className="inline-block px-4 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full border border-blue-200">
                  {userData?.memberType?.toUpperCase() || 'STUDENT'} MEMBER
                </span>
              </div>

              {/* Organization Title */}
              <div className="mb-6">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  CODEUNIA
                </h1>
                <p className="text-xs text-gray-500 font-medium">ORGANIZATION</p>
              </div>

              {/* Member Name */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Member: <span className="text-blue-600 font-semibold">{userData?.name}</span></span>
                </div>
              </div>

              {/* Member ID with Copy Function */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                  <span>Member ID: <span className="text-blue-600 font-mono font-bold">{memberId}</span></span>
                  <button
                    onClick={copyMemberId}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copy Member ID"
                  >
                    {copiedId ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Status and Year */}
              <div className="flex items-center gap-4 mb-6">
                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-md border ${
                  userData?.membershipStatus === 'active' 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : 'bg-red-100 text-red-800 border-red-200'
                }`}>
                  {userData?.membershipStatus === 'active' ? 'Active Member' : 'Inactive Member'}
                </span>
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-md border border-yellow-200">
                  {new Date().getFullYear()}
                </span>
              </div>

              {/* Validity Info */}
              <div className="text-xs text-gray-600 mb-2 flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <div>
                  <div>Valued Codeunia Member for {userData ? getMembershipDuration(userData.joinDate) : '1 Year'}</div>
                  <div className="font-semibold">Valid through 31 December {new Date().getFullYear()}</div>
                </div>
              </div>
            </div>
{/* Right Section - Purple Background with Logo */}
<div className="w-48 bg-gradient-to-br from-purple-600 to-purple-800 p-4 text-white flex flex-col justify-between items-center">
  
  {/* Logo */}
  <div className="flex flex-col items-center">
    <CodeuniaLogo size={64} className="mb-2" />
    <h2 className="text-xl font-bold tracking-wide mt-1">CodeUnia</h2>
    <p className="text-sm text-purple-200 mt-1">Empowering Coders</p>
  </div>

  {/* Footer */}
  <div className="text-center">
    <div className="text-xs text-purple-200">Powered by Codeunia</div>
    <div className="text-xs text-purple-300 flex items-center justify-center gap-1 mt-1">
      <Mail className="h-3 w-3" />
      connect@codeunia.com
    </div>
  </div>
</div>
</div>
</div>

        {/* Download Button */}
        <div className="mt-8">
          <Button
            onClick={handleDownload}
            disabled={isGeneratingPdf}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2">
              {isGeneratingPdf ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Card'}
            </div>
          </Button>
        </div>
      </div>
    </>
  );
};

export default MembershipCard;
