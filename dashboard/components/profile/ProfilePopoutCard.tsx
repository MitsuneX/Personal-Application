"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import {
  Github,
  Instagram,
  MessageSquare,
  Twitter,
  Share2,
  Globe,
  Youtube,
  Linkedin,
  Gamepad2,
  Copy,
  Check,
  Edit3,
  Sparkles,
  ShieldCheck,
  MapPin,
  ExternalLink,
  User,
} from "lucide-react";
import { useState } from "react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  online:  { label: "ONLINE",  color: "#22C55E", glow: "rgba(34,197,94,0.5)" },
  away:    { label: "AWAY",    color: "#F59E0B", glow: "rgba(245,158,11,0.5)" },
  busy:    { label: "BUSY",    color: "#EF4444", glow: "rgba(239,68,68,0.5)" },
  offline: { label: "OFFLINE", color: "#6B7280", glow: "rgba(107,114,128,0.4)" },
};

const ZODIAC_METADATA: Record<string, { symbol: string; color: string }> = {
  Aries: { symbol: "♈", color: "#EF4444" },
  Taurus: { symbol: "♉", color: "#10B981" },
  Gemini: { symbol: "♊", color: "#F59E0B" },
  Cancer: { symbol: "♋", color: "#3B82F6" },
  Leo: { symbol: "♌", color: "#F59E0B" },
  Virgo: { symbol: "♍", color: "#EC4899" },
  Libra: { symbol: "♎", color: "#10B981" },
  Scorpio: { symbol: "♏", color: "#8B5CF6" },
  Sagittarius: { symbol: "♐", color: "#3B82F6" },
  Capricorn: { symbol: "♑", color: "#6B7280" },
  Aquarius: { symbol: "♒", color: "#06B6D4" },
  Pisces: { symbol: "♓", color: "#3B82F6" },
};

/**
 * Returns true for media formats that must use native <img> to preserve animation.
 * GIF, animated WebP, animated AVIF all require unoptimized rendering.
 */
function isAnimatedMedia(url?: string | null): boolean {
  if (!url) return false;
  const clean = url.toLowerCase().split("?")[0].split("#")[0];
  return clean.endsWith(".gif") || clean.endsWith(".webp") || clean.endsWith(".avif");
}

function getSocialBrand(platform: string, url?: string) {
  const plat = platform.toLowerCase();
  const link = url?.toLowerCase() || "";

  if (plat.includes("github") || link.includes("github.com"))
    return { name: "GitHub", icon: Github, cyber: { bg: "rgba(24,28,41,0.8)", border: "rgba(148,163,184,0.35)", text: "#F8FAFC" }, brutal: { bg: "#24292F", border: "#000", text: "#FFF" } };
  if (plat.includes("instagram") || link.includes("instagram.com"))
    return { name: "Instagram", icon: Instagram, cyber: { bg: "rgba(225,48,108,0.15)", border: "rgba(225,48,108,0.45)", text: "#FF69B4" }, brutal: { bg: "#FF007F", border: "#000", text: "#FFF" } };
  if (plat.includes("discord") || link.includes("discord"))
    return { name: "Discord", icon: MessageSquare, cyber: { bg: "rgba(88,101,242,0.18)", border: "rgba(88,101,242,0.45)", text: "#7289DA" }, brutal: { bg: "#5865F2", border: "#000", text: "#FFF" } };
  if (plat.includes("twitter") || plat.includes("x.com") || link.includes("x.com") || link.includes("twitter.com"))
    return { name: "X / Twitter", icon: Twitter, cyber: { bg: "rgba(255,255,255,0.07)", border: "rgba(255,255,255,0.22)", text: "#FFF" }, brutal: { bg: "#000", border: "#000", text: "#FFF" } };
  if (plat.includes("youtube") || link.includes("youtube.com"))
    return { name: "YouTube", icon: Youtube, cyber: { bg: "rgba(239,68,68,0.18)", border: "rgba(239,68,68,0.45)", text: "#EF4444" }, brutal: { bg: "#FF0000", border: "#000", text: "#FFF" } };
  if (plat.includes("linkedin") || link.includes("linkedin.com"))
    return { name: "LinkedIn", icon: Linkedin, cyber: { bg: "rgba(14,118,168,0.18)", border: "rgba(14,118,168,0.45)", text: "#0E76A8" }, brutal: { bg: "#0E76A8", border: "#000", text: "#FFF" } };
  if (plat.includes("steam") || link.includes("steampowered.com"))
    return { name: "Steam", icon: Gamepad2, cyber: { bg: "rgba(23,26,33,0.8)", border: "rgba(102,192,244,0.4)", text: "#66C0F4" }, brutal: { bg: "#171A21", border: "#000", text: "#FFF" } };
  if (link.startsWith("http") || plat.includes("website") || plat.includes("web"))
    return { name: platform || "Website", icon: Globe, cyber: { bg: "rgba(0,245,255,0.1)", border: "rgba(0,245,255,0.35)", text: "#00F5FF" }, brutal: { bg: "#FFD700", border: "#000", text: "#000" } };

  return { name: platform, icon: Share2, cyber: { bg: "rgba(0,245,255,0.1)", border: "rgba(0,245,255,0.3)", text: "#00F5FF" }, brutal: { bg: "#FFD700", border: "#000", text: "#000" } };
}

