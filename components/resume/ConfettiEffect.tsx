'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocity: { x: number; y: number };
  rotationSpeed: number;
}

interface ConfettiEffectProps {
  trigger: boolean;
  onComplete?: () => void;
}

const COLORS = [
  '#9333ea', // purple-600
  '#a855f7', // purple-500
  '#c084fc', // purple-400
  '#e879f9', // fuchsia-400
  '#f0abfc', // fuchsia-300
  '#fbbf24', // amber-400
  '#60a5fa', // blue-400
];

export function ConfettiEffect({ trigger, onComplete }: ConfettiEffectProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    // Generate confetti pieces
    const pieces: ConfettiPiece[] = [];
    const pieceCount = 50;

    for (let i = 0; i < pieceCount; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100, // Start position (percentage)
        y: -10, // Start above viewport
        rotation: Math.random() * 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 10 + 5, // 5-15px
        velocity: {
          x: (Math.random() - 0.5) * 2, // -1 to 1
          y: Math.random() * 2 + 2, // 2-4
        },
        rotationSpeed: (Math.random() - 0.5) * 10, // -5 to 5
      });
    }

    setConfetti(pieces);
    setIsActive(true);

    // Animate confetti
    const animationDuration = 3000; // 3 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / animationDuration;

      if (progress >= 1) {
        setIsActive(false);
        setConfetti([]);
        onComplete?.();
        return;
      }

      setConfetti((prev) =>
        prev.map((piece) => ({
          ...piece,
          y: piece.y + piece.velocity.y,
          x: piece.x + piece.velocity.x * 0.5,
          rotation: piece.rotation + piece.rotationSpeed,
        }))
      );

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [trigger, onComplete]);

  if (!isActive || confetti.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute transition-all duration-100 ease-linear"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            opacity: Math.max(0, 1 - piece.y / 100),
          }}
        />
      ))}
    </div>
  );
}

// Simpler confetti burst for quick celebrations
export function ConfettiBurst() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div className="relative w-64 h-64">
        {Array.from({ length: 30 }).map((_, i) => {
          const angle = (i / 30) * Math.PI * 2;
          const distance = 100;
          const x = Math.cos(angle) * distance;
          const y = Math.sin(angle) * distance;
          const color = COLORS[i % COLORS.length];

          return (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full animate-ping"
              style={{
                left: '50%',
                top: '50%',
                backgroundColor: color,
                transform: `translate(${x}px, ${y}px)`,
                animationDelay: `${i * 20}ms`,
                animationDuration: '1s',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
