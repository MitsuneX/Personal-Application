"use client";

import React, { useRef, useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform, type TargetAndTransition } from "framer-motion";
import { BentoCard } from "./BentoCard";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { listContainerVariants, listItemVariants } from "@/lib/theme/motionVariants";

import Link from "next/link";
import { 
  Github, 
  Instagram, 
  MessageSquare, 
  Twitter, 
  Disc, 
  Send, 
  Share2, 
  Phone, 
  Brain,
  ArrowUpRight 
} from "lucide-react";

const PLATFORM_ICONS: Record<string, string> = {
  GitHub: "◈",
  "Twitter/X": "𝕏",
  Discord: "◉",
  Instagram: "◎",
  LinkedIn: "▣",
};

const ZODIAC_METADATA: Record<string, { symbol: string; emoji: string; color: string }> = {
  Aries: { symbol: "♈", emoji: "🐏", color: "#EF4444" },
  Taurus: { symbol: "♉", emoji: "🐂", color: "#10B981" },
  Gemini: { symbol: "♊", emoji: "♊", color: "#F59E0B" },
  Cancer: { symbol: "♋", emoji: "🦀", color: "#3B82F6" },
  Leo: { symbol: "♌", emoji: "🦁", color: "#F59E0B" },
  Virgo: { symbol: "♍", emoji: "♍", color: "#EC4899" },
  Libra: { symbol: "♎", emoji: "⚖️", color: "#10B981" },
  Scorpio: { symbol: "♏", emoji: "🦂", color: "#8B5CF6" },
  Sagittarius: { symbol: "♐", emoji: "🏹", color: "#3B82F6" },
  Capricorn: { symbol: "♑", emoji: "🐐", color: "#6B7280" },
  Aquarius: { symbol: "♒", emoji: "🏺", color: "#06B6D4" },
  Pisces: { symbol: "♓", emoji: "🐟", color: "#3B82F6" },
};

const getSocialBrand = (platform: string, handle: string, url?: string) => {
  const plat = platform.toLowerCase();
  const link = url?.toLowerCase() || "";
  const name = handle.toLowerCase();

  if (plat.includes("github") || link.includes("github.com")) {
    return {
      name: "GitHub",
      icon: Github,
      bgCyber: "rgba(24, 28, 41, 0.7)",
      borderCyber: "rgba(148, 163, 184, 0.4)",
      textCyber: "#F8FAFC",
      bgBrutal: "#24292F",
      borderBrutal: "#000000",
      textBrutal: "#FFFFFF",
    };
  }

  if (plat.includes("instagram") || link.includes("instagram.com")) {
    return {
      name: "Instagram",
      icon: Instagram,
      bgCyber: "linear-gradient(135deg, rgba(131, 58, 180, 0.15), rgba(225, 48, 108, 0.15), rgba(253, 29, 29, 0.15))",
      borderCyber: "rgba(225, 48, 108, 0.5)",
      textCyber: "#FF69B4",
      bgBrutal: "#FF007F",
      borderBrutal: "#000000",
      textBrutal: "#FFFFFF",
    };
  }

  if (plat.includes("discord") || name.includes("#") || link.includes("discord")) {
    return {
      name: "Discord",
      icon: MessageSquare,
      bgCyber: "rgba(88, 101, 242, 0.15)",
      borderCyber: "rgba(88, 101, 242, 0.4)",
      textCyber: "#5865F2",
      bgBrutal: "#5865F2",
      borderBrutal: "#000000",
      textBrutal: "#FFFFFF",
    };
  }

  if (plat.includes("twitter") || plat.includes("x.com") || link.includes("x.com") || link.includes("twitter.com")) {
    return {
      name: "X/Twitter",
      icon: Twitter,
      bgCyber: "rgba(255, 255, 255, 0.05)",
      borderCyber: "rgba(255, 255, 255, 0.2)",
      textCyber: "#FFFFFF",
      bgBrutal: "#000000",
      borderBrutal: "#000000",
      textBrutal: "#FFFFFF",
    };
  }

  if (plat.includes("tiktok") || link.includes("tiktok.com")) {
    return {
      name: "TikTok",
      icon: Disc,
      bgCyber: "rgba(1, 1, 1, 0.6)",
      borderCyber: "rgba(0, 245, 255, 0.4)",
      textCyber: "#00F5FF",
      bgBrutal: "#00F2FE",
      borderBrutal: "#000000",
      textBrutal: "#000000",
    };
  }

  if (plat.includes("telegram") || link.includes("t.me") || link.includes("telegram.org")) {
    return {
      name: "Telegram",
      icon: Send,
      bgCyber: "rgba(0, 136, 204, 0.15)",
      borderCyber: "rgba(0, 136, 204, 0.4)",
      textCyber: "#33B5E5",
      bgBrutal: "#0088CC",
      borderBrutal: "#000000",
      textBrutal: "#FFFFFF",
    };
  }

  return {
    name: platform,
    icon: Share2,
    bgCyber: "rgba(255, 255, 255, 0.04)",
    borderCyber: "rgba(255, 255, 255, 0.12)",
    textCyber: "#E0E8FF",
    bgBrutal: "#E0E0E0",
    borderBrutal: "#000000",
    textBrutal: "#000000",
  };
};

