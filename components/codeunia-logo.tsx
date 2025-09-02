import Link from 'next/link';

// Updated logo component with new design - force deployment
interface CodeuniaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  noLink?: boolean;
  instanceId?: string; // Optional prop to make gradient unique when needed
}

export default function CodeuniaLogo({ 
  className = '', 
  size = 'md', 
  showText = true,
  noLink = false,
  instanceId = 'default'
}: CodeuniaLogoProps) {
  // Use a stable, deterministic ID to prevent hydration mismatches
  const gradientId = `rainbowGradient-${instanceId}`;
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const logoContent = (
    <>
      {/* Logo Icon */}
      <div className={`relative ${sizeClasses[size]} flex-shrink-0`}>
        <svg 
          viewBox="0 0 200 200" 
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#007AFF" />
              <stop offset="30%" stopColor="#6C63FF" />
              <stop offset="60%" stopColor="#FF6EC7" />
              <stop offset="100%" stopColor="#FF9F45" />
            </linearGradient>
          </defs>
          
          {/* Rounded square background */}
          <rect x="0" y="0" width="200" height="200" rx="40" ry="40" fill="#007AFF" />
          
          {/* The 'C' in black */}
          <path 
            d="M165,100 A65,65 0 1 1 100,35"
            fill="none" 
            stroke="#000000" 
            strokeWidth="30" 
            strokeLinecap="round"
          />
          
          {/* Gradient dot */}
          <circle 
            cx="100" 
            cy="165" 
            r="15" 
            fill={`url(#${gradientId})`}
          />
        </svg>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <span className={`font-medium text-[#007AFF] ${textSizes[size]} transition-all duration-300`} style={{ fontFamily: 'Inter, sans-serif' }}>
          Codeunia 
        </span>
      )}
    </>
  );

  if (noLink) {
    return (
      <div className={`flex items-center space-x-2 group ${className}`}>
        {logoContent}
      </div>
    );
  }

  return (
    <Link href="/" className={`flex items-center space-x-2 group ${className}`}>
      {logoContent}
    </Link>
  );
} 