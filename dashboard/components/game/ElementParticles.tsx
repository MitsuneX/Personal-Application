"use client";

/**
 * ElementParticles.tsx
 *
 * Architecture:
 *   ELEMENT → determines WHAT the atmosphere looks/feels like
 *   THEME   → determines HOW that atmosphere is rendered
 *
 * Both Cyberpunk and Neo-Brutalism render elemental effects.
 * `isCyber` controls rendering language, NOT whether effects appear.
 *
 * Cyberpunk  = luminous, translucent, glowing aura, soft bloom
 * Neo-Brutalism = crisp, structured, solid fills, restrained, no bloom
 */

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ElementTheme, ElementCategory } from "@/lib/utils/elementTheme";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ElementParticlesProps {
  theme: ElementTheme;
  isCyber: boolean;
}

type ParticleShape = "circle" | "diamond" | "square" | "snowflake" | "star" | "leaf" | "drop" | "spark";

interface ParticleSpec {
  id: number;
  x: number;   // % from left
  y: number;   // % from top
  size: number; // px
  duration: number;
  delay: number;
  color: string;
  shape: ParticleShape;
}

// ─────────────────────────────────────────────────────────────────────────────
// ── CORNER MOTIFS (per-element SVG, theme-aware rendering) ───────────────────
// Cyberpunk:    translucent fills, drop-shadow glow filter
// Neo-Brutalism: solid fills, crisp outlines, no blur
// ─────────────────────────────────────────────────────────────────────────────

