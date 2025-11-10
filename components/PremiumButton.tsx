'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { Crown, Star, Sparkles } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface PremiumButtonProps {
  user: User;
  className?: string;
  compact?: boolean;
}

export default function PremiumButton({ user, className = '', compact = false }: PremiumButtonProps) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const checkPremiumStatus = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium, premium_expires_at')
        .eq('id', user.id)
        .single();

      if (profile?.is_premium && profile?.premium_expires_at) {
        const expiresAt = new Date(profile.premium_expires_at);
        setIsPremium(expiresAt > new Date());
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    checkPremiumStatus();
  }, [checkPremiumStatus]);

  const handlePremiumClick = () => {
    if (isPremium) {
      toast.success('You are already a premium member! 🎉');
      return;
    }
  };

  if (isLoading) {
    return (
      <div className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse ${className}`}>
        <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
        Loading...
      </div>
    );
  }

  return (
    <>
      {isPremium ? (
        <button
          onClick={handlePremiumClick}
          className={`group relative inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-300 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transform overflow-hidden ${compact ? 'px-2.5 py-1 text-xs' : ''} ${className}`}
        >
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Sparkle effect */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
            <div className="absolute -top-1 -right-1 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute -bottom-1 -left-2 w-1.5 h-1.5 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping" style={{ animationDelay: '0.4s' }}></div>
          </div>
          
          <Crown className={`relative z-10 ${compact ? 'h-3.5 w-3.5 mr-1' : 'mr-1.5 h-4 w-4'}`} />
          <span className="relative z-10">Premium</span>
        </button>
      ) : (
        <Link href="/premium">
          <button
            className={`group relative inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-300 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 text-white hover:from-blue-600 hover:via-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-105 transform overflow-hidden ${compact ? 'px-2.5 py-1 text-xs' : ''} ${className}`}
          >
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-500 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
            
            <Star className={`relative z-10 ${compact ? 'h-3.5 w-3.5 mr-1' : 'mr-1.5 h-4 w-4'}`} />
            <span className="relative z-10">Premium</span>
            
            {/* Arrow indicator */}
            {!compact && (
              <Sparkles className="ml-1 h-3 w-3 relative z-10 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            )}
          </button>
        </Link>
      )}
    </>
  );
} 