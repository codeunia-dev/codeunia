"use client"

import { useEffect, useState, useMemo } from "react"

export function Particles() {
  const [particleCount, setParticleCount] = useState(5); // Reduced default

  useEffect(() => {
    // Optimize particle count based on device performance
    const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    const isMobile = window.innerWidth < 768;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (isReducedMotion) {
      setParticleCount(0); // Disable particles for users who prefer reduced motion
    } else if (isLowEndDevice) {
      setParticleCount(3); // Reduced from 5
    } else if (isMobile) {
      setParticleCount(5); // Reduced from 8
    } else {
      setParticleCount(8); // Reduced from 15
    }
  }, []);

  // Memoize particle positions to avoid recalculation
  const particles = useMemo(() => {
    if (particleCount === 0) return [];
    return Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2
    }));
  }, [particleCount]);

  // Early return if no particles
  if (particleCount === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`
          }}
        />
      ))}
    </div>
  )
}

export default Particles; 