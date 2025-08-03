import Link from 'next/link';

interface CodeuniaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  noLink?: boolean;
}

export default function CodeuniaLogo({ 
  className = '', 
  size = 'md', 
  showText = true,
  noLink = false
}: CodeuniaLogoProps) {
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
            <linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#007AFF" />
              <stop offset="30%" stopColor="#6C63FF" />
              <stop offset="60%" stopColor="#FF6EC7" />
              <stop offset="100%" stopColor="#FF9F45" />
            </linearGradient>
          </defs>
          
          {/* The 'C' for Code */}
          <path 
            d="M165,100 A65,65 0 1 1 100,35"
            fill="none" 
            stroke="currentColor" 
            strokeWidth="30" 
            strokeLinecap="round"
            className="text-foreground"
          />
          
          {/* The Dot for Unia/Community */}
          <circle 
            cx="100" 
            cy="165" 
            r="15" 
            fill="url(#rainbowGradient)"
            className="group-hover:scale-110 transition-transform duration-300"
          />
        </svg>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent ${textSizes[size]} group-hover:from-purple-500 group-hover:to-blue-500 transition-all duration-300`}>
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