function CornerMotif({ theme, isCyber }: { theme: ElementTheme; isCyber: boolean }) {
  const { category, primaryColor, secondaryColor } = theme;
  const glowFilter = isCyber ? `drop-shadow(0 0 14px ${primaryColor}90)` : "none";
  const opacity = isCyber ? 0.85 : 0.78;
  const sw = "1.5"; // strokeWidth for Neo

  switch (category) {

    // ── GLACIO — Snowflake cluster (top-right) ───────────────────────────────
    case "glacio":
      return (
        <div className="absolute top-2 right-2 pointer-events-none z-20 w-28 h-28 select-none"
          style={{ opacity, filter: glowFilter }}>
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M60 4 V116 M4 60 H116 M19 19 L101 101 M19 101 L101 19"
              stroke={isCyber ? "#7DD3FC" : "#0EA5E9"}
              strokeWidth={isCyber ? "2.5" : "3.5"}
              strokeLinecap={isCyber ? "round" : "square"}
              opacity={isCyber ? 0.78 : 0.88} />
            <circle cx="60" cy="60" r="12"
              stroke={isCyber ? "#E0F2FE" : "#0284C7"}
              strokeWidth="2.2" fill="none" />
            {(["60,20 65,38 60,32 55,38", "60,100 65,82 60,88 55,82",
               "20,60 38,65 32,60 38,55", "100,60 82,65 88,60 82,55"] as string[]).map((pts, i) => (
              <polygon key={i} points={pts}
                fill={isCyber ? "#E0F2FE" : "#38BDF8"}
                stroke={isCyber ? "none" : "#0284C7"}
                strokeWidth={sw} />
            ))}
            <circle cx="96" cy="24" r={isCyber ? 3.5 : 4.5}
              fill={isCyber ? "#E0F2FE" : "#38BDF8"}
              stroke={isCyber ? "none" : "#0284C7"} strokeWidth={sw} />
            <circle cx="108" cy="42" r={isCyber ? 2 : 2.5}
              fill={isCyber ? "#38BDF8" : "#0EA5E9"} />
          </svg>
        </div>
      );

    // ── FUSION — Flame tongues (top-right) ───────────────────────────────────
    case "fusion":
      return (
        <div className="absolute top-0 right-0 pointer-events-none z-20 w-28 h-36 select-none"
          style={{ opacity, filter: glowFilter }}>
          <svg viewBox="0 0 110 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <linearGradient id="flameG" x1="0%" y1="100%" x2="20%" y2="0%">
                <stop offset="0%" stopColor={isCyber ? "#EF4444" : "#DC2626"} stopOpacity={isCyber ? 0.9 : 1} />
                <stop offset="55%" stopColor={isCyber ? "#F97316" : "#EA580C"} stopOpacity={isCyber ? 0.85 : 0.92} />
                <stop offset="100%" stopColor={isCyber ? "#FCD34D" : "#F59E0B"} stopOpacity={isCyber ? 0.5 : 0.75} />
              </linearGradient>
            </defs>
            {/* Main flame */}
            <path d="M85,140 C85,95 112,62 92,18 C76,52 66,30 72,0 C46,32 38,84 60,115 C50,98 50,82 61,72 C61,92 76,120 85,140Z"
              fill="url(#flameG)"
              stroke={isCyber ? "none" : "#C2410C"} strokeWidth={sw} />
            {/* Side tongue */}
            <path d="M55,140 C55,110 70,88 62,62 C50,84 40,106 55,140Z"
              fill={isCyber ? "#F9731660" : "#EA580C"}
              stroke={isCyber ? "none" : "#C2410C"} strokeWidth="1" />
            {/* Tip glow */}
            <circle cx="92" cy="18" r="5"
              fill={isCyber ? "#FDE68A" : "#FCD34D"}
              stroke={isCyber ? "none" : "#D97706"} strokeWidth="1.5" />
          </svg>
        </div>
      );

    // ── ELECTRO — Lightning bolt (top-right) ─────────────────────────────────
    case "electro":
      return (
        <div className="absolute top-2 right-2 pointer-events-none z-20 w-24 h-28 select-none"
          style={{ opacity, filter: glowFilter }}>
          <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Primary bolt */}
            <polygon points="64,0 32,58 56,58 26,120 82,46 56,46 80,0"
              fill={isCyber ? "#C084FC" : "#9333EA"}
              stroke={isCyber ? "none" : "#7E22CE"} strokeWidth={sw} />
            {/* Secondary bolt */}
            <polygon points="88,5 76,36 88,36 70,72 96,30 82,30 94,5"
              fill={isCyber ? "#E9D5FF60" : "#A855F7"}
              stroke={isCyber ? "none" : "#7E22CE"} strokeWidth="1" />
            {/* Arc sparks */}
            <line x1="18" y1="18" x2="30" y2="6"
              stroke={isCyber ? "#E9D5FF" : "#7E22CE"} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="8" y1="34" x2="20" y2="24"
              stroke={isCyber ? "#C084FC" : "#9333EA"} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      );

    // ── AERO — Wind swirl arcs (top-right) ───────────────────────────────────
    case "aero":
      return (
        <div className="absolute top-2 right-2 pointer-events-none z-20 w-28 h-28 select-none"
          style={{ opacity, filter: glowFilter }}>
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M112,8 C80,8 48,30 60,64 C72,96 104,94 112,72"
              stroke={isCyber ? "#5EEAD4" : "#0F766E"}
              strokeWidth={isCyber ? "3" : "4.5"} fill="none" strokeLinecap="round" />
            <path d="M96,3 C68,3 44,22 52,52 C58,74 86,78 96,58"
              stroke={isCyber ? "#2DD4BF80" : "#14B8A6"}
              strokeWidth={isCyber ? "2" : "3"} fill="none" strokeLinecap="round" />
            <path d="M80,0 C58,0 38,16 46,42 C52,62 74,62 80,44"
              stroke={isCyber ? "#99F6E450" : "#2DD4BF"}
              strokeWidth={isCyber ? "1.5" : "2"} fill="none" strokeLinecap="round" />
            <circle cx="112" cy="8" r={isCyber ? 3 : 4.5}
              fill={isCyber ? "#5EEAD4" : "#0F766E"} />
            <circle cx="96" cy="3" r={isCyber ? 2 : 3}
              fill={isCyber ? "#2DD4BF" : "#14B8A6"} />
          </svg>
        </div>
      );

    // ── SPECTRO — 8-pointed star / prism (top-right) ─────────────────────────
    case "spectro":
      return (
        <div className="absolute top-2 right-2 pointer-events-none z-20 w-28 h-28 select-none"
          style={{ opacity, filter: glowFilter }}>
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* 8-pointed star */}
            <polygon points="78,8 84,30 102,18 90,36 112,42 90,48 102,66 84,54 78,76 72,54 54,66 66,48 44,42 66,36 54,18 72,30"
              fill={isCyber ? "#FDE04770" : "#FACC15"}
              stroke={isCyber ? "none" : "#CA8A04"} strokeWidth={sw} />
            {/* Small accent star */}
            <polygon points="106,4 109,14 118,14 111,20 114,30 106,24 98,30 101,20 94,14 103,14"
              fill={isCyber ? "#FEF08A" : "#EAB308"}
              stroke={isCyber ? "none" : "#CA8A04"} strokeWidth="1" />
            {/* Ray lines */}
            {([[78,8,78,0],[112,42,120,42],[78,76,78,85],[44,42,35,42]] as number[][]).map(([x1,y1,x2,y2],i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={isCyber ? "#FEF08A70" : "#CA8A04"}
                strokeWidth={isCyber ? "1.5" : "2.5"} />
            ))}
          </svg>
        </div>
      );

    // ── HAVOC — Fractured void shards (top-right) ────────────────────────────
    case "havoc":
      return (
        <div className="absolute top-2 right-2 pointer-events-none z-20 w-28 h-28 select-none"
          style={{ opacity, filter: glowFilter }}>
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Fractured polygon */}
            <polygon points="78,4 112,30 100,64 68,42 58,8"
              fill={isCyber ? "#EF444438" : "#DC2626"}
              stroke={isCyber ? "#F8717170" : "#991B1B"} strokeWidth={sw} />
            {/* Secondary void shard */}
            <polygon points="96,0 120,22 115,52 95,36"
              fill={isCyber ? "#9333EA35" : "#7C3AED"}
              stroke={isCyber ? "#C084FC60" : "#6D28D9"} strokeWidth="1" />
            {/* Crack lines */}
            <path d="M68,42 L88,72 L62,94 M100,64 L84,88"
              stroke={isCyber ? "#F8717155" : "#B91C1C"}
              strokeWidth="1.5" strokeLinecap="round" />
            {/* Void dot */}
            <circle cx="112" cy="8" r="5.5"
              fill={isCyber ? "#EF4444" : "#DC2626"}
              stroke={isCyber ? "none" : "#991B1B"} strokeWidth="1.5" />
          </svg>
        </div>
      );

    // ── HYDRO — Wave arc + droplet cluster (top-right) ───────────────────────
    case "hydro":
      return (
        <div className="absolute top-2 right-2 pointer-events-none z-20 w-28 h-28 select-none"
          style={{ opacity, filter: glowFilter }}>
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Wave arcs */}
            <path d="M8,72 C28,52 48,92 68,72 C88,52 108,92 120,72"
              stroke={isCyber ? "#38BDF8" : "#0284C7"}
              strokeWidth={isCyber ? "2.5" : "4"} fill="none" strokeLinecap="round" />
            <path d="M18,52 C38,30 58,68 78,50 C98,30 112,62 120,46"
              stroke={isCyber ? "#7DD3FC60" : "#0EA5E9"}
              strokeWidth={isCyber ? "1.5" : "2.5"} fill="none" strokeLinecap="round" />
            {/* Droplets */}
            {([[90,18],[110,38],[74,8]] as number[][]).map(([cx,cy],i) => (
              <path key={i} d={`M${cx},${cy-14} C${cx-9},${cy-7} ${cx-9},${cy} ${cx},${cy+5} C${cx+9},${cy} ${cx+9},${cy-7} ${cx},${cy-14}Z`}
                fill={isCyber ? "#38BDF870" : "#0EA5E9"}
                stroke={isCyber ? "none" : "#0369A1"} strokeWidth="1.5" />
            ))}
          </svg>
        </div>
      );

    // ── DENDRO — Vine + leaf cluster (top-right) ─────────────────────────────
    case "dendro":
      return (
        <div className="absolute top-2 right-2 pointer-events-none z-20 w-28 h-28 select-none"
          style={{ opacity, filter: glowFilter }}>
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Vine */}
            <path d="M8,114 C28,82 58,62 90,20"
              stroke={isCyber ? "#34D399" : "#059669"}
              strokeWidth={isCyber ? "2" : "3.5"} fill="none" strokeLinecap="round" />
            {/* Leaves */}
            {([
              { cx: 80, cy: 36, rx: 14, ry: 7.5, rot: -32 },
              { cx: 58, cy: 64, rx: 12, ry: 6.5, rot: 22 },
              { cx: 36, cy: 86, rx: 10, ry: 5.5, rot: -12 },
            ] as { cx:number,cy:number,rx:number,ry:number,rot:number }[]).map(({ cx, cy, rx, ry, rot }, i) => (
              <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry}
                transform={`rotate(${rot} ${cx} ${cy})`}
                fill={isCyber ? "#10B98170" : "#10B981"}
                stroke={isCyber ? "none" : "#047857"} strokeWidth={sw} />
            ))}
            {/* Accent leaf */}
            <ellipse cx="100" cy="14" rx="9" ry="5" transform="rotate(-45 100 14)"
              fill={isCyber ? "#34D39975" : "#34D399"}
              stroke={isCyber ? "none" : "#059669"} strokeWidth="1.5" />
          </svg>
        </div>
      );

    // ── PHYSICAL — Metallic cross-hatch fragment (top-right) ─────────────────
    case "physical":
      return (
        <div className="absolute top-2 right-2 pointer-events-none z-20 w-24 h-24 select-none"
          style={{ opacity: isCyber ? 0.70 : 0.60, filter: glowFilter }}>
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <line x1="60" y1="0" x2="100" y2="40" stroke={isCyber ? "#CBD5E1" : "#475569"} strokeWidth="2.5" />
            <line x1="80" y1="0" x2="100" y2="20" stroke={isCyber ? "#CBD5E190" : "#64748B"} strokeWidth="1.5" />
            <line x1="40" y1="0" x2="100" y2="60" stroke={isCyber ? "#94A3B860" : "#94A3B8"} strokeWidth="1" />
            <polygon points="84,4 100,0 100,16 90,20 80,10"
              fill={isCyber ? "#E2E8F035" : "#CBD5E1"}
              stroke={isCyber ? "#CBD5E1" : "#475569"} strokeWidth="1.5" />
          </svg>
        </div>
      );

    // ── NEUTRAL fallback — simple geometric ──────────────────────────────────
    default:
      return (
        <div className="absolute top-2 right-2 pointer-events-none z-20 w-20 h-20 select-none"
          style={{ opacity: isCyber ? 0.65 : 0.52, filter: glowFilter }}>
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <polygon points="60,0 80,40 60,80 40,40"
              fill={isCyber ? `${primaryColor}45` : primaryColor}
              stroke={isCyber ? `${primaryColor}80` : "#000"} strokeWidth="2" />
            <polygon points="70,0 80,20 70,40 60,20"
              fill={isCyber ? `${secondaryColor}55` : secondaryColor} />
          </svg>
        </div>
      );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ── LEFT-SIDE SECONDARY ACCENT (top-left, smaller) ───────────────────────────
