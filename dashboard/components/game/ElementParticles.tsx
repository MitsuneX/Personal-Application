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
  shape: "circle" | "diamond" | "snowflake" | "sparkle";
}

/**
 * Corner SVG Crystal / Shard Decorator Components
 * Exactly matches the reference screenshot's corner ice crystals & snowflakes.
 */
function GlacioIceShards({ primaryColor, secondaryColor }: { primaryColor: string; secondaryColor: string }) {
  return (
    <>
      {/* Bottom-Right Large Crystalline Ice Shards (Exact Match to Reference Screenshot) */}
      <div className="absolute -bottom-8 -right-8 pointer-events-none z-20 w-52 h-52 opacity-95 filter drop-shadow-[0_0_24px_rgba(56,189,248,0.85)] select-none">
        <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="iceGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F0F9FF" stopOpacity="0.98" />
              <stop offset="45%" stopColor="#38BDF8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.65" />
            </linearGradient>
            <linearGradient id="iceGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#7DD3FC" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0369A1" stopOpacity="0.55" />
            </linearGradient>
            <linearGradient id="iceGrad3" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          {/* Main Dominant Shard Pointer */}
          <polygon points="130,220 210,30 220,220" fill="url(#iceGrad1)" />
          <polygon points="130,220 210,30 160,140" fill="url(#iceGrad2)" />
          {/* Secondary Left Shard */}
          <polygon points="40,220 165,85 200,220" fill="url(#iceGrad2)" />
          <polygon points="40,220 165,85 110,170" fill="url(#iceGrad3)" />
          {/* Mid Accent Shards */}
          <polygon points="85,220 185,125 215,210" fill="url(#iceGrad1)" />
          <polygon points="10,220 120,135 145,220" fill="url(#iceGrad1)" opacity="0.85" />
          <polygon points="175,115 205,65 212,130" fill="url(#iceGrad2)" />
        </svg>
      </div>

      {/* Top-Right Snowflake & Crystal Cluster (Exact Match to Reference Screenshot) */}
      <div className="absolute -top-5 -right-5 pointer-events-none z-20 w-32 h-32 opacity-85 filter drop-shadow-[0_0_18px_rgba(56,189,248,0.7)] select-none">
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M60 0 V120 M0 60 H120 M18 18 L102 102 M18 102 L102 18" stroke="#7DD3FC" strokeWidth="2.8" strokeLinecap="round" opacity="0.8" />
          <circle cx="60" cy="60" r="12" stroke="#E0F2FE" strokeWidth="2.2" fill="none" />
          <polygon points="60,22 65,40 60,34 55,40" fill="#E0F2FE" />
          <polygon points="60,98 65,80 60,86 55,80" fill="#E0F2FE" />
          <polygon points="22,60 40,65 34,60 40,55" fill="#E0F2FE" />
          <polygon points="98,60 80,65 86,60 80,55" fill="#E0F2FE" />
          {/* Outer Corner Snowflake Starlets */}
          <circle cx="95" cy="25" r="4" fill="#E0F2FE" />
          <circle cx="105" cy="40" r="2.5" fill="#38BDF8" />
        </svg>
      </div>
    </>
  );
}

function GenericElementShards({ primaryColor, secondaryColor }: { primaryColor: string; secondaryColor: string }) {
  return (
    <div className="absolute -bottom-5 -right-5 pointer-events-none z-20 w-40 h-40 opacity-80 filter drop-shadow-[0_0_18px_rgba(0,0,0,0.6)] select-none">
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="elemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.95" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <polygon points="95,160 150,30 160,160" fill="url(#elemGrad)" />
        <polygon points="30,160 115,75 145,160" fill="url(#elemGrad)" opacity="0.75" />
      </svg>
    </div>
  );
}

