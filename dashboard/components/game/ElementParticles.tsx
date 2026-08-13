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

type ParticleShape = "circle" | "diamond" | "square" | "snowflake" | "star" | "leaf" | "drop" | "spark" | "ring";

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
  const { category, primaryColor } = theme;
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
            <path d="M85,140 C85,95 112,62 92,18 C76,52 66,30 72,0 C46,32 38,84 60,115 C50,98 50,82 61,72 C61,92 76,120 85,140Z"
              fill="url(#flameG)"
              stroke={isCyber ? "none" : "#C2410C"} strokeWidth={sw} />
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
            <polygon points="64,0 32,58 56,58 26,120 82,46 56,46 80,0"
              fill={isCyber ? "#C084FC" : "#9333EA"}
              stroke={isCyber ? "none" : "#7E22CE"} strokeWidth={sw} />
            <line x1="18" y1="18" x2="30" y2="6"
              stroke={isCyber ? "#E9D5FF" : "#7E22CE"} strokeWidth="2.5" strokeLinecap="round" />
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
            <circle cx="112" cy="8" r={isCyber ? 3 : 4.5} fill={isCyber ? "#5EEAD4" : "#0F766E"} />
          </svg>
        </div>
      );

    // ── SPECTRO — 8-pointed star / prism (top-right) ─────────────────────────
    case "spectro":
      return (
        <div className="absolute top-2 right-2 pointer-events-none z-20 w-28 h-28 select-none"
          style={{ opacity, filter: glowFilter }}>
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <polygon points="78,8 84,30 102,18 90,36 112,42 90,48 102,66 84,54 78,76 72,54 54,66 66,48 44,42 66,36 54,18 72,30"
              fill={isCyber ? "#FDE04770" : "#FACC15"}
              stroke={isCyber ? "none" : "#CA8A04"} strokeWidth={sw} />
            <polygon points="106,4 109,14 118,14 111,20 114,30 106,24 98,30 101,20 94,14 103,14"
              fill={isCyber ? "#FEF08A" : "#EAB308"}
              stroke={isCyber ? "none" : "#CA8A04"} strokeWidth="1" />
          </svg>
        </div>
      );

    // ── HAVOC — Fractured void shards (top-right) ────────────────────────────
    case "havoc":
      return (
        <div className="absolute top-2 right-2 pointer-events-none z-20 w-28 h-28 select-none"
          style={{ opacity, filter: glowFilter }}>
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <polygon points="78,4 112,30 100,64 68,42 58,8"
              fill={isCyber ? "#EF444438" : "#DC2626"}
              stroke={isCyber ? "#F8717170" : "#991B1B"} strokeWidth={sw} />
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
            <path d="M8,72 C28,52 48,92 68,72 C88,52 108,92 120,72"
              stroke={isCyber ? "#38BDF8" : "#0284C7"}
              strokeWidth={isCyber ? "2.5" : "4"} fill="none" strokeLinecap="round" />
            {(["90,18", "110,38"] as string[]).map((pt, i) => {
              const [cx, cy] = pt.split(",").map(Number);
              return (
                <path key={i} d={`M${cx},${cy-14} C${cx-9},${cy-7} ${cx-9},${cy} ${cx},${cy+5} C${cx+9},${cy} ${cx+9},${cy-7} ${cx},${cy-14}Z`}
                  fill={isCyber ? "#38BDF870" : "#0EA5E9"}
                  stroke={isCyber ? "none" : "#0369A1"} strokeWidth="1.5" />
              );
            })}
          </svg>
        </div>
      );

    // ── DENDRO — Leaf cluster (top-right) ────────────────────────────────────
    case "dendro":
      return (
        <div className="absolute top-2 right-2 pointer-events-none z-20 w-28 h-28 select-none"
          style={{ opacity, filter: glowFilter }}>
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M8,114 C28,82 58,62 90,20"
              stroke={isCyber ? "#34D399" : "#059669"}
              strokeWidth={isCyber ? "2" : "3.5"} fill="none" strokeLinecap="round" />
            <ellipse cx="80" cy="36" rx="14" ry="7.5" transform="rotate(-32 80 36)"
              fill={isCyber ? "#10B98170" : "#10B981"} stroke={isCyber ? "none" : "#047857"} strokeWidth={sw} />
            <ellipse cx="100" cy="14" rx="9" ry="5" transform="rotate(-45 100 14)"
              fill={isCyber ? "#34D39975" : "#34D399"} stroke={isCyber ? "none" : "#059669"} strokeWidth="1.5" />
          </svg>
        </div>
      );

    // ── EARTH — Mountain Peak / Geode Fragment (top-right) ───────────────────
    case "earth":
      return (
        <div className="absolute top-2 right-2 pointer-events-none z-20 w-28 h-28 select-none"
          style={{ opacity, filter: glowFilter }}>
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <polygon points="60,10 110,100 10,100"
              fill={isCyber ? "#FBBF2435" : "#D97706"} stroke={isCyber ? "#FBBF24" : "#B45309"} strokeWidth={sw} />
            <polygon points="60,10 110,100 60,85"
              fill={isCyber ? "#D9770650" : "#B45309"} stroke="none" />
          </svg>
        </div>
      );

    // ── COSMIC — Orbital Ring / Astral Star (top-right) ──────────────────────
    case "cosmic":
      return (
        <div className="absolute top-2 right-2 pointer-events-none z-20 w-28 h-28 select-none"
          style={{ opacity, filter: glowFilter }}>
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <ellipse cx="60" cy="60" rx="48" ry="18" transform="rotate(-25 60 60)"
              stroke={isCyber ? "#A5B4FC" : "#4338CA"} strokeWidth={isCyber ? "2.5" : "4"} fill="none" />
            <circle cx="60" cy="60" r="14"
              fill={isCyber ? "#818CF8" : "#6366F1"} stroke={isCyber ? "#EEF2FF" : "#312E81"} strokeWidth="2" />
          </svg>
        </div>
      );

    // ── TOXIC — Corrosion Flask / Venom Droplet (top-right) ─────────────────
    case "toxic":
      return (
        <div className="absolute top-2 right-2 pointer-events-none z-20 w-28 h-28 select-none"
          style={{ opacity, filter: glowFilter }}>
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="70" cy="70" r="28" fill={isCyber ? "#84CC1640" : "#84CC16"} stroke={isCyber ? "#BEF264" : "#4D7C0F"} strokeWidth={sw} />
            <circle cx="58" cy="60" r="6" fill={isCyber ? "#BEF264" : "#ECFCCB"} />
            <circle cx="82" cy="74" r="4" fill={isCyber ? "#BEF264" : "#ECFCCB"} />
          </svg>
        </div>
      );

    // ── DB LEGENDS COLOR ATTRIBUTES (RED/BLU/GRN/PUR/YEL) ─────────────────────
    case "db_red":
    case "db_blu":
    case "db_grn":
    case "db_pur":
    case "db_yel":
      return (
        <div className="absolute top-2 right-2 pointer-events-none z-20 w-24 h-24 select-none"
          style={{ opacity, filter: glowFilter }}>
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <polygon points="50,0 100,50 50,100 0,50"
              fill={isCyber ? `${primaryColor}40` : primaryColor}
              stroke={isCyber ? primaryColor : "#000"} strokeWidth={isCyber ? "2" : "3.5"} />
            <circle cx="50" cy="50" r="16" fill={isCyber ? "#FFF" : "#FFF"} opacity="0.9" />
          </svg>
        </div>
      );

    // ── PHYSICAL / NEUTRAL ───────────────────────────────────────────────────
    case "physical":
    default:
      return (
        <div className="absolute top-2 right-2 pointer-events-none z-20 w-24 h-24 select-none"
          style={{ opacity: isCyber ? 0.70 : 0.60, filter: glowFilter }}>
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <line x1="60" y1="0" x2="100" y2="40" stroke={isCyber ? "#CBD5E1" : "#475569"} strokeWidth="2.5" />
            <line x1="80" y1="0" x2="100" y2="20" stroke={isCyber ? "#CBD5E190" : "#64748B"} strokeWidth="1.5" />
            <polygon points="84,4 100,0 100,16 90,20 80,10"
              fill={isCyber ? "#E2E8F035" : "#CBD5E1"}
              stroke={isCyber ? "#CBD5E1" : "#475569"} strokeWidth="1.5" />
          </svg>
        </div>
      );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ── LEFT-SIDE SECONDARY ACCENT (top-left, smaller) ───────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function LeftAccent({ theme, isCyber }: { theme: ElementTheme; isCyber: boolean }) {
  const { category, primaryColor } = theme;
  const opacity = isCyber ? 0.55 : 0.50;
  const filter = isCyber ? `drop-shadow(0 0 10px ${primaryColor}80)` : "none";
  const sw = "1.5";

  switch (category) {
    case "glacio":
      return (
        <div className="absolute top-0 left-0 pointer-events-none z-20 w-16 h-16 select-none" style={{ opacity, filter }}>
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <polygon points="0,0 16,0 0,54" fill="#38BDF8" stroke={isCyber ? "none" : "#0284C7"} strokeWidth={sw} />
          </svg>
        </div>
      );
    case "fusion":
      return (
        <div className="absolute top-0 left-0 pointer-events-none z-20 w-14 h-14 select-none" style={{ opacity, filter }}>
          <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M0,56 C0,28 20,10 8,0 C22,14 16,36 0,56Z" fill={isCyber ? "#F9731678" : "#EA580C"} stroke={isCyber ? "none" : "#C2410C"} strokeWidth={sw} />
          </svg>
        </div>
      );
    case "electro":
      return (
        <div className="absolute top-0 left-0 pointer-events-none z-20 w-12 h-16 select-none" style={{ opacity, filter }}>
          <svg viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <polygon points="30,0 12,32 26,32 8,64 44,22 26,22 42,0" fill={isCyber ? "#C084FC75" : "#A855F7"} stroke={isCyber ? "none" : "#7E22CE"} strokeWidth={sw} />
          </svg>
        </div>
      );
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ── AMBIENT ATMOSPHERIC LAYER ─────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function AmbientLayer({ theme, isCyber }: { theme: ElementTheme; isCyber: boolean }) {
  const { category, primaryColor, glowColorRgba } = theme;

  if (isCyber) {
    return (
      <motion.div
        animate={{ opacity: [0.18, 0.46, 0.18] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 90% 10%, ${glowColorRgba} 0%, transparent 45%), radial-gradient(circle at 10% 90%, ${primaryColor}22 0%, transparent 40%)`,
        }}
      />
    );
  } else {
    return (
      <motion.div
        animate={{ opacity: [0.7, 1.0, 0.7] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}20 0%, transparent 45%), linear-gradient(315deg, ${primaryColor}15 0%, transparent 40%)`,
        }}
      />
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ── NEO-BRUTALISM ELEMENTAL PERIMETER ACCENT ──────────────────────────────────
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
    case "aero":     return i % 3 === 0 ? "ring" : "diamond";
    case "spectro":  return i % 3 === 0 ? "star" : "circle";
    case "havoc":    return i % 2 === 0 ? "square" : "diamond";
    case "hydro":    return i % 3 === 0 ? "drop" : "circle";
    case "dendro":   return i % 3 === 0 ? "leaf" : "circle";
    case "earth":    return i % 3 === 0 ? "diamond" : "square";
    case "cosmic":   return i % 3 === 0 ? "star" : "ring";
    case "toxic":    return i % 3 === 0 ? "drop" : "circle";
    case "db_red":
    case "db_blu":
    case "db_grn":
    case "db_pur":
    case "db_yel":   return i % 2 === 0 ? "diamond" : "circle";
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
    case "cosmic":
    case "toxic":
    case "db_red":
    case "db_blu":
    case "db_grn":
    case "db_pur":
    case "db_yel":
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
    case "ring":
      return (
        <div style={{
          width: `${p.size * 1.2}px`, height: `${p.size * 1.2}px`,
          border: `1.5px solid ${p.color}`,
          borderRadius: "9999px",
          boxShadow: isCyber ? cyberShadow : "none",
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