// ─── Component ───────────────────────────────────────────────────────────────

export interface ProfilePopoutCardProps {
  onOpenAesthetics?: () => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export function ProfilePopoutCard({
  onOpenAesthetics,
  onClose,
  isMobile = false,
}: ProfilePopoutCardProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  // ── Single source of truth: all data from Zustand store ──
  const profile = useDashboardStore((s) => s.profile);
  const gamesCount = useDashboardStore((s) => s.games?.length ?? 0);
  const animeCount = useDashboardStore((s) => s.animeList?.length ?? 0);
  const dramasCount = useDashboardStore((s) => (s.dramas?.length ?? 0) + (s.dramaLog?.length ?? 0));
  const favCount = useDashboardStore((s) => s.favoriteCharacters?.filter((c) => c.isFavorite)?.length ?? 0);

  const [copied, setCopied] = useState(false);

  // ── Derived values (memoized) ──
  const statusKey = (profile?.status || "online") as keyof typeof STATUS_CONFIG;
  const status = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.online;
  const zodiacInfo = profile?.zodiac ? ZODIAC_METADATA[profile.zodiac] : null;

  const isGuest = profile?.id === "guest-profile";

  const profileCompletion = useMemo(() => {
    const fields = [
      profile?.name,
      profile?.bio,
      profile?.avatar,
      profile?.banner,
      profile?.location,
      profile?.mbti,
      profile?.zodiac,
      profile?.phoneNumber,
      profile?.skills?.length ? true : null,
      profile?.socials?.length ? true : null,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.origin + "/profile").catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Theme tokens ──
  const card = isCyber
    ? { bg: "rgba(5, 8, 22, 0.98)", border: "1.5px solid rgba(0,245,255,0.3)", radius: "18px", shadow: "0 24px 64px rgba(0,0,0,0.9), 0 0 40px rgba(0,245,255,0.12), 0 0 80px rgba(191,95,255,0.06)" }
    : { bg: "#FFFBF5", border: "3px solid #000000", radius: "12px", shadow: "8px 8px 0px 0px #000000" };

  const sectionDivider = isCyber ? "1px solid rgba(255,255,255,0.07)" : "1.5px solid rgba(0,0,0,0.1)";
  const mutedColor = isCyber ? "rgba(224,232,255,0.45)" : "#6B7280";
  const textColor = isCyber ? "#E0E8FF" : "#1A1A1A";
  const accentColor = isCyber ? "#00F5FF" : "#FF6B35";

  return (
    <div
      className="flex flex-col overflow-hidden select-none"
      style={{
        width: isMobile ? "100%" : 368,
        maxHeight: isMobile ? "90vh" : "calc(100vh - 32px)",
        backgroundColor: card.bg,
        border: card.border,
        borderRadius: isMobile ? "24px 24px 0 0" : card.radius,
        boxShadow: card.shadow,
        color: textColor,
      }}
    >
      {/* ══════════════════════════════════════════════════════
          STICKY TOP: Banner + Avatar (never scrolls away)
      ══════════════════════════════════════════════════════ */}
      <div className="relative shrink-0">
        {/* Banner */}
        <div className="relative w-full overflow-hidden" style={{ height: 128 }}>
          {profile?.banner ? (
            /\.(mp4|webm|ogg)(\?.*)?$/i.test(profile.banner) ? (
              <video
                src={profile.banner}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <img
                src={profile.banner}
                alt="Profile Banner"
                className="w-full h-full object-cover object-center"
                loading="eager"
              />
            )
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: isCyber
                  ? "linear-gradient(135deg, #050816 0%, #0F172A 40%, #1E1B4B 70%, #0284C7 100%)"
                  : "linear-gradient(135deg, #FF6B35 0%, #FFD700 100%)",
              }}
            />
          )}
          {/* Progressive dark overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

          {/* Status pill in top-right corner */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-black bg-black/75 backdrop-blur-md text-white border border-white/20">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: status.color, boxShadow: `0 0 8px ${status.glow}` }} />
            <span>{status.label}</span>
          </div>
        </div>

        {/* Avatar + Role badges row (overlaps banner bottom) */}
        <div className="px-4 pb-3" style={{ backgroundColor: card.bg }}>
          <div className="-mt-10 flex items-end justify-between gap-2">
            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.06 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="relative shrink-0 rounded-full overflow-hidden"
              style={{
                width: 72,
                height: 72,
                border: `3px solid ${status.color}`,
                boxShadow: isCyber ? `0 0 20px ${status.glow}` : "4px 4px 0 #000",
                backgroundColor: isCyber ? "#0B0F19" : "#F3F4F6",
              }}
            >
              {profile?.avatar ? (
                isAnimatedMedia(profile.avatar) ? (
                  <img src={profile.avatar} alt={profile.name || "Avatar"} className="w-full h-full object-cover" />
                ) : (
                  <Image src={profile.avatar} alt={profile.name || "Avatar"} fill className="object-cover" sizes="72px" />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 opacity-40" />
                </div>
              )}
            </motion.div>

            {/* Role + Zodiac badges */}
            <div className="flex items-center gap-1.5 flex-wrap justify-end pb-1">
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-mono font-black tracking-wider uppercase border"
                style={{
                  backgroundColor: isCyber ? "rgba(0,245,255,0.12)" : accentColor,
                  borderColor: isCyber ? "rgba(0,245,255,0.4)" : "#000",
                  color: isCyber ? "#00F5FF" : "#FFF",
                  boxShadow: isCyber ? "none" : "2px 2px 0 #000",
                }}
              >
                <ShieldCheck className="w-3 h-3" />
                {isGuest ? "GUEST" : "OPERATOR"}
              </span>
              {zodiacInfo && (
                <span
                  className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-lg border flex items-center gap-1"
                  style={{
                    backgroundColor: isCyber ? "rgba(191,95,255,0.12)" : "#FEF08A",
                    borderColor: isCyber ? "rgba(191,95,255,0.4)" : "#000",
                    color: isCyber ? "#BF5FFF" : "#854D0E",
                    boxShadow: isCyber ? "none" : "2px 2px 0 #000",
                  }}
                >
                  {zodiacInfo.symbol} {profile?.zodiac}
                </span>
              )}
            </div>
          </div>

          {/* Name + Tag + Location */}
          <div className="mt-2 space-y-0.5">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3
                className="text-base font-black tracking-tight leading-none"
                style={{
                  color: isCyber ? "#FFFFFF" : "#000000",
                  fontFamily: isCyber ? "var(--font-orbitron, inherit)" : "inherit",
                  letterSpacing: isCyber ? "0.04em" : undefined,
                }}
              >
                {profile?.name || "Command Operator"}
              </h3>
              {profile?.customTag && (
                <span className="text-[11px] font-mono font-bold opacity-55">
                  {profile.customTag.startsWith("#") ? profile.customTag : `#${profile.customTag}`}
                </span>
              )}
            </div>

            <p className="text-[11px] font-mono leading-normal" style={{ color: mutedColor }}>
              {profile?.tagline || "Personal Command Center"}
            </p>

            {profile?.location && (
              <div className="flex items-center gap-1 text-[11px] font-mono pt-0.5" style={{ color: mutedColor }}>
                <MapPin className="w-3 h-3 shrink-0" style={{ color: accentColor }} />
                <span>{profile.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          SCROLLABLE BODY — only this section scrolls
      ══════════════════════════════════════════════════════ */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4 space-y-3"
        style={{
          borderTop: sectionDivider,
          scrollbarWidth: "thin",
          scrollbarColor: isCyber ? "rgba(0,245,255,0.2) transparent" : "rgba(0,0,0,0.15) transparent",
        }}
      >
        {/* Bio */}
        {profile?.bio && (
          <div
            className="pt-3 text-xs leading-relaxed rounded-xl p-3 border"
            style={{
              backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#F8FAFC",
              borderColor: isCyber ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
              color: isCyber ? "rgba(224,232,255,0.85)" : "#374151",
            }}
          >
            {profile.bio}
          </div>
        )}

        {/* Personal Attribute Badges */}
        {(profile?.mbti || profile?.phoneNumber || profile?.zodiac) && (
          <div className="flex flex-wrap gap-1.5">
            {profile?.mbti && (
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded border bg-purple-500/10 text-purple-400 border-purple-500/25">
                🧬 {profile.mbti}
              </span>
            )}
            {profile?.phoneNumber && (
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/25">
                📞 Verified
              </span>
            )}
            <span
              className="px-2 py-0.5 text-[10px] font-mono font-bold rounded border"
              style={{
                backgroundColor: isCyber ? "rgba(0,245,255,0.07)" : "rgba(255,107,53,0.1)",
                borderColor: isCyber ? "rgba(0,245,255,0.2)" : "rgba(255,107,53,0.3)",
                color: isCyber ? "#00F5FF" : "#FF6B35",
              }}
            >
              📊 {profileCompletion}% Complete
            </span>
          </div>
        )}

        {/* Tech Stack */}
        {profile?.skills && profile.skills.length > 0 && (
          <div style={{ borderTop: sectionDivider, paddingTop: 12 }}>
            <div className="flex items-center gap-1.5 mb-2 text-[10px] font-mono font-black uppercase tracking-widest" style={{ color: accentColor }}>
              <Sparkles className="w-3 h-3" />
              STACK
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 text-[10px] font-mono font-extrabold rounded-md border"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.07)" : "#E2E8F0",
                    borderColor: isCyber ? "rgba(0,245,255,0.22)" : "#000",
                    color: isCyber ? "#00F5FF" : "#0F172A",
                  }}
                >
                  {skill.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Social Links */}
        {profile?.socials && profile.socials.length > 0 && (
          <div style={{ borderTop: sectionDivider, paddingTop: 12 }}>
            <div className="text-[10px] font-mono font-black uppercase tracking-widest mb-2" style={{ color: isCyber ? "#EC4899" : "#DB2777" }}>
              CONNECT
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.socials.map((s, i) => {
                if (!s.handle && !s.url) return null;
                const brand = getSocialBrand(s.platform, s.url);
                const Icon = brand.icon;
                const colors = isCyber ? brand.cyber : brand.brutal;
                return (
                  <motion.a
                    key={i}
                    href={s.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg border cursor-pointer"
                    style={{
                      background: colors.bg,
                      borderColor: colors.border,
                      color: colors.text,
                      boxShadow: isCyber ? "none" : "2px 2px 0 #000",
                    }}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{s.handle || brand.name}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                  </motion.a>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Mini Personal Dashboard Live Statistics ── */}
        <div style={{ borderTop: sectionDivider, paddingTop: 12 }}>
          <div className="text-[10px] font-mono font-black uppercase tracking-widest mb-2" style={{ color: mutedColor }}>
            PERSONAL STATS
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Games", value: gamesCount, accent: "#00F5FF", brutBg: "#FEF08A" },
              { label: "Anime", value: animeCount, accent: "#BF5FFF", brutBg: "#FFD6E8" },
              { label: "Drama", value: dramasCount, accent: "#EC4899", brutBg: "#D1FAE5" },
              { label: "Favs",  value: favCount,    accent: "#F59E0B", brutBg: "#E0E7FF" },
            ].map(({ label, value, accent, brutBg }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center p-2 rounded-xl border text-center"
                style={{
                  backgroundColor: isCyber ? `${accent}0D` : brutBg,
                  borderColor: isCyber ? `${accent}30` : "#000",
                  boxShadow: isCyber ? "none" : "2px 2px 0 #000",
                }}
              >
                <span className="text-sm font-mono font-black leading-none" style={{ color: isCyber ? accent : "#000" }}>
                  {value}
                </span>
                <span className="text-[9px] font-mono uppercase mt-0.5" style={{ color: mutedColor }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer Actions ── */}
        <div style={{ borderTop: sectionDivider, paddingTop: 12 }}>
          <div className="flex items-center gap-2">
            {/* Edit Profile — hidden for guests */}
            {!isGuest && onOpenAesthetics && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { onOpenAesthetics(); onClose?.(); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-black cursor-pointer"
                style={{
                  backgroundColor: accentColor,
                  color: isCyber ? "#050816" : "#FFF",
                  border: isCyber ? "none" : "2px solid #000",
                  boxShadow: isCyber ? `0 0 16px ${isCyber ? "rgba(0,245,255,0.35)" : "none"}` : "3px 3px 0 #000",
                }}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </motion.button>
            )}

            {/* Copy Profile Link */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCopy}
              title="Copy Profile Link"
              className="flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-black cursor-pointer border"
              style={{
                backgroundColor: isCyber ? "rgba(255,255,255,0.07)" : "#FFF",
                borderColor: isCyber ? "rgba(255,255,255,0.18)" : "#000",
                color: isCyber ? "#E0E8FF" : "#000",
                boxShadow: isCyber ? "none" : "2px 2px 0 #000",
              }}
            >
              {copied
                ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                : <Copy className="w-3.5 h-3.5" />
              }
              <span>{copied ? "Copied!" : "Copy"}</span>
            </motion.button>

            {/* View Full Profile */}
            <Link href="/profile" onClick={onClose}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-black cursor-pointer border"
                style={{
                  backgroundColor: isCyber ? "rgba(191,95,255,0.1)" : "#F3F4F6",
                  borderColor: isCyber ? "rgba(191,95,255,0.35)" : "#000",
                  color: isCyber ? "#BF5FFF" : "#374151",
                  boxShadow: isCyber ? "none" : "2px 2px 0 #000",
                }}
              >
                <User className="w-3.5 h-3.5" />
                <span>Profile</span>
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
