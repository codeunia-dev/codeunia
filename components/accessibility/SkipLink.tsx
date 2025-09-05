'use client';

import { useEffect, useState } from 'react';

export function SkipLink() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab' && !isVisible) {
        setIsVisible(true);
      }
    };

    const handleClick = () => {
      setIsVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClick);
    };
  }, [isVisible]);

  return (
    <a
      href="#main-content"
      className={`fixed top-4 left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
      } focus:opacity-100 focus:translate-y-0`}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      Skip to main content
    </a>
  );
}
