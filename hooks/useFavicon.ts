import { useEffect } from 'react';

export function useFavicon(theme: string | undefined) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Add a small delay to avoid hydration conflicts
    const timeoutId = setTimeout(() => {
      const detectBrowserTheme = (): 'light' | 'dark' => {
        // Method 1: Check if dark class is applied to html element (most reliable)
        if (document.documentElement.classList.contains('dark')) {
          return 'dark';
        }
        
        // Method 2: Check body background color (fallback)
        const bodyStyle = window.getComputedStyle(document.body);
        const backgroundColor = bodyStyle.backgroundColor;
        
        // Check if background is dark (common dark mode colors)
        const darkColors = [
          'rgb(0, 0, 0)', 'rgba(0, 0, 0, 1)', 'black',
          'rgb(10, 10, 10)', 'rgb(20, 20, 20)', 'rgb(30, 30, 30)',
          'hsl(0, 0%, 0%)', 'hsl(0, 0%, 3.9%)', 'hsl(0, 0%, 5%)'
        ];
        
        if (darkColors.some(color => backgroundColor.includes(color))) {
          return 'dark';
        }
        
        // Method 3: Check if background is very dark (brightness calculation)
        const rgbMatch = backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (rgbMatch) {
          const r = parseInt(rgbMatch[1]);
          const g = parseInt(rgbMatch[2]);
          const b = parseInt(rgbMatch[3]);
          const brightness = (r + g + b) / 3;
          
          if (brightness < 50) {
            return 'dark';
          }
        }
        
        // Method 4: Fallback to system preference
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return systemDark ? 'dark' : 'light';
      };

      const updateFavicon = (currentTheme?: string) => {
        // If a specific theme is provided (not 'system'), use it directly
        let detectedTheme = currentTheme;
        
        if (detectedTheme && detectedTheme !== 'system') {
          // Use provided theme directly
        } else {
          // Detect theme with browser priority
          detectedTheme = detectBrowserTheme();
        }
        
        // Fallback to dark if still undefined
        if (!detectedTheme) {
          detectedTheme = 'dark';
        }
        
        const faviconPath = detectedTheme === 'dark' 
          ? '/codeunia-favicon-dark.svg' 
          : '/codeunia-favicon-light.svg';
        
        // Add cache-busting parameter
        const timestamp = Date.now();
        const faviconWithCacheBust = `${faviconPath}?v=${timestamp}`;
        
        try {
          // Safely remove all existing favicon links
          const existingLinks = document.querySelectorAll('link[rel*="icon"]');
          existingLinks.forEach(link => {
            try {
              if (link && link.parentNode && link.parentNode.contains(link)) {
                link.parentNode.removeChild(link);
              }
            } catch (error) {
              console.warn('Error removing favicon link:', error);
            }
          });
          
          // Create new favicon link
          const newLink = document.createElement('link');
          newLink.rel = 'icon';
          newLink.type = 'image/svg+xml';
          newLink.href = faviconWithCacheBust;
          
          // Add to head
          if (document.head) {
            document.head.appendChild(newLink);
          }
          
          // Also create shortcut icon
          const shortcutLink = document.createElement('link');
          shortcutLink.rel = 'shortcut icon';
          shortcutLink.href = faviconWithCacheBust;
          if (document.head) {
            document.head.appendChild(shortcutLink);
          }
          
          // Also create apple touch icon
          const appleLink = document.createElement('link');
          appleLink.rel = 'apple-touch-icon';
          appleLink.href = faviconWithCacheBust;
          if (document.head) {
            document.head.appendChild(appleLink);
          }
          
          console.log(`Favicon updated to: ${faviconPath} (theme: ${detectedTheme})`);
        } catch (error) {
          console.error('Error updating favicon:', error);
        }
      };

      // Listen for theme changes by observing class changes on html element
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            // Add a small delay to ensure the class change is fully applied
            setTimeout(() => updateFavicon(theme), 50);
          }
        });
      });

      // Observe changes to the html element's class attribute
      if (document.documentElement) {
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['class']
        });
      }

      // Also listen for system theme changes as backup
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        // Only update if no explicit theme is set
        if (!theme || theme === 'system') {
          updateFavicon(theme);
        }
      };

      // Add listener for system theme changes
      mediaQuery.addEventListener('change', handleSystemThemeChange);

      // Initial update
      updateFavicon(theme);
      
      // Also update after a short delay to ensure theme is fully applied
      const delayTimeoutId = setTimeout(() => {
        updateFavicon(theme);
      }, 500);
      
      // Additional update after a longer delay to catch any late theme changes
      const longDelayTimeoutId = setTimeout(() => {
        updateFavicon(theme);
      }, 2000);
      
      return () => {
        clearTimeout(delayTimeoutId);
        clearTimeout(longDelayTimeoutId);
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
        observer.disconnect();
      };
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [theme]);
} 