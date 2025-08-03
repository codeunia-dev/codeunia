"use client"

import { useEffect, useState } from "react"

export function Particles() {
  const [particleCount, setParticleCount] = useState(10);

  useEffect(() => {
    setParticleCount(window.innerWidth < 768 ? 10 : 20);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: particleCount }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  )
}

export default Particles; 