import type { Variants, Transition } from "framer-motion";

// ─── Shared Spring Config ─────────────────────────────────────────────────────

export const springConfig: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

export const smoothSpring: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 28,
  mass: 1.2,
};

export const themeTransition: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 24,
  duration: 0.6,
};

// ─── Page Entrance ────────────────────────────────────────────────────────────

export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// ─── Bento Grid Container ─────────────────────────────────────────────────────

export const gridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// ─── Card Entrance ────────────────────────────────────────────────────────────

export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 32,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 320,
      damping: 28,
    },
  },
};

// ─── Brutal Card Hover ────────────────────────────────────────────────────────
// In brutal mode: card "lifts" by translating against its shadow offset

export const brutalHoverVariants: Variants = {
  rest: {
    x: 0,
    y: 0,
    boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
    transition: springConfig,
  },
  hover: {
    x: -4,
    y: -4,
    boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)",
    transition: springConfig,
  },
  tap: {
    x: 2,
    y: 2,
    boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)",
    transition: { duration: 0.08 },
  },
};

// ─── Cyber Card Hover ─────────────────────────────────────────────────────────
// In cyber mode: glow intensifies and card scales subtly

export const cyberHoverVariants: Variants = {
  rest: {
    scale: 1,
    boxShadow:
      "0 0 20px rgba(0, 245, 255, 0.25), 0 0 60px rgba(0, 245, 255, 0.08), inset 0 0 20px rgba(0, 245, 255, 0.02)",
    transition: { duration: 0.3, ease: "easeOut" },
  },
  hover: {
    scale: 1.015,
    boxShadow:
      "0 0 40px rgba(0, 245, 255, 0.5), 0 0 100px rgba(191, 95, 255, 0.25), inset 0 0 30px rgba(0, 245, 255, 0.05)",
    transition: { duration: 0.3, ease: "easeOut" },
  },
  tap: {
    scale: 0.99,
    transition: { duration: 0.1 },
  },
};

// ─── Theme Toggle ─────────────────────────────────────────────────────────────

export const toggleTrackBrutal = {
  backgroundColor: "#FFF5E4",
  boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)",
  borderColor: "#000000",
};

export const toggleTrackCyber = {
  backgroundColor: "rgba(5, 8, 22, 0.9)",
  boxShadow:
    "0 0 12px rgba(0, 245, 255, 0.6), 0 0 30px rgba(0, 245, 255, 0.2)",
  borderColor: "#00F5FF",
};

export const toggleThumbBrutal = {
  x: 0,
  backgroundColor: "#FF6B35",
  boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)",
};

export const toggleThumbCyber = {
  x: 32,
  backgroundColor: "#00F5FF",
  boxShadow:
    "0 0 10px rgba(0, 245, 255, 0.9), 0 0 20px rgba(0, 245, 255, 0.5)",
};

// ─── Badge Pulse ──────────────────────────────────────────────────────────────

export const statusPulse: Variants = {
  animate: {
    scale: [1, 1.3, 1],
    opacity: [1, 0.6, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────

export const progressBarVariants: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: (custom: number) => ({
    scaleX: custom / 100,
    originX: 0,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 18,
      delay: 0.5,
    },
  }),
};

// ─── Stagger List Items ───────────────────────────────────────────────────────

export const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

export const listContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.3,
    },
  },
};

// ─── Header Logo ──────────────────────────────────────────────────────────────

export const logoVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 22, delay: 0.1 },
  },
};

// ─── Floating Particle (Cyber BG) ─────────────────────────────────────────────

export const floatVariants: Variants = {
  animate: (i: number) => ({
    y: [0, -20, 0],
    opacity: [0.3, 0.8, 0.3],
    transition: {
      duration: 3 + i * 0.7,
      repeat: Infinity,
      ease: "easeInOut",
      delay: i * 0.4,
    },
  }),
};
