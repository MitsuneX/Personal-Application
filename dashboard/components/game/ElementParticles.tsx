"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ElementTheme } from "@/lib/utils/elementTheme";

interface ElementParticlesProps {
  theme: ElementTheme;
  isCyber: boolean;
}

interface ParticleSpec {
  id: number;
  x: number;          // % from left
  y: number;          // % from top
  size: number;       // px
  duration: number;   // seconds
  delay: number;      // seconds
  color: string;
  shape: "circle" | "diamond" | "sparkle";
}

export function ElementParticles({ theme, isCyber }: ElementParticlesProps) {
  // Generate stable particle specs based on particleType
  const particles = useMemo<ParticleSpec[]>(() => {
    const count = 14;
    const colors = theme.particleColors;

    return Array.from({ length: count }, (_, i) => {
      const color = colors[i % colors.length];
      const shape: "circle" | "diamond" | "sparkle" =
        theme.particleType === "ice" && i % 3 === 0
          ? "diamond"
          : theme.particleType === "spark" && i % 2 === 0
          ? "sparkle"
          : "circle";

      return {
        id: i,
        x: Math.floor((i * 7.3 + (i % 5) * 17) % 94) + 3,
        y: Math.floor((i * 11.5 + (i % 4) * 23) % 85) + 10,
        size: theme.particleType === "ice" ? Math.floor((i % 4) * 2 + 4) : Math.floor((i % 3) * 2 + 3),
        duration: Math.floor((i % 5) * 2 + 7), // 7s to 15s slow float
        delay: Math.floor((i % 4) * 1.5 * 10) / 10,
        color,
        shape,
      };
    });
  }, [theme]);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none z-10 motion-reduce:hidden opacity-80"
    >
      {particles.map((p) => {
        let animateProps = {};
        let initialProps = {};

        switch (theme.particleType) {
          case "ice":
            initialProps = { x: `${p.x}%`, y: `${p.y}%`, opacity: 0, scale: 0.6, rotate: 0 };
            animateProps = {
              y: [`${p.y}%`, `${Math.max(0, p.y - 25)}%`],
              opacity: [0, 0.85, 0.6, 0],
              scale: [0.6, 1.1, 0.9, 0.5],
              rotate: [0, 45, 90],
            };
            break;

          case "ember":
            initialProps = { x: `${p.x}%`, y: `${p.y + 15}%`, opacity: 0, scale: 0.5 };
            animateProps = {
              y: [`${p.y + 15}%`, `${Math.max(0, p.y - 30)}%`],
              x: [`${p.x}%`, `${p.x + (p.id % 2 === 0 ? 4 : -4)}%`],
              opacity: [0, 0.9, 0.4, 0],
              scale: [0.5, 1.2, 0.8, 0.3],
            };
            break;

          case "spark":
            initialProps = { x: `${p.x}%`, y: `${p.y}%`, opacity: 0, scale: 0.3 };
            animateProps = {
              opacity: [0, 1, 0.2, 0.9, 0],
              scale: [0.3, 1.3, 0.8, 1.1, 0.2],
            };
            break;

          case "wind":
            initialProps = { x: `${p.x}%`, y: `${p.y}%`, opacity: 0, scale: 0.8 };
            animateProps = {
              x: [`${p.x}%`, `${(p.x + 20) % 100}%`],
              y: [`${p.y}%`, `${p.y - 8}%`],
              opacity: [0, 0.75, 0.75, 0],
              scale: [0.8, 1, 0.9, 0.6],
            };
            break;

          case "mote":
          default:
            initialProps = { x: `${p.x}%`, y: `${p.y}%`, opacity: 0, scale: 0.7 };
            animateProps = {
              y: [`${p.y}%`, `${p.y - 15}%`, `${p.y}%`],
              opacity: [0.2, 0.85, 0.2],
              scale: [0.7, 1.15, 0.7],
            };
            break;
        }

        return (
          <motion.div
            key={p.id}
            initial={initialProps}
            animate={animateProps}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
              delay: p.delay,
            }}
            className="absolute rounded-full"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              borderRadius: p.shape === "diamond" ? "2px" : "9999px",
              transform: p.shape === "diamond" ? "rotate(45deg)" : "none",
              boxShadow: isCyber
                ? `0 0 ${p.size * 2.5}px ${p.color}, 0 0 ${p.size * 4}px ${p.color}66`
                : `0 0 ${p.size * 1.5}px ${p.color}aa`,
            }}
          />
        );
      })}

      {/* Frosted Shimmer Overlay for Glacio/Ice specifically */}
      {theme.category === "glacio" && isCyber && (
        <motion.div
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 80% 20%, rgba(125, 211, 252, 0.18) 0%, transparent 45%), radial-gradient(circle at 20% 80%, rgba(56, 189, 248, 0.12) 0%, transparent 40%)",
          }}
        />
      )}
    </div>
  );
}
