'use client';

import dynamic from 'next/dynamic';

// Dynamically import AIChat to avoid SSR issues
const AIChat = dynamic(() => import('./AIChat'), {
  ssr: false,
  loading: () => null
});

export default function AIProvider() {
  return <AIChat />;
}