export function ElementParticles({ theme, isCyber }: ElementParticlesProps) {
  // Generate stable particle specs drifting mainly around corners and edges
  const particles = useMemo<ParticleSpec[]>(() => {
    const count = 24; // Edge/corner floating particles
    const colors = theme.particleColors;

    return Array.from({ length: count }, (_, i) => {
      const color = colors[i % colors.length];
      const shape: "circle" | "diamond" | "snowflake" | "sparkle" =
        theme.category === "glacio"
          ? i % 4 === 0
            ? "snowflake"
            : i % 3 === 0
            ? "diamond"
            : "circle"
          : theme.particleType === "spark" && i % 2 === 0
          ? "sparkle"
          : "circle";

      // Position mainly around edges/corners (top-left, top-right, bottom-left, bottom-right)
      let x = 0;
      let y = 0;
      const corner = i % 4;
      if (corner === 0) { // Top-Left
        x = Math.floor((i * 4) % 28) + 2;
        y = Math.floor((i * 6) % 35) + 3;
      } else if (corner === 1) { // Top-Right
        x = Math.floor((i * 4) % 28) + 70;
        y = Math.floor((i * 5) % 35) + 3;
      } else if (corner === 2) { // Bottom-Left
        x = Math.floor((i * 4) % 30) + 2;
        y = Math.floor((i * 5) % 35) + 62;
      } else { // Bottom-Right
        x = Math.floor((i * 4) % 30) + 68;
        y = Math.floor((i * 6) % 35) + 60;
      }

      return {
        id: i,
        x,
        y,
        size: theme.particleType === "ice" ? Math.floor((i % 4) * 2 + 5) : Math.floor((i % 3) * 2 + 4),
        duration: Math.floor((i % 5) * 3 + 8), // 8s to 20s gentle drift
        delay: Math.floor((i % 5) * 1.2 * 10) / 10,
        color,
        shape,
      };
    });
  }, [theme]);

  if (!isCyber) {
    return null; // Neo-Brutalism uses clean structural borders without particle overlays
  }

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none z-10 motion-reduce:hidden opacity-90 select-none"
    >
      {/* Corner Decorative Shards */}
      {theme.category === "glacio" ? (
        <GlacioIceShards primaryColor={theme.primaryColor} secondaryColor={theme.secondaryColor} />
      ) : (
        <GenericElementShards primaryColor={theme.primaryColor} secondaryColor={theme.secondaryColor} />
      )}

      {/* Edge & Corner Floating Particles */}
      {particles.map((p) => {
        let animateProps = {};
        let initialProps = {};

        switch (theme.particleType) {
          case "ice":
            initialProps = { x: `${p.x}%`, y: `${p.y}%`, opacity: 0, scale: 0.5, rotate: 0 };
            animateProps = {
              y: [`${p.y}%`, `${Math.max(0, p.y - 18)}%`],
              x: [`${p.x}%`, `${p.x + (p.id % 2 === 0 ? 3 : -3)}%`],
              opacity: [0, 0.85, 0.6, 0],
              scale: [0.5, 1.15, 0.85, 0.4],
              rotate: [0, 45, 90],
            };
            break;

          case "ember":
            initialProps = { x: `${p.x}%`, y: `${p.y + 10}%`, opacity: 0, scale: 0.5 };
            animateProps = {
              y: [`${p.y + 10}%`, `${Math.max(0, p.y - 25)}%`],
              x: [`${p.x}%`, `${p.x + (p.id % 2 === 0 ? 4 : -4)}%`],
              opacity: [0, 0.9, 0.4, 0],
              scale: [0.5, 1.2, 0.7, 0.3],
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
              x: [`${p.x}%`, `${(p.x + 18) % 100}%`],
              y: [`${p.y}%`, `${p.y - 6}%`],
              opacity: [0, 0.8, 0.6, 0],
              scale: [0.8, 1.1, 0.8, 0.5],
            };
            break;

          case "mote":
          default:
            initialProps = { x: `${p.x}%`, y: `${p.y}%`, opacity: 0, scale: 0.6 };
            animateProps = {
              y: [`${p.y}%`, `${p.y - 12}%`, `${p.y}%`],
              opacity: [0.2, 0.85, 0.2],
              scale: [0.6, 1.1, 0.6],
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
            className="absolute flex items-center justify-center"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: 0,
              top: 0,
            }}
          >
            {p.shape === "snowflake" ? (
              <span
                className="text-cyan-200 opacity-85"
                style={{
                  fontSize: `${p.size * 1.5}px`,
                  filter: `drop-shadow(0 0 6px ${p.color})`,
                }}
              >
                ❄
              </span>
            ) : (
              <div
                className="w-full h-full rounded-full"
                style={{
                  backgroundColor: p.color,
                  borderRadius: p.shape === "diamond" ? "2px" : "9999px",
                  transform: p.shape === "diamond" ? "rotate(45deg)" : "none",
                  boxShadow: `0 0 ${p.size * 2.5}px ${p.color}, 0 0 ${p.size * 4}px ${p.color}66`,
                }}
              />
            )}
          </motion.div>
        );
      })}

      {/* Atmospheric Frosted Corner Shimmer Layer for Glacio/Ice */}
      {theme.category === "glacio" && (
        <motion.div
          animate={{ opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 90% 10%, rgba(125, 211, 252, 0.22) 0%, transparent 40%), radial-gradient(circle at 10% 90%, rgba(56, 189, 248, 0.18) 0%, transparent 35%), radial-gradient(circle at 90% 90%, rgba(56, 189, 248, 0.25) 0%, transparent 45%)",
          }}
        />
      )}
    </div>
  );
}