// Only rendered for elements that benefit from dual-corner decoration.
// ─────────────────────────────────────────────────────────────────────────────

function LeftAccent({ theme, isCyber }: { theme: ElementTheme; isCyber: boolean }) {
  const { category, primaryColor } = theme;
  const opacity = isCyber ? 0.55 : 0.50;
  const filter = isCyber ? `drop-shadow(0 0 10px ${primaryColor}80)` : "none";
  const sw = "1.5";

  switch (category) {
    case "glacio":
      return (
        <div className="absolute top-0 left-0 pointer-events-none z-20 w-16 h-16 select-none"
          style={{ opacity, filter }}>
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <polygon points="0,0 16,0 0,54" fill={isCyber ? "#38BDF8" : "#38BDF8"} stroke={isCyber ? "none" : "#0284C7"} strokeWidth={sw} />
            <polygon points="0,0 26,0 0,32" fill={isCyber ? "#7DD3FC" : "#7DD3FC"} stroke={isCyber ? "none" : "#0284C7"} strokeWidth="1" opacity="0.8" />
          </svg>
        </div>
      );
    case "fusion":
      return (
        <div className="absolute top-0 left-0 pointer-events-none z-20 w-14 h-14 select-none"
          style={{ opacity, filter }}>
          <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M0,56 C0,28 20,10 8,0 C22,14 16,36 0,56Z"
              fill={isCyber ? "#F9731678" : "#EA580C"}
              stroke={isCyber ? "none" : "#C2410C"} strokeWidth={sw} />
          </svg>
        </div>
      );
    case "electro":
      return (
        <div className="absolute top-0 left-0 pointer-events-none z-20 w-12 h-16 select-none"
          style={{ opacity, filter }}>
          <svg viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <polygon points="30,0 12,32 26,32 8,64 44,22 26,22 42,0"
              fill={isCyber ? "#C084FC75" : "#A855F7"}
              stroke={isCyber ? "none" : "#7E22CE"} strokeWidth={sw} />
          </svg>
        </div>
      );
    case "havoc":
      return (
        <div className="absolute top-0 left-0 pointer-events-none z-20 w-14 h-14 select-none"
          style={{ opacity: opacity * 0.85, filter }}>
          <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <polygon points="0,0 22,0 8,22 26,16 0,48"
              fill={isCyber ? "#EF444430" : "#DC2626"}
              stroke={isCyber ? "#F8717160" : "#991B1B"} strokeWidth={sw} />
          </svg>
        </div>
      );
    case "hydro":
      return (
        <div className="absolute bottom-6 left-6 pointer-events-none z-20 w-12 h-12 select-none"
          style={{ opacity: opacity * 0.9, filter }}>
          <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M25,2 C10,18 2,28 2,36 C2,44 12,50 25,50 C38,50 48,44 48,36 C48,28 40,18 25,2Z"
              fill={isCyber ? "#38BDF855" : "#0EA5E9"}
              stroke={isCyber ? "none" : "#0284C7"} strokeWidth={sw} />
          </svg>
        </div>
      );
    case "spectro":
      return (
        <div className="absolute top-0 left-0 pointer-events-none z-20 w-12 h-12 select-none"
          style={{ opacity: opacity * 0.9, filter }}>
          <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <polygon points="25,0 30,18 48,18 35,30 40,48 25,38 10,48 15,30 2,18 20,18"
              fill={isCyber ? "#FDE04755" : "#FACC15"}
              stroke={isCyber ? "none" : "#CA8A04"} strokeWidth="1" />
          </svg>
        </div>
      );
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ── AMBIENT ATMOSPHERIC LAYER ─────────────────────────────────────────────────
// ELEMENT → colors. THEME → intensity, character (glow vs flat tint).
// ─────────────────────────────────────────────────────────────────────────────

function AmbientLayer({ theme, isCyber }: { theme: ElementTheme; isCyber: boolean }) {
  const { category, primaryColor, glowColorRgba } = theme;

  if (isCyber) {
    // Luminous radial corner blooms — breathing pulse
    const bg: Record<ElementCategory | "neutral", string> = {
      glacio:   "radial-gradient(circle at 92% 8%, rgba(125,211,252,0.26) 0%, transparent 38%), radial-gradient(circle at 8% 90%, rgba(56,189,248,0.18) 0%, transparent 32%), radial-gradient(circle at 90% 90%, rgba(56,189,248,0.22) 0%, transparent 40%)",
      fusion:   "radial-gradient(circle at 92% 8%, rgba(255,107,53,0.30) 0%, transparent 40%), radial-gradient(circle at 8% 88%, rgba(239,68,68,0.16) 0%, transparent 35%)",
      electro:  "radial-gradient(circle at 92% 8%, rgba(168,85,247,0.30) 0%, transparent 38%), radial-gradient(circle at 8% 86%, rgba(192,132,252,0.14) 0%, transparent 32%)",
      aero:     "radial-gradient(circle at 92% 8%, rgba(45,212,191,0.28) 0%, transparent 40%), radial-gradient(circle at 8% 88%, rgba(94,234,212,0.12) 0%, transparent 32%)",
      spectro:  "radial-gradient(circle at 92% 8%, rgba(250,204,21,0.28) 0%, transparent 40%), radial-gradient(circle at 8% 88%, rgba(234,179,8,0.12) 0%, transparent 32%)",
      havoc:    "radial-gradient(circle at 88% 10%, rgba(220,38,38,0.26) 0%, transparent 38%), radial-gradient(circle at 10% 90%, rgba(147,51,234,0.18) 0%, transparent 35%)",
      hydro:    "radial-gradient(circle at 88% 8%, rgba(2,132,199,0.28) 0%, transparent 40%), radial-gradient(circle at 8% 88%, rgba(56,189,248,0.14) 0%, transparent 32%)",
      dendro:   "radial-gradient(circle at 88% 8%, rgba(16,185,129,0.28) 0%, transparent 40%), radial-gradient(circle at 8% 88%, rgba(52,211,153,0.12) 0%, transparent 32%)",
      physical: "radial-gradient(circle at 88% 8%, rgba(148,163,184,0.22) 0%, transparent 38%)",
      neutral:  `radial-gradient(circle at 88% 8%, ${glowColorRgba} 0%, transparent 42%)`,
    };
    return (
      <motion.div
        animate={{ opacity: [0.18, 0.46, 0.18] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{ background: bg[category] ?? bg.neutral }}
      />
    );
  } else {
    // Neo-Brutalism: directional flat color wash — no blur, clearly elemental
    // Opacity is animated between 0.65–1.0 of base to create subtle breathing shimmer
    const bg: Record<ElementCategory | "neutral", string> = {
      glacio:   "linear-gradient(135deg, rgba(14,165,233,0.18) 0%, transparent 45%), linear-gradient(315deg, rgba(56,189,248,0.13) 0%, transparent 40%)",
      fusion:   "linear-gradient(135deg, rgba(239,68,68,0.17) 0%, transparent 42%), linear-gradient(225deg, rgba(249,115,22,0.12) 0%, transparent 38%)",
      electro:  "linear-gradient(135deg, rgba(168,85,247,0.16) 0%, transparent 42%), linear-gradient(315deg, rgba(192,132,252,0.10) 0%, transparent 36%)",
      aero:     "linear-gradient(135deg, rgba(45,212,191,0.16) 0%, transparent 44%), linear-gradient(270deg, rgba(94,234,212,0.10) 0%, transparent 32%)",
      spectro:  "linear-gradient(135deg, rgba(250,204,21,0.18) 0%, transparent 44%), linear-gradient(315deg, rgba(234,179,8,0.10) 0%, transparent 36%)",
      havoc:    "linear-gradient(135deg, rgba(220,38,38,0.16) 0%, transparent 42%), linear-gradient(315deg, rgba(147,51,234,0.12) 0%, transparent 36%)",
      hydro:    "linear-gradient(225deg, rgba(2,132,199,0.18) 0%, transparent 44%), linear-gradient(45deg, rgba(56,189,248,0.10) 0%, transparent 36%)",
      dendro:   "linear-gradient(135deg, rgba(16,185,129,0.17) 0%, transparent 44%), linear-gradient(315deg, rgba(52,211,153,0.10) 0%, transparent 36%)",
      physical: `linear-gradient(135deg, rgba(148,163,184,0.14) 0%, transparent 40%)`,
      neutral:  `linear-gradient(135deg, ${primaryColor}16 0%, transparent 40%)`,
    };
    return (
      <motion.div
        animate={{ opacity: [0.7, 1.0, 0.7] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{ background: bg[category] ?? bg.neutral }}
      />
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ── NEO-BRUTALISM ELEMENTAL PERIMETER ACCENT ──────────────────────────────────
// Adds a thin element-colored inner border around the modal frame.
// This frames the entire viewport in the character's element color —
// a crisp, structural signal of elemental identity.
// Not used in Cyberpunk (border glow handles this).
// ─────────────────────────────────────────────────────────────────────────────

function NeoPerimeterAccent({ theme }: { theme: ElementTheme }) {
  return (
    <motion.div
      animate={{ opacity: [0.35, 0.65, 0.35] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        boxShadow: `inset 0 0 0 3px ${theme.primaryColor}50`,
        borderRadius: "inherit",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ── PARTICLE SHAPE SELECTOR ───────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function getParticleShape(category: ElementCategory | "neutral", i: number): ParticleShape {
  switch (category) {
    case "glacio":   return i % 4 === 0 ? "snowflake" : i % 3 === 0 ? "diamond" : "circle";
    case "fusion":   return i % 3 === 0 ? "spark" : "circle";
    case "electro":  return i % 2 === 0 ? "spark" : "square";
    case "aero":     return i % 3 === 0 ? "circle" : "diamond";
    case "spectro":  return i % 3 === 0 ? "star" : "circle";
    case "havoc":    return i % 2 === 0 ? "square" : "diamond";
    case "hydro":    return i % 3 === 0 ? "drop" : "circle";
    case "dendro":   return i % 3 === 0 ? "leaf" : "circle";
    case "physical": return i % 2 === 0 ? "diamond" : "square";
    default:         return "circle";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ── PARTICLE ANIMATION BUILDER ────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function buildAnimate(p: ParticleSpec, particleType: string, isCyber: boolean) {
  const hi = isCyber ? 0.86 : 0.75;
  const mid = isCyber ? 0.55 : 0.50;

  switch (particleType) {
    case "ice":
      return {
        initial: { x: `${p.x}%`, y: `${p.y}%`, opacity: 0, scale: 0.5, rotate: 0 },
        animate: {
          y: [`${p.y}%`, `${Math.max(0, p.y - 18)}%`],
          x: [`${p.x}%`, `${p.x + (p.id % 2 === 0 ? 3 : -3)}%`],
          opacity: [0, hi, mid, 0],
          scale: [0.5, 1.15, 0.9, 0.4],
          rotate: [0, 45, 90],
        },
      };
    case "ember":
      return {
        initial: { x: `${p.x}%`, y: `${p.y + 10}%`, opacity: 0, scale: 0.5 },
        animate: {
          y: [`${p.y + 10}%`, `${Math.max(0, p.y - 24)}%`],
          x: [`${p.x}%`, `${p.x + (p.id % 2 === 0 ? 5 : -5)}%`],
          opacity: [0, hi, mid, 0],
          scale: [0.5, 1.2, 0.7, 0.3],
        },
      };
    case "spark":
      return {
        initial: { x: `${p.x}%`, y: `${p.y}%`, opacity: 0, scale: 0.3 },
        animate: {
          opacity: [0, hi, 0.15, hi * 0.9, 0],
          scale: [0.3, 1.4, 0.8, 1.1, 0.2],
        },
      };
    case "wind":
      return {
        initial: { x: `${p.x}%`, y: `${p.y}%`, opacity: 0, scale: 0.8 },
        animate: {
          x: [`${p.x}%`, `${Math.min(96, p.x + 22)}%`],
          y: [`${p.y}%`, `${Math.max(2, p.y - 8)}%`],
          opacity: [0, hi, mid, 0],
          scale: [0.8, 1.1, 0.8, 0.5],
        },
      };
    case "droplet":
      return {
        initial: { x: `${p.x}%`, y: `${Math.max(2, p.y - 5)}%`, opacity: 0, scale: 0.6 },
        animate: {
          y: [`${Math.max(2, p.y - 5)}%`, `${Math.min(96, p.y + 12)}%`],
          opacity: [0, hi, mid, 0],
          scale: [0.6, 1.0, 0.8, 0.3],
        },
      };
    case "shadow":
      return {
        initial: { x: `${p.x}%`, y: `${p.y}%`, opacity: 0, scale: 0.4 },
        animate: {
          y: [`${p.y}%`, `${Math.min(96, p.y + 10)}%`, `${p.y}%`],
          opacity: [0, hi * 0.85, 0.1, hi * 0.7, 0],
          scale: [0.4, 1.2, 0.7, 1.0, 0.3],
        },
      };
    case "mote":
    case "neutral":
    default:
      return {
        initial: { x: `${p.x}%`, y: `${p.y}%`, opacity: 0, scale: 0.6 },
        animate: {
          y: [`${p.y}%`, `${Math.max(2, p.y - 12)}%`, `${p.y}%`],
          opacity: [0.2, hi, 0.2],
          scale: [0.6, 1.1, 0.6],
        },
      };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ── PARTICLE SHAPE RENDERER ───────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function RenderParticleShape({ p, isCyber }: { p: ParticleSpec; isCyber: boolean }) {
  const cyberShadow = `0 0 ${p.size * 2.5}px ${p.color}, 0 0 ${p.size * 4}px ${p.color}55`;
  const outline = isCyber ? "none" : `0.5px solid ${p.color}`;

  switch (p.shape) {
    case "snowflake":
      return (
        <span style={{
          fontSize: `${p.size * 1.5}px`, lineHeight: 1,
          color: isCyber ? "#BAE6FD" : "#0EA5E9",
          filter: isCyber ? `drop-shadow(0 0 5px ${p.color})` : "none",
          fontWeight: isCyber ? "normal" : "bold",
        }}>❄</span>
      );
    case "star":
      return (
        <span style={{
          fontSize: `${p.size * 1.4}px`, lineHeight: 1,
          color: isCyber ? "#FEF08A" : "#EAB308",
          filter: isCyber ? `drop-shadow(0 0 5px ${p.color})` : "none",
        }}>✦</span>
      );
    case "leaf":
      return (
        <span style={{
          fontSize: `${p.size * 1.3}px`, lineHeight: 1,
          color: isCyber ? "#6EE7B7" : "#059669",
          filter: isCyber ? `drop-shadow(0 0 4px ${p.color})` : "none",
        }}>🍃</span>
      );
    case "drop":
      return (
        <span style={{
          fontSize: `${p.size * 1.2}px`, lineHeight: 1,
          color: isCyber ? "#7DD3FC" : "#0284C7",
          filter: isCyber ? `drop-shadow(0 0 4px ${p.color})` : "none",
        }}>💧</span>
      );
    case "spark":
      return (
        <div style={{
          width: `${p.size * 0.4}px`, height: `${p.size * 2}px`,
          backgroundColor: p.color, borderRadius: "2px",
          boxShadow: isCyber ? cyberShadow : "none",
          outline,
        }} />
      );
    case "square":
      return (
        <div style={{
          width: `${p.size}px`, height: `${p.size}px`,
          backgroundColor: isCyber ? `${p.color}CC` : p.color,
          borderRadius: "2px",
          boxShadow: isCyber ? cyberShadow : "none",
          outline,
        }} />
      );
    case "diamond":
      return (
        <div style={{
          width: `${p.size}px`, height: `${p.size}px`,
          backgroundColor: isCyber ? `${p.color}CC` : p.color,
          borderRadius: "2px", transform: "rotate(45deg)",
          boxShadow: isCyber ? cyberShadow : "none",
          outline,
        }} />
      );
    case "circle":
    default:
      return (
        <div style={{
          width: `${p.size}px`, height: `${p.size}px`,
          backgroundColor: isCyber ? `${p.color}CC` : p.color,
          borderRadius: "9999px",
          boxShadow: isCyber ? cyberShadow : "none",
        }} />
      );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

export function ElementParticles({ theme, isCyber }: ElementParticlesProps) {
  const particles = useMemo<ParticleSpec[]>(() => {
    // Neo gets more particles than before (was 14→18), Cyber stays at 24
    const count = isCyber ? 24 : 18;
    return Array.from({ length: count }, (_, i) => {
      const corner = i % 4;
      let x = 0, y = 0;
      if      (corner === 0) { x = (i * 4) % 28 + 2;  y = (i * 6) % 35 + 3; }
      else if (corner === 1) { x = (i * 4) % 28 + 70; y = (i * 5) % 35 + 3; }
      else if (corner === 2) { x = (i * 4) % 30 + 2;  y = (i * 5) % 35 + 62; }
      else                   { x = (i * 4) % 30 + 68; y = (i * 6) % 35 + 60; }

      return {
        id: i,
        x: Math.floor(x), y: Math.floor(y),
        size: Math.floor((i % 4) * 2 + 4),
        duration: Math.floor((i % 5) * 3 + 8),
        delay: Math.floor((i % 5) * 12) / 10,
        color: theme.particleColors[i % theme.particleColors.length],
        shape: getParticleShape(theme.category, i),
      };
    });
  }, [theme, isCyber]);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none z-10 motion-reduce:hidden select-none"
      style={{ opacity: isCyber ? 0.92 : 0.82 }}
    >
      {/* ── Corner Decorative Motifs ── */}
      <CornerMotif theme={theme} isCyber={isCyber} />
      <LeftAccent theme={theme} isCyber={isCyber} />

      {/* ── Neo-Brutalism elemental perimeter inner border ── */}
      {!isCyber && <NeoPerimeterAccent theme={theme} />}

      {/* ── Floating Particles ── */}
      {particles.map((p) => {
        const { initial, animate } = buildAnimate(p, theme.particleType, isCyber);
        return (
          <motion.div
            key={p.id}
            initial={initial}
            animate={animate}
            transition={{ duration: p.duration, repeat: Infinity, repeatType: "loop", ease: "easeInOut", delay: p.delay }}
            className="absolute flex items-center justify-center"
            style={{ width: `${p.size}px`, height: `${p.size}px`, left: 0, top: 0 }}
          >
            <RenderParticleShape p={p} isCyber={isCyber} />
          </motion.div>
        );
      })}

      {/* ── Atmospheric Ambient Layer ── */}
      <AmbientLayer theme={theme} isCyber={isCyber} />
    </div>
  );
}