const STATUS_CONFIG = {
  online:  { label: "ONLINE",  color: "#22C55E", dotClass: "status-online"  },
  away:    { label: "AWAY",    color: "#F59E0B", dotClass: "status-away"    },
  busy:    { label: "BUSY",    color: "#EF4444", dotClass: "status-busy"    },
  offline: { label: "OFFLINE", color: "#6B7280", dotClass: "status-offline" },
};

// ─── Custom Border Styles Config ──────────────────────────────────────────────

export const BORDER_CONFIGS: Record<string, {
  name: string;
  avatarRing: (isCyber: boolean) => TargetAndTransition;
  avatarBorder: (isCyber: boolean) => string;
  cardStyle: (isCyber: boolean) => React.CSSProperties;
}> = {
  default: {
    name: "Standard Theme",
    avatarRing: (isCyber) => isCyber ? {
      boxShadow: [
        "0 0 0 2px rgba(0,245,255,0.4), 0 0 20px rgba(0,245,255,0.2)",
        "0 0 0 4px rgba(0,245,255,0.7), 0 0 30px rgba(0,245,255,0.4)",
        "0 0 0 2px rgba(0,245,255,0.4), 0 0 20px rgba(0,245,255,0.2)",
      ]
    } : {
      boxShadow: "3px 3px 0px 0px rgba(0,0,0,1)"
    },
    avatarBorder: (isCyber) => isCyber ? "2px solid rgba(0,245,255,0.5)" : "3px solid #000",
    cardStyle: () => ({})
  },
  "cyber-pulse": {
    name: "Cyber Neon Glow",
    avatarRing: () => ({
      boxShadow: [
        "0 0 0 2px rgba(0, 245, 255, 0.4), 0 0 15px rgba(191, 95, 255, 0.4)",
        "0 0 0 5px rgba(191, 95, 255, 0.7), 0 0 30px rgba(0, 245, 255, 0.7)",
        "0 0 0 2px rgba(0, 245, 255, 0.4), 0 0 15px rgba(191, 95, 255, 0.4)",
      ]
    }),
    avatarBorder: () => "2px solid #BF5FFF",
    cardStyle: (isCyber) => isCyber ? {
      border: "1px solid #BF5FFF",
      boxShadow: "0 0 30px rgba(191, 95, 255, 0.35)",
    } : {
      border: "3px solid #BF5FFF",
      boxShadow: "5px 5px 0px 0px #000",
    }
  },
  "golden-crown": {
    name: "Golden Royalty",
    avatarRing: () => ({
      boxShadow: [
        "0 0 0 2px rgba(255, 215, 0, 0.4), 0 0 15px rgba(255, 215, 0, 0.3)",
        "0 0 0 5px rgba(255, 215, 0, 0.8), 0 0 25px rgba(255, 215, 0, 0.6)",
        "0 0 0 2px rgba(255, 215, 0, 0.4), 0 0 15px rgba(255, 215, 0, 0.3)",
      ]
    }),
    avatarBorder: () => "3px double #FFD700",
    cardStyle: (isCyber) => isCyber ? {
      border: "2px solid #FFD700",
      boxShadow: "0 0 30px rgba(255, 215, 0, 0.25)",
    } : {
      border: "4px double #FFD700",
      boxShadow: "6px 6px 0px 0px #000",
    }
  },
  "neon-pink": {
    name: "Vaporwave Pink",
    avatarRing: () => ({
      boxShadow: [
        "0 0 0 2px rgba(255, 20, 147, 0.4), 0 0 15px rgba(255, 20, 147, 0.3)",
        "0 0 0 5px rgba(255, 20, 147, 0.8), 0 0 30px rgba(255, 20, 147, 0.6)",
        "0 0 0 2px rgba(255, 20, 147, 0.4), 0 0 15px rgba(255, 20, 147, 0.3)",
      ]
    }),
    avatarBorder: () => "2px solid #FF1493",
    cardStyle: (isCyber) => isCyber ? {
      border: "1px solid #FF1493",
      boxShadow: "0 0 30px rgba(255, 20, 147, 0.3)",
    } : {
      border: "3px solid #FF1493",
      boxShadow: "5px 5px 0px 0px #000",
    }
  },
  "brutal-bold": {
    name: "Neo-Brutal Heavy",
    avatarRing: () => ({
      boxShadow: "4px 4px 0px 0px #000000"
    }),
    avatarBorder: () => "3px solid #000000",
    cardStyle: () => ({
      border: "4px solid #000000",
      boxShadow: "8px 8px 0px 0px #000000",
    })
  },
  "cyber-target": {
    name: "Cyber Crosshair",
    avatarRing: () => ({
      boxShadow: [
        "0 0 0 1px rgba(0,245,255,0.6), 0 0 0 4px rgba(0,245,255,0.1), 0 0 20px rgba(0,245,255,0.3)",
        "0 0 0 3px rgba(0,245,255,0.9), 0 0 0 6px rgba(0,245,255,0.15), 0 0 35px rgba(0,245,255,0.6)",
        "0 0 0 1px rgba(0,245,255,0.6), 0 0 0 4px rgba(0,245,255,0.1), 0 0 20px rgba(0,245,255,0.3)",
      ]
    }),
    avatarBorder: () => "1px solid rgba(0,245,255,0.8)",
    cardStyle: (isCyber) => isCyber ? {
      border: "1px solid rgba(0,245,255,0.5)",
      boxShadow: "0 0 40px rgba(0,245,255,0.12), inset 0 0 20px rgba(0,245,255,0.03)",
      outline: "1px solid rgba(0,245,255,0.1)",
      outlineOffset: "3px",
    } : {
      border: "3px solid #00D4FF",
      boxShadow: "5px 5px 0px 0px #000",
    }
  },
  "cyber-glitch": {
    name: "Glitch Energy",
    avatarRing: () => ({
      boxShadow: [
        "0 0 0 2px #FF0080, 0 0 0 4px #00F5FF, 0 0 25px rgba(255,0,128,0.5)",
        "0 0 0 2px #00F5FF, 0 0 0 4px #FF0080, 0 0 25px rgba(0,245,255,0.5)",
        "0 0 0 2px #FF0080, 0 0 0 4px #00F5FF, 0 0 25px rgba(255,0,128,0.5)",
      ]
    }),
    avatarBorder: () => "2px solid #FF0080",
    cardStyle: (isCyber) => isCyber ? {
      border: "1px solid #FF0080",
      boxShadow: "0 0 30px rgba(255,0,128,0.25), 0 0 60px rgba(0,245,255,0.1)",
    } : {
      border: "3px solid #FF0080",
      boxShadow: "5px 5px 0px 0px #000",
    }
  },
  "brutal-checker": {
    name: "Retro Checkered",
    avatarRing: () => ({
      boxShadow: "3px 3px 0px 0px #000, 6px 6px 0px 0px #FF6B35, 9px 9px 0px 0px #000"
    }),
    avatarBorder: () => "3px solid #000",
    cardStyle: () => ({
      border: "3px solid #000",
      boxShadow: "6px 6px 0px 0px #FF6B35, 9px 9px 0px 0px #000",
      backgroundImage: "repeating-conic-gradient(rgba(0,0,0,0.03) 0% 25%, transparent 0% 50%) 0 0 / 16px 16px",
    })
  },
  "brutal-vector": {
    name: "Sharp Vector Block",
    avatarRing: () => ({
      boxShadow: "5px 5px 0px 0px #FFD166, 6px 6px 0px 0px #000"
    }),
    avatarBorder: () => "3px solid #000",
    cardStyle: () => ({
      border: "3px solid #000",
      boxShadow: "7px 7px 0px 0px #FFD166, 8px 8px 0px 0px #000",
      borderRadius: "0px",
    })
  },
};

