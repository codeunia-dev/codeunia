'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UserDisplayProps {
  userId: string;
  showCodeuniaId?: boolean;
  className?: string;
}

interface UserData {
  username: string;
  codeunia_id: string;
  is_premium: boolean;
  premium_expires_at: string;
}

export default function UserDisplay({ userId, showCodeuniaId = false, className = '' }: UserDisplayProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchUserData = useCallback(async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, codeunia_id, is_premium, premium_expires_at')
        .eq('id', userId)
        .single();

      if (profile) {
        // Check if premium is still valid
        const isPremiumValid = profile.is_premium && profile.premium_expires_at && 
          new Date(profile.premium_expires_at) > new Date();

        setUserData({
          username: profile.username,
          codeunia_id: profile.codeunia_id,
          is_premium: isPremiumValid,
          premium_expires_at: profile.premium_expires_at,
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, supabase]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (isLoading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded h-4 w-24 ${className}`}></div>
    );
  }

  if (!userData) {
    return (
      <span className={`text-gray-500 ${className}`}>
        Unknown User
      </span>
    );
  }

  const isPremium = userData.is_premium;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Username */}
      <span
        className={`font-medium ${
          isPremium
            ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent'
            : 'text-foreground'
        }`}
      >
        {userData.username}
        {isPremium && <span className="ml-1">👑</span>}
      </span>

      {/* Codeunia ID */}
      {showCodeuniaId && (
        <>
          <span className="text-gray-400">•</span>
          <span
            className={`text-sm font-mono ${
              isPremium
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent'
                : 'text-muted-foreground'
            }`}
          >
            {userData.codeunia_id}
          </span>
        </>
      )}
    </div>
  );
} 