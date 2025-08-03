'use client';

import { useTheme } from 'next-themes';
import { useFavicon } from '@/hooks/useFavicon';
import { useEffect, useState } from 'react';

export default function ThemeAwareFavicon() {
  const { theme, resolvedTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Only run favicon updates after mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Use the most appropriate theme for favicon
  // Priority: explicit theme > resolved theme > system theme
  // If theme is 'system', use resolvedTheme instead
  const currentTheme = mounted ? (theme === 'system' ? resolvedTheme : theme || resolvedTheme || systemTheme) : undefined;
  
  // Enable favicon updates
  useFavicon(currentTheme);

  return null; // This component doesn't render anything
} 