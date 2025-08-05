'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function SetupProfile() {
  const [username, setUsername] = useState('');
  const [codeuniaId, setCodeuniaId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/signin');
        return;
      }
      setUser(user);

      // Check user setup status using the new unified flow
      const { data: setupStatus } = await supabase
        .rpc('get_user_setup_status', { user_id: user.id });

      if (!setupStatus) {
        toast.error('Error loading user setup status');
        return;
      }

      // If setup is complete, redirect to dashboard
      if (setupStatus.can_proceed) {
        router.push('/protected/dashboard');
        return;
      }

      // If email confirmation is required, redirect to email confirmation page
      if (setupStatus.next_step === 'confirm_email') {
        router.push('/auth/email-confirmation-required');
        return;
      }

      // Get profile for Codeunia ID and current username
      const { data: profile } = await supabase
        .from('profiles')
        .select('codeunia_id, username, username_editable')
        .eq('id', user.id)
        .single();

      if (profile) {
        setCodeuniaId(profile.codeunia_id);
        
        // If user has a fallback username and can edit it, show it
        if (profile.username && profile.username_editable && profile.username.startsWith('user-')) {
          setUsername(profile.username);
          toast('You have a temporary username. You can change it once.');
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
      toast.error('Error loading profile setup');
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setIsCheckingUsername(true);
    try {
      const { data: isAvailable } = await supabase.rpc('check_username_availability', {
        username_param: username
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
      // Set username and mark profile as complete
      const { data: success, error } = await supabase.rpc('set_username', {
        user_id: user.id,
        new_username: username
      });

      if (error) {
        console.error('Username setting error:', error);
        toast.error(error.message || 'Failed to set username. Please try again.');
        return;
      }

      if (success) {
        toast.success('Profile setup complete! Welcome to Codeunia! 🎉');
        router.push('/protected/dashboard');
      } else {
        toast.error('Failed to set username. Please try again.');
      }
    } catch (error) {
      console.error('Error setting username:', error);
      toast.error('Error completing profile setup');
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomUsername = async () => {
    try {
      const { data: randomUsername } = await supabase.rpc('generate_safe_username');
      if (randomUsername) {
        setUsername(randomUsername);
        checkUsernameAvailability(randomUsername);
      }
    } catch (error) {
      console.error('Error generating username:', error);
      toast.error('Error generating username');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">CU</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            👋 Welcome to Codeunia!
          </h1>
          <p className="text-gray-600">
            Let&apos;s get you started by choosing a unique username. Your Codeunia ID will be generated automatically.
          </p>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Codeunia ID Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Codeunia ID
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={codeuniaId}
                readOnly
                className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-mono text-gray-600"
                placeholder="Generating..."
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(codeuniaId)}
                className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700"
              >
                📋
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This is your unique identifier in the Codeunia ecosystem
            </p>
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
                className={`w-full border rounded-md px-3 py-2 text-sm ${
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
            
            {/* Fallback Username Notice */}
            {username && username.startsWith('user-') && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs text-yellow-800">
                  <strong>⚠️ Temporary Username:</strong> You have a temporary username. 
                  You can change it once to something more personal.
                </p>
              </div>
            )}
            
            {/* Username Requirements */}
            <div className="mt-2 text-xs text-gray-500">
              <p>• 3-20 characters long</p>
              <p>• Letters, numbers, hyphens, and underscores only</p>
              <p>• Must be unique across all users</p>
              <p>• You can only change your username once</p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !username || !usernameAvailable}
            className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
              isLoading || !username || !usernameAvailable
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
                Setting up profile...
              </span>
            ) : (
              'Complete Setup & Continue'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to Codeunia&apos;s{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
} 