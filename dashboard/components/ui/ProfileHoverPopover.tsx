"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { 
  Github, 
  Instagram, 
  MessageSquare, 
  Twitter, 
  Disc, 
  Send, 
  Share2, 
  Phone, 
  Brain 
} from "lucide-react";

const STATUS_CONFIG = {
  online:  { label: "ONLINE",  color: "#22C55E" },
  away:    { label: "AWAY",    color: "#F59E0B" },
  busy:    { label: "BUSY",    color: "#EF4444" },
  offline: { label: "OFFLINE", color: "#6B7280" },
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

interface ProfileHoverPopoverProps {
  children: React.ReactNode;
  onOpenAesthetics: () => void;
  /** "up" = above trigger, "right" = right of trigger, "down-left" = below/right-aligned */
  placement?: "up" | "right" | "down-left";
  style?: React.CSSProperties;
  className?: string;
}

function isVideo(url?: string | null) {
  if (!url) return false;
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

export function ProfileHoverPopover({
  children,
  onOpenAesthetics,
  placement = "right",
  style,
  className = "relative",
}: ProfileHoverPopoverProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const router = useRouter();
  const profile = useDashboardStore((s) => s.profile);
  const status = STATUS_CONFIG[profile.status] || STATUS_CONFIG.online;

  const [isOpen, setIsOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setIsOpen(false), 200);
  };

  // ── Placement offsets ────────────────────────────────────────────────────────
  const popoverPlacement =
    placement === "up"
      ? { bottom: "calc(100% + 12px)", left: 0 }
      : placement === "down-left"
      ? { top: "calc(100% + 12px)", right: 0 }
      : { left: "calc(100% + 14px)", top: "50%", y: "-50%" };

  return (
    <div
      className={className}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="popover"
            initial={{ opacity: 0, scale: 0.94, y: placement === "up" ? -8 : placement === "down-left" ? -6 : 0, x: placement === "right" ? -8 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              zIndex: 9999,
              width: 320,
              ...popoverPlacement,
              background: isCyber
                ? "linear-gradient(145deg, rgba(5,8,22,0.98), rgba(10,15,40,0.98))"
                : "#FFFFFF",
              border: isCyber ? "1px solid rgba(0,245,255,0.25)" : "3px solid #000",
              borderRadius: isCyber ? "12px" : "8px",
              boxShadow: isCyber
                ? "0 20px 60px rgba(0,0,0,0.9), 0 0 30px rgba(0,245,255,0.1)"
                : "6px 6px 0px 0px #000",
              overflow: "hidden",
            }}
          >
            {/* ── Top Banner ──────────────────────────────────────────────── */}
            <div
              style={{
                height: 90,
                position: "relative",
                overflow: "hidden",
                background: isCyber
                  ? "linear-gradient(135deg, #0A0F2C, #1A0A3C, rgba(0,245,255,0.08))"
                  : "linear-gradient(135deg, #FFF9C4, #FFE0CC)",
              }}
            >
              {profile.banner ? (
                isVideo(profile.banner) ? (
                  <video
                    src={profile.banner}
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <img
                    src={profile.banner}
                    alt="banner"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )
              ) : (
                /* Default gradient orb decoration */
                <>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage: isCyber
                        ? "radial-gradient(ellipse at 30% 60%, rgba(0,245,255,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(191,95,255,0.15) 0%, transparent 50%)"
                        : "radial-gradient(ellipse at 30% 60%, rgba(255,107,53,0.2) 0%, transparent 60%)",
                    }}
                  />
                  {isCyber && (
                    <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-[#00F5FF]/40" />
                  )}
                </>
              )}
            </div>

            {/* ── Avatar overlapping the banner ─────────────────────────── */}
            <div style={{ position: "relative", padding: "0 16px" }}>
              <motion.div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  overflow: "hidden",
                  position: "absolute",
                  top: -30,
                  border: isCyber ? "2px solid rgba(0,245,255,0.6)" : "3px solid #000",
                  background: isCyber ? "#0A0F2C" : "#FF6B35",
                  boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.3)" : "3px 3px 0 #000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  zIndex: 10,
                }}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span style={{ fontSize: 20, fontWeight: 900, color: isCyber ? "#00F5FF" : "#fff" }}>
                    {profile.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </span>
                )}
              </motion.div>

              {/* Status dot on avatar */}
              <div
                style={{
                  position: "absolute",
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: status.color,
                  border: isCyber ? "2px solid #050816" : "2px solid #fff",
                  top: -30 + 44,
                  left: 16 + 44,
                  zIndex: 11,
                }}
              />
            </div>

            {/* ── Card Body ────────────────────────────────────────────────── */}
            <div style={{ padding: "36px 16px 14px" }}>
              {/* Name row */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
                <span
                  style={{
                    fontWeight: 900,
                    fontSize: 14,
                    fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                    color: isCyber ? "#E0E8FF" : "#1A1A1A",
                    letterSpacing: isCyber ? "0.04em" : "0",
                  }}
                >
                  {profile.name}
                </span>
                {profile.customTag && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: isCyber ? "rgba(0,245,255,0.6)" : "#9CA3AF",
                      fontFamily: "monospace",
                    }}
                  >
                    {profile.customTag}
                  </span>
                )}
              </div>

              {/* Status & Location */}
              <div className="flex justify-between items-center gap-2 mb-3">
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: status.color }} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: status.color, letterSpacing: "0.06em" }}>
                    {status.label}
                  </span>
                </div>
                {profile.location && (
                  <span className="text-[10px] theme-text-muted font-bold">
                    📍 {profile.location}
                  </span>
                )}
              </div>

              {/* Bio (clamp) */}
              {profile.bio && (
                <p
                  style={{
                    fontSize: 11,
                    color: isCyber ? "rgba(224,232,255,0.7)" : "#4B5563",
                    lineHeight: 1.55,
                    marginBottom: 12,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {profile.bio}
                </p>
              )}

              {/* ── Badges Block (MBTI, Zodiac, Phone) ── */}
              {(profile.mbti || profile.zodiac || profile.phoneNumber) && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {profile.mbti && (
                    <div
                      className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg flex items-center gap-1 border"
                      style={{
                        background: isCyber ? "rgba(0, 245, 255, 0.08)" : "#E0F2FE",
                        borderColor: isCyber ? "rgba(0, 245, 255, 0.3)" : "#000000",
                        color: isCyber ? "#00F5FF" : "#0369A1",
                        borderWidth: isCyber ? "1px" : "2px",
                        boxShadow: isCyber ? "none" : "2px 2px 0px #000",
                      }}
                    >
                      <Brain className="w-3 h-3" />
                      <span>{profile.mbti}</span>
                    </div>
                  )}

                  {profile.zodiac && ZODIAC_METADATA[profile.zodiac] && (() => {
                    const z = ZODIAC_METADATA[profile.zodiac];
                    return (
                      <div
                        className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg flex items-center gap-1 border"
                        style={{
                          background: isCyber ? `${z.color}12` : "#F5F3FF",
                          borderColor: isCyber ? z.color : "#000000",
                          color: isCyber ? z.color : "#5B21B6",
                          borderWidth: isCyber ? "1px" : "2px",
                          boxShadow: isCyber ? "none" : "2px 2px 0px #000",
                        }}
                      >
                        <span>{z.symbol}</span>
                        <span>{profile.zodiac}</span>
                      </div>
                    );
                  })()}

                  {profile.phoneNumber && (
                    <div
                      className="text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 border"
                      style={{
                        background: isCyber ? "rgba(34, 197, 94, 0.08)" : "#DCFCE7",
                        borderColor: isCyber ? "rgba(34, 197, 94, 0.3)" : "#000000",
                        color: isCyber ? "#22C55E" : "#166534",
                        borderWidth: isCyber ? "1px" : "2px",
                        boxShadow: isCyber ? "none" : "2px 2px 0px #000",
                      }}
                    >
                      <Phone className="w-3 h-3" />
                      <span>{profile.phoneNumber}</span>
                    </div>
                  )}
                </div>
              )}

              {/* ── Technical Stack ── */}
              {profile.skills.length > 0 && (
                <div className="mb-3">
                  <p className="text-[9px] font-bold tracking-widest uppercase mb-1.5" style={{ color: isCyber ? "rgba(0,245,255,0.4)" : "#6B7280" }}>
                    STACK
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 text-[9px] font-bold uppercase rounded border transition-all"
                        style={{
                          backgroundColor: isCyber ? "rgba(0,245,255,0.06)" : "rgba(255,107,53,0.08)",
                          color: isCyber ? "#00F5FF" : "#FF6B35",
                          borderColor: isCyber ? "rgba(0,245,255,0.25)" : "#FF6B35",
                          borderWidth: isCyber ? "1px" : "1.5px",
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                    {profile.skills.length > 5 && (
                      <span
                        className="px-2 py-0.5 text-[9px] font-bold uppercase rounded border"
                        style={{
                          backgroundColor: "transparent",
                          color: isCyber ? "rgba(255,255,255,0.4)" : "#6B7280",
                          borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#D1D5DB",
                          borderWidth: isCyber ? "1px" : "1.5px",
                        }}
                      >
                        +{profile.skills.length - 5} MORE
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* ── Social Badges ── */}
              {profile.socials.length > 0 && (
                <div className="mb-4">
                  <p className="text-[9px] font-bold tracking-widest uppercase mb-1.5" style={{ color: isCyber ? "rgba(0,245,255,0.4)" : "#6B7280" }}>
                    NETWORKS
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.socials.map((s) => {
                      const brand = getSocialBrand(s.platform, s.handle, s.url);
                      const Icon = brand.icon;
                      return (
                        <a
                          key={s.platform}
                          href={s.url ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase rounded border transition-all no-underline"
                          style={{
                            background: isCyber ? brand.bgCyber : brand.bgBrutal,
                            color: isCyber ? brand.textCyber : brand.textBrutal,
                            borderColor: isCyber ? brand.borderCyber : brand.borderBrutal,
                            borderWidth: isCyber ? "1px" : "1.5px",
                            boxShadow: isCyber ? "none" : "2px 2px 0px #000",
                          }}
                        >
                          <Icon className="w-2.5 h-2.5" />
                          <span>{s.handle}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div
                style={{
                  height: 1,
                  background: isCyber ? "rgba(0,245,255,0.12)" : "rgba(0,0,0,0.1)",
                  marginBottom: 12,
                }}
              />

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                <motion.button
                  id="popover-edit-aesthetics-btn"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false); onOpenAesthetics(); }}
                  style={{
                    flex: 1,
                    padding: "6px 10px",
                    fontSize: 10,
                    fontWeight: 900,
                    borderRadius: isCyber ? 6 : 4,
                    border: isCyber ? "1px solid rgba(0,245,255,0.4)" : "2px solid #000",
                    background: isCyber ? "rgba(0,245,255,0.12)" : "#FFF9C4",
                    color: isCyber ? "#00F5FF" : "#1A1A1A",
                    cursor: "pointer",
                    letterSpacing: "0.04em",
                    transition: "all 0.15s",
                    boxShadow: isCyber ? "none" : "2.5px 2.5px 0px #000",
                  }}
                >
                  🎨 Edit Aesthetics
                </motion.button>

                <motion.button
                  id="popover-view-profile-btn"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false); router.push("/profile"); }}
                  style={{
                    flex: 1,
                    padding: "6px 10px",
                    fontSize: 10,
                    fontWeight: 900,
                    borderRadius: isCyber ? 6 : 4,
                    border: isCyber ? "none" : "2px solid #000",
                    background: isCyber ? "#00F5FF" : "#FF6B35",
                    color: isCyber ? "#050816" : "#FFF",
                    cursor: "pointer",
                    letterSpacing: "0.04em",
                    boxShadow: isCyber ? "0 0 14px rgba(0,245,255,0.35)" : "2.5px 2.5px 0px #000",
                    transition: "all 0.15s",
                  }}
                >
                  👤 View Profile
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
