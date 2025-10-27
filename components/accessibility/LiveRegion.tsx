'use client';

import { useEffect, useRef, useState } from 'react';

interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive' | 'off';
  clearAfter?: number;
}

export function LiveRegion({ message, politeness = 'polite', clearAfter = 3000 }: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && clearAfter > 0) {
      const timer = setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = '';
        }
      }, clearAfter);

      return () => clearTimeout(timer);
    }
  }, [message, clearAfter]);

  return (
    <div
      ref={regionRef}
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

export function useAnnounce() {
  const [announcement, setAnnouncement] = useState('');

  const announce = (message: string) => {
    setAnnouncement(message);
  };

  return { announcement, announce };
}
