"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import QRCode from 'react-qr-code';
import { 
  Loader2, 
  Download, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  User,
  Calendar, 
  Mail, 
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMembershipCardEmail } from '@/hooks/useMembershipCardEmail';
import CodeuniaLogo from '@/components/codeunia-logo';
// Removed PdfLogo in favor of CodeuniaLogo

interface MembershipCardProps {
  uid: string;
}

interface UserData {
  name: string;
  email: string;
  joinDate: string;
  avatar: string;
  membershipStatus: 'active' | 'expired' | 'pending';
  memberType: 'student' | 'professional' | 'alumni' | 'premium';
}

const MembershipCard: React.FC<MembershipCardProps> = ({ uid }) => {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const { sendMembershipCard, isSending, emailSent } = useMembershipCardEmail();
  const cardRef = useRef<HTMLDivElement>(null);
  const pdfContentRef = useRef<HTMLDivElement>(null);
  
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copiedId, setCopiedId] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  // Get user's display name (use first/last name or fallback to username or email)
  const getDisplayName = useCallback(() => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) return profile.first_name;
    if (profile?.username) return profile.username;
    return user?.email?.split('@')[0] || 'User';
  }, [profile?.first_name, profile?.last_name, profile?.username, user?.email]);
  

  // Use the dedicated codeunia_id from profile instead of UUID slice
  const memberId = profile?.codeunia_id ? profile.codeunia_id : `CU-${uid.slice(-4)}`;


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
        // Slightly larger than A4 (210x297mm)
        format: [220, 307]
      });
      
      const imgWidth = 220;
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
      if (user && profile) {
        const name = getDisplayName();
        const joinDate = profile.created_at || user.created_at || new Date().toISOString();
        
        // Check if user has premium status
        const isPremium = profile.is_premium && profile.premium_expires_at && 
          new Date(profile.premium_expires_at) > new Date();
        
        setUserData({
          name,
          email: user.email || 'member@codeunia.com',
          joinDate,
          avatar: name.charAt(0).toUpperCase(),
          membershipStatus: 'active',
          memberType: isPremium ? 'premium' : 'student'
        });
      }
      setIsLoading(false);
    };

    initializeUserData();
  }, [user, profile, getDisplayName]);

  // Loading state
  if (loading || isLoading) {
    return (
      <div className="flex flex-col items-center p-4 sm:p-8">
        <div className="w-full max-w-[500px] h-[300px] bg-gray-100 rounded-3xl flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <p className="text-gray-600 font-medium">Loading membership card...</p>
          </div>
        </div>
      </div>
    );
  }

  // Full membership card - now shown to all authenticated users
  return (
    <>
      {/* Hidden PDF Content - Only visible when generating PDF */}
      <div 
        ref={pdfContentRef} 
        className="fixed -left-[9999px] top-0 bg-white flex flex-col items-center"
        style={{ width: '220mm', minHeight: '307mm', padding: '10mm' }}
      >
        {/* PDF Header */}
      <div className="text-center mb-6 max-w-4xl pt-2">
        <div className="flex flex-col items-center justify-center gap-2 mb-2">
         <CodeuniaLogo size="lg" showText={false} noLink className="" />
         <h1 className="text-3xl font-bold text-purple-600">Codeunia</h1>
        </div>
        <p className="text-lg text-blue-600 font-semibold">
         Empowering the Next Generation of Coders
        </p>
      </div>     

        {/* Thank You Section */}
        <div className="mb-8 text-center max-w-3xl">
          <h2 className="text-2xl font-bold text-blue-600 mb-2">THANK YOU</h2>
          <p className="text-sm text-yellow-600 font-semibold mb-4">FOR BEING A VALUED MEMBER</p>
          
          <p className="text-sm text-gray-700 mb-4">
            You are now an official Codeunia Member! Welcome to our global, student-led tech community focused on real-world collaboration, innovation, and learning.
          </p>
          
          <p className="text-sm text-gray-700 mb-6">
            This digital card serves as proof of your active membership and access to exclusive benefits.
          </p>
        </div>

        {/* Benefits Grid */}
       <div className="grid grid-cols-2 gap-6 mb-8 text-sm max-w-5xl">
          <div>
            <h3 className="font-bold text-blue-600 mb-2">Open Community Network</h3>
            <p className="text-gray-700 mb-4">
              Connect with students and professionals globally. Build teams, collaborate on projects, and develop lasting professional relationships across borders.
            </p>
            
            <h4 className="font-bold text-blue-600 mb-1">Real-World Project Experience</h4>
            <p className="text-gray-700 mb-4">
              Gain hands-on experience through live projects, open-source contributions, and startup collaborations. Turn learning into practical impact.
            </p>
            
            <h4 className="font-bold text-blue-600 mb-1">Learning Tracks & Tech Events</h4>
            <p className="text-gray-700">
              Access curated paths in AI, web development, and cybersecurity. Join workshops and bootcamps for all skill levels.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-blue-600 mb-2">Career Readiness Programs</h3>
            <p className="text-gray-700 mb-4">
              Get mock interviews, resume reviews, and job board access. Bridge the gap between your skills and industry opportunities.
            </p>
            
            <h4 className="font-bold text-blue-600 mb-1">Innovation Challenges & Hackathons</h4>
            <p className="text-gray-700 mb-4">
              Participate in global hackathons and challenges. Push your creativity and teamwork while earning recognition.
            </p>
            
            <h4 className="font-bold text-blue-600 mb-1">Recognition, Rewards & Growth Paths</h4>
            <p className="text-gray-700">
              Earn badges and leadership roles. Grow as a community ambassador or event lead.
            </p>
          </div>
        </div>


        
        {/* Membership Card in PDF (mirrors Visible Card) */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden w-full max-w-[500px] h-[300px]">
            {/* Left Section - Member Info */}
            <div className="flex-1 p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white">
              {/* Member Type Badge */}
              <div className="mb-4">
                <span className={`inline-block px-4 py-1 text-xs font-bold rounded-full border ${
                  userData?.memberType === 'premium'
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 border-yellow-300 shadow-md'
                    : 'bg-blue-100 text-blue-800 border-blue-200'
                }`}>
                  {userData?.memberType === 'premium' ? 'PREMIUM' : userData?.memberType?.toUpperCase() || 'STUDENT'} MEMBER
                </span>
              </div>

              {/* Organization Title */}
              <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  CODEUNIA
                </h1>
                <p className="text-xs text-gray-500 font-medium">ORGANIZATION</p>
              </div>

              {/* Member Name */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Member: <span className={`font-semibold ${
                    userData?.memberType === 'premium'
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent'
                      : 'text-blue-600'
                  }`}>{userData?.name}</span></span>
                </div>
              </div>

              {/* Member ID with Copy Function */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                  <span>Member ID: <span className={`font-mono font-bold ${
                    userData?.memberType === 'premium'
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent'
                      : 'text-blue-600'
                  }`}>{memberId}</span></span>
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
                  <div>Valued Codeunia Member from {userData ? getMembershipDuration(userData.joinDate) : '1 Year'}</div>
                </div>
              </div>

              {/* No QR code inside the card to mirror Visible Card */}
            </div>

            {/* Right Section - Purple Background with Logo */}
            <div className="w-32 sm:w-48 bg-gradient-to-br from-purple-600 to-purple-800 p-2 sm:p-4 text-white flex flex-col justify-between items-center">
              {/* Logo */}
              <div className="flex flex-col items-center">
                <CodeuniaLogo size="md" showText={false} noLink className="mb-2" />
                <h2
                  className="text-sm sm:text-xl font-bold tracking-wide mt-1 text-[#007AFF]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Codeunia
                </h2>
                <p className="text-xs sm:text-sm text-purple-200 mt-1 whitespace-nowrap">Empowering Coders Globally</p>
              </div>

              {/* Footer */}
              <div className="text-center">
                <div className="text-xs text-purple-200">Powered by Codeunia</div>
                <div className="text-xs text-purple-300 flex items-center justify-center gap-1 mt-1">
                  <Mail className="h-3 w-3" />
                  <span className="hidden sm:inline">connect@codeunia.com</span>
                  <span className="sm:hidden">@codeunia.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR code placed at the bottom-right corner for PDF */}
        <div
          style={{ position: 'absolute', bottom: '10mm', right: '10mm' }}
          className="flex flex-col items-center gap-1"
        >
          <div className="bg-white p-1 border border-gray-200 rounded">
            <QRCode
              value={`${process.env.NEXT_PUBLIC_APP_URL || 'https://www.codeunia.com'}/verify/${memberId}`}
              size={64}
              level="H"
              fgColor="#4f46e5"
              bgColor="#ffffff"
            />
          </div>
          <div className="text-xs text-gray-500">Scan to verify membership</div>
        </div>
      </div>

      {/* Visible Card for Display */}
      <div className="flex flex-col items-center p-4 sm:p-8">
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
            className="flex bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden w-full max-w-[500px] h-[300px]"
          >
            {/* Left Section - Member Info */}
            <div className="flex-1 p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white">
              {/* Member Type Badge */}
              <div className="mb-4">
                <span className={`inline-block px-4 py-1 text-xs font-bold rounded-full border ${
                  userData?.memberType === 'premium'
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 border-yellow-300 shadow-md'
                    : 'bg-blue-100 text-blue-800 border-blue-200'
                }`}>
                  {userData?.memberType === 'premium' ? 'PREMIUM' : userData?.memberType?.toUpperCase() || 'STUDENT'} MEMBER
                </span>
              </div>

              {/* Organization Title */}
              <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  CODEUNIA
                </h1>
                <p className="text-xs text-gray-500 font-medium">ORGANIZATION</p>
              </div>

              {/* Member Name */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Member: <span className={`font-semibold ${
                    userData?.memberType === 'premium'
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent'
                      : 'text-blue-600'
                  }`}>{userData?.name}</span></span>
                </div>
              </div>

              {/* Member ID with Copy Function */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                  <span>Member ID: <span className={`font-mono font-bold ${
                    userData?.memberType === 'premium'
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent'
                      : 'text-blue-600'
                  }`}>{memberId}</span></span>
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
                  <div>Valued Codeunia Member from {userData ? getMembershipDuration(userData.joinDate) : '1 Year'}</div>
                  {/* <div className="font-semibold">Valid through 31 December {new Date().getFullYear()}</div> */}
                </div>
              </div>
            </div>
{/* Right Section - Purple Background with Logo */}
<div className="w-32 sm:w-48 bg-gradient-to-br from-purple-600 to-purple-800 p-2 sm:p-4 text-white flex flex-col justify-between items-center">
  
  {/* Logo */}
  <div className="flex flex-col items-center">
    <CodeuniaLogo size="md" showText={false} className="mb-2" />
    <h2
      className="text-sm sm:text-xl font-bold tracking-wide mt-1 text-[#007AFF]"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      Codeunia
    </h2>
    <p className="text-xs sm:text-sm text-purple-200 mt-1 whitespace-nowrap">Empowering Coders Globally</p>
  </div>

  {/* Footer */}
  <div className="text-center">
    <div className="text-xs text-purple-200">Powered by Codeunia</div>
    <div className="text-xs text-purple-300 flex items-center justify-center gap-1 mt-1">
      <Mail className="h-3 w-3" />
      <span className="hidden sm:inline">connect@codeunia.com</span>
      <span className="sm:hidden">@codeunia.com</span>
    </div>
  </div>
</div>
</div>
</div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
          {/* Email Card Button */}
          <Button
            onClick={() => sendMembershipCard(true)}
            disabled={isSending}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2">
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : emailSent ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {isSending ? 'Sending...' : emailSent ? 'Resend Email' : 'Email Card'}
            </div>
          </Button>

          {/* Download PDF Button */}
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
