"use client"

import { useEffect, useState, useMemo } from "react"

export function Particles() {
  const [particleCount, setParticleCount] = useState(10);

  useEffect(() => {
    // Optimize particle count based on device performance
    const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    const isMobile = window.innerWidth < 768;
    
    if (isLowEndDevice) {
      setParticleCount(5);
    } else if (isMobile) {
      setParticleCount(8);
    } else {
      setParticleCount(15);
    }
  }, []);

  // Memoize particle positions to avoid recalculation
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2
    }));
  }, [particleCount]);

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