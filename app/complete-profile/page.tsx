'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    given_name?: string;
    family_name?: string;
    name?: string;
  };
}

export default function CompleteProfile() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const router = useRouter();
  
  const getSupabaseClient = () => {
    return createClient();
  };

  const checkUser = useCallback(async () => {
    try {
      const { data: { user } } = await getSupabaseClient().auth.getUser();
      if (!user) {
        router.push('/auth/signin');
        return;
      }
      setUser(user);

      // Check if profile already exists and is complete
      const { data: profile } = await getSupabaseClient()
        .from('profiles')
        .select('first_name, last_name, username, profile_complete')
        .eq('id', user.id)
        .single();

      if (profile) {
        const isProfileComplete = profile.first_name && 
                                profile.last_name && 
                                profile.username && 
                                profile.profile_complete;
        
        if (isProfileComplete) {
          // Profile is already complete, redirect to dashboard
          router.push('/protected/dashboard');
          return;
        }
        
        // Pre-fill existing data
        if (profile.first_name) setFirstName(profile.first_name);
        if (profile.last_name) setLastName(profile.last_name);
        if (profile.username) setUsername(profile.username);
      }

      // Pre-fill from OAuth provider data if available
      if (user.user_metadata) {
        const metadata = user.user_metadata;
        if (!firstName && (metadata.first_name || metadata.given_name)) {
          setFirstName(metadata.first_name || metadata.given_name || '');
        }
        if (!lastName && (metadata.last_name || metadata.family_name)) {
          setLastName(metadata.last_name || metadata.family_name || '');
        }
      }

    } catch (error) {
      console.error('Error checking user:', error);
      toast.error('Error loading profile data');
    } finally {
      setIsValidating(false);
    }
  }, [router, firstName, lastName]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setIsCheckingUsername(true);
    try {
      const { data: isAvailable } = await getSupabaseClient().rpc('check_username_availability', {
        username_param: usernameToCheck
      });
      setUsernameAvailable(isAvailable);
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(false);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    // Debounce username check
    const timeoutId = setTimeout(() => {
      checkUsernameAvailability(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('User not found. Please sign in again.');
      return;
    }
    
    // Validate required fields
    if (!firstName.trim()) {
      toast.error('First name is required');
      return;
    }
    
    if (!lastName.trim()) {
      toast.error('Last name is required');
      return;
    }
    
    if (!username || username.length < 3) {
      toast.error('Username must be at least 3 characters long');
      return;
    }

    if (!usernameAvailable) {
      toast.error('Username is not available');
      return;
    }

    setIsLoading(true);
    try {
      // Update profile with the provided information
      const { error } = await getSupabaseClient()
        .from('profiles')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          username: username.trim(),
          profile_complete: true,
          username_set: true,
          username_editable: false
        })
        .eq('id', user.id);

      if (error) {
        console.error('Profile update error:', error);
        toast.error(error.message || 'Failed to update profile. Please try again.');
        return;
      }

      toast.success('Profile completed successfully! Welcome to CodeUnia! 🎉');
      router.push('/protected/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error completing profile setup');
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomUsername = async () => {
    try {
      const { data: randomUsername } = await getSupabaseClient().rpc('generate_safe_username');
      if (randomUsername) {
        setUsername(randomUsername);
        checkUsernameAvailability(randomUsername);
      }
    } catch (error) {
      console.error('Error generating username:', error);
      toast.error('Error generating username');
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-muted/50">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"></div>
        </div>
        <span className="ml-4 text-lg text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">CU</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome! Let&apos;s set up your CodeUnia profile.
          </h1>
          <p className="text-gray-600">
            Complete your profile to get started with CodeUnia. This will only take a moment.
          </p>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your first name"
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your last name"
              required
            />
          </div>

          {/* Username Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Your Username *
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  usernameAvailable === true
                    ? 'border-green-300 bg-green-50'
                    : usernameAvailable === false
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                }`}
                placeholder="Enter your username"
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_-]+"
                title="Username can only contain letters, numbers, hyphens, and underscores"
                required
              />
              <button
                type="button"
                onClick={generateRandomUsername}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-600 hover:text-blue-700"
                title="Generate random username"
              >
                🎲
              </button>
            </div>
            
            {/* Username Status */}
            {isCheckingUsername && (
              <p className="text-xs text-gray-500 mt-1">Checking availability...</p>
            )}
            {usernameAvailable === true && (
              <p className="text-xs text-green-600 mt-1">✅ Username is available!</p>
            )}
            {usernameAvailable === false && (
              <p className="text-xs text-red-600 mt-1">❌ Username is already taken</p>
            )}
            
            {/* Username Requirements */}
            <div className="mt-2 text-xs text-gray-500">
              <p>• 3-20 characters long</p>
              <p>• Letters, numbers, hyphens, and underscores only</p>
              <p>• Must be unique across all users</p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !firstName.trim() || !lastName.trim() || !username || !usernameAvailable}
            className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
              isLoading || !firstName.trim() || !lastName.trim() || !username || !usernameAvailable
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Completing profile...
              </span>
            ) : (
              'Complete Profile & Continue'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to CodeUnia&apos;s{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
