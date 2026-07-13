"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { BentoCard } from "./BentoCard";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { listContainerVariants, listItemVariants } from "@/lib/theme/motionVariants";

const PLATFORM_ICONS: Record<string, string> = {
  GitHub: "◈",
  "Twitter/X": "𝕏",
  Discord: "◉",
  Instagram: "◎",
  LinkedIn: "▣",
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
  avatarRing: (isCyber: boolean) => any;
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
  }
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

export function ProfileCard() {
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
      className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2"
    >
      <BentoCard
        id="profile-card"
        noHover
        style={borderConfig.cardStyle(isCyber)}
      >
        {/* ── Entry Fade Animation Wrapper ─── */}
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

              <p className="theme-text-muted text-xs mt-1 hidden md:block">
                📍 {profile.location}
              </p>
            </div>
          </div>

          {/* ── Bio ──────────────────────────────────────────────────────── */}
          <motion.p
            className="theme-text-secondary text-sm leading-relaxed mb-5 pb-5"
            style={{ borderBottom: isCyber ? "1px solid rgba(0,245,255,0.15)" : "2px solid rgba(0,0,0,0.1)" }}
            animate={{ borderBottomColor: isCyber ? "rgba(0,245,255,0.15)" : "rgba(0,0,0,0.1)" }}
            transition={{ duration: 0.4 }}
          >
            {profile.bio}
          </motion.p>

          {/* ── Skills ───────────────────────────────────────────────────── */}
          <div className="mb-4">
            <p className="theme-text-muted text-xs font-bold tracking-widest uppercase mb-2">
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
            {profile.socials.map((s) => (
              <motion.a
                key={s.platform}
                href={s.url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                variants={listItemVariants}
                className="theme-badge inline-flex items-center gap-1.5 no-underline"
                style={{
                  backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)",
                  color: isCyber ? "#E0E8FF" : "#1A1A1A",
                  borderColor: isCyber ? "rgba(255,255,255,0.12)" : "#000",
                }}
                whileHover={{
                  scale: 1.04,
                  backgroundColor: isCyber
                    ? "rgba(0,245,255,0.1)"
                    : "rgba(255,107,53,0.15)",
                  borderColor: isCyber ? "rgba(0,245,255,0.5)" : "#FF6B35",
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.18 }}
              >
                <span>{PLATFORM_ICONS[s.platform] ?? "◆"}</span>
                {s.handle}
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </BentoCard>
    </motion.div>
  );
}
