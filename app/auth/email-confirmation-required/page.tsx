'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';

export default function EmailConfirmationRequired() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  const checkUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/signin');
        return;
      }
      setUser(user);

      // Check if email is now confirmed
      const { data: setupStatus } = await supabase
        .rpc('get_user_setup_status', { user_id: user.id });

      if (setupStatus && setupStatus.email_confirmed) {
        // Email is confirmed, redirect to setup
        router.push('/setup');
        return;
      }
    } catch (error) {
      console.error('Error checking user:', error);
      toast.error('Error loading user information');
    }
  }, [router, supabase]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (!user?.email) {
      toast.error('No email address found');
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) {
        throw error;
      }

      toast.success('Confirmation email sent! Please check your inbox.');
      setCountdown(60); // 60 second cooldown
    } catch (error) {
      console.error('Error resending email:', error);
      toast.error('Failed to resend confirmation email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth/signin');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">📧</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Email Confirmation Required
          </h1>
          <p className="text-gray-600">
            Please confirm your email address to continue with your Codeunia setup.
          </p>
        </div>

        {/* Email Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Confirmation Email Sent</CardTitle>
            <CardDescription>
              We&apos;ve sent a confirmation email to:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-mono text-gray-700 break-all">
                {user?.email || 'Loading...'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Next Steps:</h3>
          <ol className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">1</span>
              Check your email inbox (and spam folder)
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">2</span>
              Click the confirmation link in the email
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">3</span>
              Return here to complete your setup
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={checkUser}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
          >
            I&apos;ve Confirmed My Email
          </Button>

          <Button
            onClick={handleResendEmail}
            disabled={isResending || countdown > 0}
            variant="outline"
            className="w-full"
          >
            {isResending ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              'Resend Confirmation Email'
            )}
          </Button>

          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full text-gray-500 hover:text-gray-700"
          >
            Sign Out
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Having trouble? Contact{' '}
            <a href="mailto:support@codeunia.com" className="text-blue-600 hover:underline">
              support@codeunia.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 