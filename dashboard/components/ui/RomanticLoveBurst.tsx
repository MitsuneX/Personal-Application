"use client";

import React, { useState, useCallback, useImperativeHandle, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface RomanticLoveBurstHandle {
  trigger: (originX?: number, originY?: number) => void;
}

interface Particle {
  id: string;
  glyph: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  scale: number;
  rotate: number;
  color?: string;
}

interface Ripple {
  id: string;
}

const ROMANTIC_GLYPHS = ["❤️", "💕", "✨", "💖", "♡", "💗", "🌸"];

interface RomanticLoveBurstProps {
  className?: string;
}

export const RomanticLoveBurst = forwardRef<RomanticLoveBurstHandle, RomanticLoveBurstProps>(
  ({ className = "" }, ref) => {
    const [particles, setParticles] = useState<Particle[]>([]);
    const [ripples, setRipples] = useState<Ripple[]>([]);

    const trigger = useCallback((_originX?: number, _originY?: number) => {
      // Check prefers-reduced-motion
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Spawn a ripple ring
      const rippleId = `rip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setRipples((prev) => [...prev.slice(-3), { id: rippleId }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== rippleId));
      }, 600);

      if (prefersReducedMotion) return;

      // Spawn 5 to 7 particles
      const count = 5 + Math.floor(Math.random() * 3);
      const newParticles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        // Spread evenly in an upward arc
        const baseAngle = -Math.PI / 2; // Upward
        const spread = (Math.PI * 0.8) * (i / (count - 1) - 0.5); // Spread across 140 degrees
        const angle = baseAngle + spread + (Math.random() * 0.3 - 0.15);
        const distance = 35 + Math.random() * 35; // Distance 35-70px

        const targetX = Math.cos(angle) * distance;
        const targetY = Math.sin(angle) * distance;
        const glyph = ROMANTIC_GLYPHS[Math.floor(Math.random() * ROMANTIC_GLYPHS.length)];

        newParticles.push({
          id: `p-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          glyph,
          x: 0,
          y: 0,
          targetX,
          targetY,
          scale: 0.75 + Math.random() * 0.5,
          rotate: (Math.random() - 0.5) * 45,
        });
      }

      setParticles((prev) => [...prev.slice(-12), ...newParticles]);

      // Automatic cleanup after 650ms
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
      }, 650);
    }, []);

    useImperativeHandle(ref, () => ({
      trigger,
    }));

    return (
      <div
        className={`pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible z-50 ${className}`}
        aria-hidden="true"
      >
        {/* Expanding romantic ripple wave */}
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.div
              key={ripple.id}
              initial={{ scale: 0.6, opacity: 0.8 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="absolute w-8 h-8 rounded-full border border-pink-400/80 pointer-events-none shadow-[0_0_15px_rgba(244,63,94,0.6)]"
            />
          ))}
        </AnimatePresence>

        {/* Floating micro-emotes */}
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.span
              key={particle.id}
              initial={{
                x: 0,
                y: 0,
                scale: 0.2,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                x: particle.targetX,
                y: particle.targetY,
                scale: [0.2, particle.scale, particle.scale * 0.9],
                opacity: [1, 0.95, 0],
                rotate: particle.rotate,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute text-xs sm:text-sm select-none drop-shadow-[0_0_6px_rgba(236,72,153,0.8)] filter"
            >
              {particle.glyph}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    );
  }
);

RomanticLoveBurst.displayName = "RomanticLoveBurst";