// ─── Welcome Fade Entry Animation ─────────────────────────────────────────────

const welcomeFadeVariants = {
  hidden: {
    opacity: 0,
    y: 10,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

const nameLetterVariants = {
  hidden: { opacity: 0, letterSpacing: "-0.05em" },
  visible: {
    opacity: 1,
    letterSpacing: "0.04em",
    transition: {
      duration: 0.9,
      ease: "easeOut" as const,
    },
  },
};

export interface ProfileCardProps {
  compact?: boolean;
  className?: string;
}

export function ProfileCard({ compact = false, className = "" }: ProfileCardProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const profile = useDashboardStore((s) => s.profile);
  const status = STATUS_CONFIG[profile.status] || STATUS_CONFIG.online;

  // Load Custom Border config
  const borderStyleKey = profile.borderStyle || "default";
  const borderConfig = BORDER_CONFIGS[borderStyleKey] || BORDER_CONFIGS.default;

  // ── 3D Tilt Effect ─────────────────────────────────────────────────────────
  const cardRef = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 120, damping: 18 });
  const springY = useSpring(rawY, { stiffness: 120, damping: 18 });
  const rotateX = useTransform(springY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;
    rawX.set(normX);
    rawY.set(normY);
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  const hobbySkills = useDashboardStore((s) => s.hobbySkills || []);
  const projects = useDashboardStore((s) => s.projects || []);

  const activeHobby = useMemo(() => {
    if (!hobbySkills || hobbySkills.length === 0) return null;
    return hobbySkills.find((h) => h.priority === "Priority") || hobbySkills[0];
  }, [hobbySkills]);

  const activeProject = useMemo(() => {
    if (!projects || projects.length === 0) return null;
    return projects.find((p) => p.status === "Development" || p.status === "Live" || p.isFeatured) || projects[0];
  }, [projects]);

  return (
    <motion.div
      ref={cardRef}
      layout
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      className={className || (compact ? "h-full w-full" : "col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2")}
    >
      <BentoCard
        id="profile-card"
        noHover
        className={compact ? "h-full flex flex-col justify-between !p-4" : ""}
        style={borderConfig.cardStyle(isCyber)}
      >
        {compact ? (
          /* ── Compact Identity Snapshot for Dashboard ── */
          <motion.div
            variants={welcomeFadeVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col justify-between h-full space-y-2.5"
          >
            {/* 1. Top Identity Row: Avatar + Name/Status + View Profile */}
            <div className="flex items-start gap-3 shrink-0">
              {/* Avatar with Animated Theme Ring */}
              <div className="relative shrink-0">
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={borderConfig.avatarRing(isCyber)}
                  transition={
                    isCyber && borderStyleKey !== "brutal-bold"
                      ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.4 }
                  }
                />
                <motion.div
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden flex items-center justify-center relative z-10"
                  animate={{
                    backgroundColor: isCyber ? "#0A0F2C" : "#FF6B35",
                    border: borderConfig.avatarBorder(isCyber),
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className={`text-lg font-black ${isCyber ? "cyber-glow-text" : "text-white"}`}>
                      {profile.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  )}
                </motion.div>

                {/* Status Dot */}
                <div
                  className={`status-dot ${status.dotClass} absolute -bottom-0.5 -right-0.5 border-2`}
                  style={{
                    borderColor: isCyber ? "#0A0F2C" : "#FFFFFF",
                  }}
                />
              </div>

              {/* Name, Status, Location & Action Button */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1.5">
                  <div className="min-w-0 flex-1">
                    <motion.h2
                      className={`font-black text-sm md:text-base leading-tight truncate ${isCyber ? "cyber-gradient-text" : "theme-text-primary"}`}
                      variants={nameLetterVariants}
                      initial="hidden"
                      animate="visible"
                      style={{
                        fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                      }}
                    >
                      {profile.name}
                    </motion.h2>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className={`status-dot ${status.dotClass} !w-1.5 !h-1.5`} />
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider font-mono"
                        style={{ color: status.color }}
                      >
                        {status.label}
                      </span>
                      {profile.location && (
                        <span className="text-[10px] theme-text-muted truncate">
                          · 📍 {profile.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* View Profile Action Button */}
                  <Link
                    href="/profile"
                    className="px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer border select-none group"
                    style={{
                      backgroundColor: isCyber ? "rgba(0, 245, 255, 0.12)" : "#000000",
                      borderColor: isCyber ? "rgba(0, 245, 255, 0.4)" : "#000000",
                      color: isCyber ? "#00F5FF" : "#FFFFFF",
                      boxShadow: isCyber ? "0 0 10px rgba(0, 245, 255, 0.2)" : "2px 2px 0px #000000",
                    }}
                    title="View & customize full profile"
                  >
                    <span>Profile</span>
                    <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>

                {/* Compact Focus / Tagline */}
                <p className="theme-text-secondary text-[11px] font-medium mt-0.5 line-clamp-1">
                  {profile.tagline || (profile.bio ? profile.bio.slice(0, 60) : "Interactive Command Center")}
                </p>
              </div>
            </div>

            {/* 2. Personal Snapshot: Active Pursuit & Streak */}
            {activeHobby ? (
              <div
                className="p-2 rounded-xl border flex items-center justify-between gap-2 shrink-0"
                style={{
                  backgroundColor: isCyber ? "rgba(255, 255, 255, 0.02)" : "#F8FAFC",
                  borderColor: isCyber ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px]">🎯</span>
                    <span className="text-[11px] font-bold theme-text-primary truncate">
                      {activeHobby.name}
                    </span>
                  </div>
                  {activeHobby.progress !== undefined && (
                    <div className="w-full bg-slate-800/40 rounded-full h-1 mt-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, Math.max(5, activeHobby.progress))}%`,
                          backgroundColor: isCyber ? "#00F5FF" : "#0284C7",
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {activeHobby.streak > 0 && (
                    <span
                      className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded border flex items-center gap-0.5 select-none"
                      style={{
                        backgroundColor: isCyber ? "rgba(249, 115, 22, 0.12)" : "#FFF7ED",
                        borderColor: isCyber ? "rgba(249, 115, 22, 0.4)" : "#FDBA74",
                        color: isCyber ? "#FB923C" : "#C2410C",
                      }}
                      title={`${activeHobby.streak} day current streak`}
                    >
                      <span>🔥</span>
                      <span>{activeHobby.streak}d</span>
                    </span>
                  )}
                  {activeHobby.level !== undefined && (
                    <span
                      className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded border select-none"
                      style={{
                        backgroundColor: isCyber ? "rgba(168, 85, 247, 0.12)" : "#FAF5FF",
                        borderColor: isCyber ? "rgba(168, 85, 247, 0.4)" : "#D8B4FE",
                        color: isCyber ? "#C084FC" : "#7E22CE",
                      }}
                      title={`Hobby Level ${activeHobby.level}`}
                    >
                      Lv.{activeHobby.level}
                    </span>
                  )}
                </div>
              </div>
            ) : profile.skills?.length > 0 ? (
              /* Fallback Pursuit: Core Skills Stack */
              <div className="flex flex-wrap gap-1 shrink-0">
                {profile.skills.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
                    style={{
                      backgroundColor: isCyber ? "rgba(0, 245, 255, 0.06)" : "#F1F5F9",
                      borderColor: isCyber ? "rgba(0, 245, 255, 0.25)" : "#CBD5E1",
                      color: isCyber ? "#00F5FF" : "#334155",
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : null}

            {/* 3. Quick Context Row: Current Project / Focus Context */}
            {activeProject && (
              <div className="flex items-center gap-1.5 text-[11px] theme-text-secondary truncate shrink-0">
                <span className="shrink-0 text-xs">📌</span>
                <span className="font-semibold theme-text-primary truncate text-[11px]">
                  {activeProject.name}
                </span>
                {activeProject.status && (
                  <span
                    className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border shrink-0"
                    style={{
                      borderColor: isCyber ? "rgba(34, 197, 94, 0.3)" : "#86EFAC",
                      color: isCyber ? "#4ADE80" : "#16A34A",
                    }}
                  >
                    {activeProject.status}
                  </span>
                )}
              </div>
            )}

            {/* 4. Compact Identity Chips: MBTI, Zodiac, Border Tier */}
            <div className="pt-2 flex flex-wrap items-center gap-1.5 border-t border-white/10 shrink-0">
              {profile.mbti && (
                <div
                  className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 transition-all select-none border"
                  style={{
                    background: isCyber ? "rgba(0, 245, 255, 0.08)" : "#E0F2FE",
                    borderColor: isCyber ? "rgba(0, 245, 255, 0.4)" : "#000000",
                    boxShadow: isCyber ? "0 0 8px rgba(0, 245, 255, 0.15)" : "2px 2px 0px #000000",
                    color: isCyber ? "#00F5FF" : "#0369A1",
                    borderWidth: isCyber ? "1px" : "2px",
                  }}
                >
                  <Brain className="w-3 h-3" />
                  <span>{profile.mbti}</span>
                </div>
              )}

              {profile.zodiac && ZODIAC_METADATA[profile.zodiac] && (() => {
                const zodiacInfo = ZODIAC_METADATA[profile.zodiac];
                return (
                  <div
                    className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 transition-all select-none border"
                    style={{
                      background: isCyber ? `${zodiacInfo.color}15` : "#F5F3FF",
                      borderColor: isCyber ? zodiacInfo.color : "#000000",
                      boxShadow: isCyber ? `0 0 8px ${zodiacInfo.color}25` : "2px 2px 0px #000000",
                      color: isCyber ? zodiacInfo.color : "#5B21B6",
                      borderWidth: isCyber ? "1px" : "2px",
                    }}
                  >
                    <span>{zodiacInfo.symbol}</span>
                    <span>{profile.zodiac} {zodiacInfo.emoji}</span>
                  </div>
                );
              })()}

              <div
                className="text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 transition-all select-none border ml-auto"
                style={{
                  background: isCyber ? "rgba(255, 215, 0, 0.08)" : "#FEF3C7",
                  borderColor: isCyber ? "rgba(255, 215, 0, 0.4)" : "#000000",
                  boxShadow: isCyber ? "0 0 8px rgba(255, 215, 0, 0.15)" : "2px 2px 0px #000000",
                  color: isCyber ? "#FFD700" : "#B45309",
                  borderWidth: isCyber ? "1px" : "2px",
                }}
                title={`Custom Border Aura: ${borderConfig.name}`}
              >
                <span>🛡️</span>
                <span className="truncate max-w-[100px]">{borderConfig.name}</span>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ── Entry Fade Animation Wrapper (Original Full Profile Preview) ─── */
          <motion.div
            variants={welcomeFadeVariants}
            initial="hidden"
            animate="visible"
          >
            {/* ── Header Row ──────────────────────────────────────────────── */}
            <div className="flex items-start gap-4 mb-5">
              {/* Avatar */}
              <div className="relative shrink-0">
                {/* Animated ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={borderConfig.avatarRing(isCyber)}
                  transition={
                    isCyber && borderStyleKey !== "brutal-bold"
                      ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.4 }
                  }
                />

                <motion.div
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden flex items-center justify-center relative z-10"
                  animate={{
                    backgroundColor: isCyber ? "#0A0F2C" : "#FF6B35",
                    border: borderConfig.avatarBorder(isCyber),
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className={`text-3xl font-black ${isCyber ? "cyber-glow-text" : "text-white"}`}>
                      {profile.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  )}
                </motion.div>

                {/* Status dot */}
                <div
                  className={`status-dot ${status.dotClass} absolute -bottom-0.5 -right-0.5 border-2`}
                  style={{
                    borderColor: isCyber ? "#0A0F2C" : "#FFFFFF",
                  }}
                />
              </div>

              {/* Name & info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  {/* Name with tracking expansion animation */}
                  <motion.h1
                    className={`font-black text-xl md:text-2xl leading-tight ${isCyber ? "cyber-gradient-text" : "theme-text-primary"}`}
                    variants={nameLetterVariants}
                    initial="hidden"
                    animate="visible"
                    style={{
                      fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                    }}
                  >
                    {profile.name}
                  </motion.h1>

                  {/* Status badge */}
                  <motion.div
                    className="theme-badge flex items-center gap-1.5 shrink-0"
                    animate={{
                      backgroundColor: isCyber
                        ? `rgba(${status.color === "#22C55E" ? "34,197,94" : "239,68,68"},0.15)`
                        : "rgba(0,0,0,0)",
                      color: status.color,
                      borderColor: status.color,
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    <span className={`status-dot ${status.dotClass} !w-1.5 !h-1.5`} />
                    {status.label}
                  </motion.div>
                </div>

                <p className="theme-text-secondary text-sm md:text-base font-medium mt-0.5">
                  {profile.tagline}
                </p>

                <p className="theme-text-muted text-xs mt-1 block">
                  📍 {profile.location}
                </p>
              </div>
            </div>

            {/* ── Bio ──────────────────────────────────────────────────────── */}
            <motion.p
              className="theme-text-secondary text-sm leading-relaxed mb-4 pb-4"
              style={{
                borderBottomWidth: isCyber ? "1px" : "2px",
                borderBottomStyle: "solid",
                borderBottomColor: isCyber ? "rgba(0,245,255,0.15)" : "rgba(0,0,0,0.1)",
              }}
              animate={{ borderBottomColor: isCyber ? "rgba(0,245,255,0.15)" : "rgba(0,0,0,0.1)" }}
              transition={{ duration: 0.4 }}
            >
              {profile.bio}
            </motion.p>

            {/* ── Attributes & Stats Block ────────────────────────────────── */}
            {(profile.mbti || profile.zodiac || profile.phoneNumber) && (
              <div className="mb-5 flex flex-wrap gap-2 relative z-10">
                {profile.mbti && (
                  <div
                    className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-all select-none border"
                    style={{
                      background: isCyber ? "rgba(0, 245, 255, 0.08)" : "#E0F2FE",
                      borderColor: isCyber ? "rgba(0, 245, 255, 0.4)" : "#000000",
                      boxShadow: isCyber ? "0 0 10px rgba(0, 245, 255, 0.2)" : "3px 3px 0px #000000",
                      color: isCyber ? "#00F5FF" : "#0369A1",
                      borderWidth: isCyber ? "1px" : "2.5px",
                    }}
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>{profile.mbti}</span>
                  </div>
                )}

                {profile.zodiac && ZODIAC_METADATA[profile.zodiac] && (() => {
                  const zodiacInfo = ZODIAC_METADATA[profile.zodiac];
                  return (
                    <div
                      className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-all select-none border"
                      style={{
                        background: isCyber ? `${zodiacInfo.color}15` : "#F5F3FF",
                        borderColor: isCyber ? zodiacInfo.color : "#000000",
                        boxShadow: isCyber ? `0 0 10px ${zodiacInfo.color}33` : "3px 3px 0px #000000",
                        color: isCyber ? zodiacInfo.color : "#5B21B6",
                        borderWidth: isCyber ? "1px" : "2.5px",
                      }}
                    >
                      <span>{zodiacInfo.symbol}</span>
                      <span>{profile.zodiac} {zodiacInfo.emoji}</span>
                    </div>
                  );
                })()}

                {profile.phoneNumber && (
                  <div
                    className="text-xs font-black px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-all select-none border"
                    style={{
                      background: isCyber ? "rgba(34, 197, 94, 0.08)" : "#DCFCE7",
                      borderColor: isCyber ? "rgba(34, 197, 94, 0.4)" : "#000000",
                      boxShadow: isCyber ? "0 0 10px rgba(34, 197, 94, 0.2)" : "3px 3px 0px #000000",
                      color: isCyber ? "#22C55E" : "#166534",
                      borderWidth: isCyber ? "1px" : "2.5px",
                    }}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{profile.phoneNumber}</span>
                  </div>
                )}
              </div>
            )}

            {/* ── Skills ───────────────────────────────────────────────────── */}
            <div className="mb-4">
              <p className="theme-text-muted text-[10px] font-bold tracking-widest uppercase mb-2">
                Stack
              </p>
              <motion.div
                className="flex flex-wrap gap-2"
                variants={listContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {profile.skills.map((skill, i) => (
                  <motion.span
                    key={skill}
                    variants={listItemVariants}
                    custom={i}
                    className="theme-badge"
                    style={{
                      backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "rgba(255,107,53,0.12)",
                      color: isCyber ? "#00F5FF" : "#FF6B35",
                      borderColor: isCyber ? "rgba(0,245,255,0.35)" : "#FF6B35",
                    }}
                    whileHover={{ scale: 1.06 }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </motion.div>
            </div>

            {/* ── Socials ──────────────────────────────────────────────────── */}
            <motion.div
              className="flex flex-wrap gap-2 mt-auto pt-2"
              variants={listContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {profile.socials.map((s) => {
                const brand = getSocialBrand(s.platform, s.handle, s.url);
                const Icon = brand.icon;
                return (
                  <motion.a
                    key={s.platform}
                    href={s.url ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    variants={listItemVariants}
                    className="theme-badge inline-flex items-center gap-1.5 no-underline transition-all"
                    style={{
                      background: isCyber ? brand.bgCyber : brand.bgBrutal,
                      color: isCyber ? brand.textCyber : brand.textBrutal,
                      borderColor: isCyber ? brand.borderCyber : brand.borderBrutal,
                      borderWidth: isCyber ? "1px" : "2px",
                      boxShadow: isCyber ? `0 0 8px ${brand.borderCyber}22` : `3px 3px 0px ${brand.borderBrutal}`,
                    }}
                    whileHover={{
                      scale: 1.04,
                      boxShadow: isCyber 
                        ? `0 0 16px ${brand.textCyber}55` 
                        : `5px 5px 0px ${brand.borderBrutal}`,
                      y: isCyber ? 0 : -2
                    }}
                    whileTap={{ 
                      scale: 0.97,
                      y: isCyber ? 0 : 1,
                      boxShadow: isCyber ? "none" : "1px 1px 0px #000"
                    }}
                    transition={{ duration: 0.15 }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{s.handle}</span>
                  </motion.a>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </BentoCard>
    </motion.div>
  );
}
