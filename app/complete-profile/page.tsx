'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import CodeuniaLogo from '@/components/codeunia-logo';
import { InputValidator } from '@/lib/security/input-validation';
import { CheckCircle, XCircle, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { profileService } from '@/lib/services/profile';

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

function CompleteProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/protected/dashboard';
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const usernameCheckTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  
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

      // Check if profile already exists and is complete using profileService
      try {
        const profile = await profileService.getProfile(user.id);
        
        if (profile) {
          const isProfileComplete = profile.first_name && 
                                  profile.last_name && 
                                  profile.username && 
                                  profile.profile_complete;
          
          if (isProfileComplete) {
            // Profile is already complete, redirect to dashboard
            router.push(returnUrl);
            return;
          }
          
          // Pre-fill existing data
          if (profile.first_name) setFirstName(profile.first_name);
          if (profile.last_name) setLastName(profile.last_name);
          if (profile.username) setUsername(profile.username);
        } else {
          // Profile is null, which means there was an error but we can continue
          console.log('Profile not found, continuing with form setup');
        }
      } catch (profileError) {
        console.error('Error checking profile:', profileError);
        // Show a more user-friendly error message
        toast.error('Unable to load profile data. Please refresh the page and try again.');
        // Continue with the form - profileService will handle creation if needed
      }

      // Pre-fill from OAuth provider data if available (prioritize OAuth data over existing profile data)
      if (user.user_metadata) {
        const metadata = user.user_metadata;
        
        // Extract first name from various OAuth provider formats
        const oauthFirstName = metadata.first_name || 
                              metadata.given_name || 
                              metadata.name?.split(' ')[0] || 
                              '';
        
        // Extract last name from various OAuth provider formats
        const oauthLastName = metadata.last_name || 
                             metadata.family_name || 
                             metadata.name?.split(' ').slice(1).join(' ') || 
                             '';
        
        // Use OAuth data if available, otherwise keep existing profile data
        if (oauthFirstName) {
          setFirstName(oauthFirstName);
        }
        if (oauthLastName) {
          setLastName(oauthLastName);
        }
        
        
        console.log('OAuth provider data:', {
          provider: metadata.provider || 'unknown',
          firstName: oauthFirstName,
          lastName: oauthLastName,
          fullName: metadata.name,
          metadata: metadata
        });
      }

    } catch (error) {
      console.error('Error checking user:', error);
      toast.error('Error loading profile data');
    } finally {
      setIsValidating(false);
    }
  }, [router, returnUrl]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (usernameCheckTimeout.current) {
        clearTimeout(usernameCheckTimeout.current);
      }
    };
  }, []);

  const checkUsernameAvailability = async (usernameToCheck: string) => {
    const clean = usernameToCheck.trim();
    
    // First validate the username format
    const validation = InputValidator.validateUsername(clean);
    if (!validation.isValid) {
      setUsernameError(validation.error || 'Invalid username');
      setUsernameAvailable(false);
      return;
    }
    
    setUsernameError('');
    
    if (!clean || clean.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setIsCheckingUsername(true);
    try {
      // Use direct query instead of RPC function (same approach as UsernameField component)
      const { data, error } = await getSupabaseClient()
        .from('profiles')
        .select('username')
        .eq('username', clean)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // If no data found, username is available
      setUsernameAvailable(!data);
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(null);
      setUsernameError('Unable to check username availability');
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setUsernameError(''); // Clear previous errors
    if (usernameCheckTimeout.current) clearTimeout(usernameCheckTimeout.current);
    usernameCheckTimeout.current = setTimeout(() => {
      checkUsernameAvailability(value);
    }, 500);
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
      // First update the basic profile information using profileService
      const updatedProfile = await profileService.updateProfile(user.id, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim()
      });

      if (!updatedProfile) {
        console.error('Profile update failed: No data returned');
        toast.error('Failed to update profile. Please try again.');
        return;
      }

      // Then update the completion status fields directly
      const { error: completionError } = await getSupabaseClient()
        .from('profiles')
        .update({
          profile_complete: true,
          username_set: true,
          username_editable: false
        })
        .eq('id', user.id);

      if (completionError) {
        console.error('Error updating completion status:', completionError);
        toast.error('Profile updated but completion status failed. Please try again.');
        return;
      }

      toast.success('Profile completed successfully! Welcome to Codeunia! 🎉');
      router.push(returnUrl);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error completing profile setup');
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomUsername = async () => {
    try {
      // Generate a simple random username since RPC might not be available
      const adjectives = ['cool', 'smart', 'bright', 'quick', 'bold', 'wise', 'keen', 'sharp'];
      const nouns = ['coder', 'dev', 'builder', 'creator', 'maker', 'hacker', 'ninja', 'wizard'];
      const numbers = Math.floor(Math.random() * 9999);
      
      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const randomUsername = `${adjective}${noun}${numbers}`;
      
      setUsername(randomUsername);
      checkUsernameAvailability(randomUsername);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <CodeuniaLogo size="lg" showText={true} noLink={true} instanceId="complete-profile" />
          </div>
          <h1 className="text-2xl font-bold text-black font-medium mb-3">
            Welcome! Let&apos;s set up your profile
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Complete your profile to get started with Codeunia. This will only take a moment.
          </p>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* First Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              First Name *
            </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 text-black font-medium"
                  placeholder="Enter your first name"
                  required
                />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Last Name *
            </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 text-black font-medium"
                  placeholder="Enter your last name"
                  required
                />
          </div>

          {/* Username Input */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Choose Your Username *
            </label>
            <div className="relative">
              <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      className={`w-full border rounded-xl px-4 py-3 pr-20 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 text-black font-medium ${
                        usernameAvailable === true
                          ? 'border-green-300 bg-green-50'
                          : usernameAvailable === false || usernameError
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200'
                      }`}
                      placeholder="Enter your username"
                      minLength={3}
                      maxLength={30}
                      title="Username can only contain letters, numbers, hyphens, and underscores"
                      required
                    />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  {isCheckingUsername && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  )}
                  {!isCheckingUsername && usernameAvailable === true && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {!isCheckingUsername && (usernameAvailable === false || usernameError) && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <button
                    type="button"
                    onClick={generateRandomUsername}
                    className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                    title="Generate random username"
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
                  {/* Username Preview */}
                  {username && (
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Preview:</span>
                      <span className="text-sm font-mono bg-gray-200 text-gray-800 px-2 py-1 rounded-md border">
                        @{username.toLowerCase()}
                      </span>
                    </div>
                  )}
              
              {/* Username Status Messages */}
              {isCheckingUsername && (
                <div className="flex items-center space-x-2 mt-2">
                  <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                  <p className="text-xs text-blue-600">Checking availability...</p>
                </div>
              )}
              
                  {!isCheckingUsername && usernameAvailable === true && (
                    <div className="flex items-center space-x-2 mt-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <p className="text-sm font-medium text-green-700">Username is available!</p>
                    </div>
                  )}
              
                  {!isCheckingUsername && usernameAvailable === false && !usernameError && (
                    <div className="flex items-center space-x-2 mt-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <p className="text-sm font-medium text-red-700">Username is already taken</p>
                    </div>
                  )}
              
                  {usernameError && (
                    <div className="flex items-center space-x-2 mt-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <p className="text-sm font-medium text-red-700">{usernameError}</p>
                    </div>
                  )}
              
                  {/* Username Requirements */}
                  <div className="mt-3 p-4 bg-gray-100/80 rounded-lg border border-gray-200">
                    <p className="text-sm font-semibold text-gray-800 mb-3">Username Requirements:</p>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${username.length >= 3 && username.length <= 30 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="font-medium">3-30 characters long</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${/^[a-zA-Z0-9_-]+$/.test(username) || !username ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="font-medium">Letters, numbers, hyphens, and underscores only</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${usernameAvailable === true ? 'bg-green-500' : usernameAvailable === false ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                        <span className="font-medium">Must be unique across all users</span>
                      </li>
                    </ul>
                  </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !firstName.trim() || !lastName.trim() || !username || !usernameAvailable || !!usernameError}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
              isLoading || !firstName.trim() || !lastName.trim() || !username || !usernameAvailable || !!usernameError
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Completing profile...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete Profile & Continue
              </span>
            )}
          </button>
        </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-700 text-center leading-relaxed">
                By continuing, you agree to Codeunia&apos;s{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors font-medium">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors font-medium">Privacy Policy</Link>
              </p>
            </div>
      </div>
    </div>
  );
}

export default function CompleteProfile() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-muted/50">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"></div>
        </div>
        <span className="ml-4 text-lg text-muted-foreground">Loading...</span>
      </div>
    }>
      <CompleteProfileContent />
    </Suspense>
  );
}
