import React from "react";

interface CodeuniaLogoProps {
  size?: number;
  className?: string;
}

/**
 * CodeuniaLogo - A modern, minimalist logo representing focus, completion, and community.
 *
 * @param size - The width/height of the logo in pixels (default: 180)
 * @param className - Additional class names for the container
 */
export const CodeuniaLogo: React.FC<CodeuniaLogoProps> = ({ size = 180, className = "" }) => {
  return (
    <span
      className={`inline-flex items-center justify-center transition-transform duration-500 group ${className}`}
      style={{ width: size +25, height: size + 50}}
    >
      <svg
        className="logo-svg group-hover:rotate-[-10deg]"
        width={size}
        height={size}
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible" }}
      >
        {/* The 'C' for Code */}
        <path
          className="shape c-shape transition-transform duration-500 origin-center"
          d="M165,100 A65,65 0 1 1 100,35"
          fill="none"
          stroke="white"
          strokeWidth="30"
          strokeLinecap="round"
        />
        {/* The Dot for Unia/Community */}
        <circle
          className="shape dot-shape transition-transform duration-500 origin-center group-hover:scale-120 group-hover:rotate-[10deg]"
          cx="100"
          cy="165"
          r="15"
          fill="#007AFF"
        />
      </svg>
    </span>
  );
};

export default CodeuniaLogo; 