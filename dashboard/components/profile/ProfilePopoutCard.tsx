"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useDashboardStore, ProfileData } from "@/lib/store/dashboardStore";
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
} from "lucide-react";

// Status configuration with color tokens and labels
const STATUS_CONFIG = {
  online:  { label: "ONLINE",  color: "#22C55E", glow: "rgba(34,197,94,0.4)" },
  away:    { label: "AWAY",    color: "#F59E0B", glow: "rgba(245,158,11,0.4)" },
  busy:    { label: "BUSY",    color: "#EF4444", glow: "rgba(239,68,68,0.4)" },
  offline: { label: "OFFLINE", color: "#6B7280", glow: "rgba(107,114,128,0.4)" },
};

// Zodiac metadata symbols and emojis
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

// Helper to determine social brand styling
const getSocialBrand = (platform: string, handle: string, url?: string) => {
  const plat = platform.toLowerCase();
  const link = url?.toLowerCase() || "";

  if (plat.includes("github") || link.includes("github.com")) {
    return {
      name: "GitHub",
      icon: Github,
      bgCyber: "rgba(24, 28, 41, 0.8)",
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
      bgCyber: "linear-gradient(135deg, rgba(131, 58, 180, 0.2), rgba(225, 48, 108, 0.2), rgba(253, 29, 29, 0.2))",
      borderCyber: "rgba(225, 48, 108, 0.5)",
      textCyber: "#FF69B4",
      bgBrutal: "#FF007F",
      borderBrutal: "#000000",
      textBrutal: "#FFFFFF",
    };
  }

  if (plat.includes("discord") || link.includes("discord")) {
    return {
      name: "Discord",
      icon: MessageSquare,
      bgCyber: "rgba(88, 101, 242, 0.2)",
      borderCyber: "rgba(88, 101, 242, 0.5)",
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
      bgCyber: "rgba(255, 255, 255, 0.08)",
      borderCyber: "rgba(255, 255, 255, 0.25)",
      textCyber: "#FFFFFF",
      bgBrutal: "#000000",
      borderBrutal: "#000000",
      textBrutal: "#FFFFFF",
    };
  }

  if (plat.includes("youtube") || link.includes("youtube.com")) {
    return {
      name: "YouTube",
      icon: Youtube,
      bgCyber: "rgba(239, 68, 68, 0.2)",
      borderCyber: "rgba(239, 68, 68, 0.5)",
      textCyber: "#EF4444",
      bgBrutal: "#FF0000",
      borderBrutal: "#000000",
      textBrutal: "#FFFFFF",
    };
  }

  if (plat.includes("linkedin") || link.includes("linkedin.com")) {
    return {
      name: "LinkedIn",
      icon: Linkedin,
      bgCyber: "rgba(14, 118, 168, 0.2)",
      borderCyber: "rgba(14, 118, 168, 0.5)",
      textCyber: "#0E76A8",
      bgBrutal: "#0E76A8",
      borderBrutal: "#000000",
      textBrutal: "#FFFFFF",
    };
  }

  if (plat.includes("steam") || link.includes("steampowered.com")) {
    return {
      name: "Steam",
      icon: Gamepad2,
      bgCyber: "rgba(23, 26, 33, 0.8)",
      borderCyber: "rgba(102, 192, 244, 0.4)",
      textCyber: "#66C0F4",
      bgBrutal: "#171A21",
      borderBrutal: "#000000",
      textBrutal: "#FFFFFF",
    };
  }

  if (link.startsWith("http")) {
    return {
      name: platform || "Website",
      icon: Globe,
      bgCyber: "rgba(0, 245, 255, 0.12)",
      borderCyber: "rgba(0, 245, 255, 0.35)",
      textCyber: "#00F5FF",
      bgBrutal: "#FFD700",
      borderBrutal: "#000000",
      textBrutal: "#000000",
    };
  }

  return {
    name: platform,
    icon: Share2,
    bgCyber: "rgba(0, 245, 255, 0.1)",
    borderCyber: "rgba(0, 245, 255, 0.3)",
    textCyber: "#00F5FF",
    bgBrutal: "#FFD700",
    borderBrutal: "#000000",
    textBrutal: "#000000",
  };
};

export interface ProfilePopoutCardProps {
  profile?: ProfileData;
  onOpenAesthetics?: () => void;
  onClose?: () => void;
  isPopover?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function ProfilePopoutCard({
  profile: overrideProfile,
  onOpenAesthetics,
  onClose,
  isPopover = true,
  className = "",
  style = {},
}: ProfilePopoutCardProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  // Connect to live Zustand store
  const storeProfile = useDashboardStore((s) => s.profile);
  const profile = overrideProfile || storeProfile;

  // Derive live statistics
  const gamesCount = useDashboardStore((s) => s.games?.length || 0);
  const animeCount = useDashboardStore((s) => s.animeList?.length || 0);
  const dramasCount = useDashboardStore((s) => s.dramaLog?.length || s.dramas?.length || 0);
  const favoritesCount = useDashboardStore(
    (s) => (s.favoriteCharacters?.length || 0) + (s.games?.filter((g) => g.isActive)?.length || 0)
  );

  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.origin + "/profile");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusKey = (profile?.status || "online") as keyof typeof STATUS_CONFIG;
  const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.online;
  const zodiacInfo = profile?.zodiac ? ZODIAC_METADATA[profile.zodiac] : null;

  // Determine user role badge
  const isGuest = profile?.id === "guest-profile" || profile?.name?.toLowerCase().includes("guest");
  const roleBadge = isGuest ? "GUEST" : "OWNER / OPERATOR";

  // Calculate profile completion percentage
  const totalFields = [
    profile?.name,
    profile?.tagline,
    profile?.bio,
    profile?.avatar,
    profile?.banner,
    profile?.location,
    profile?.mbti,
    profile?.zodiac,
    profile?.phoneNumber,
    profile?.skills?.length,
    profile?.socials?.length,
  ];
  const filledFields = totalFields.filter((f) => Boolean(f)).length;
  const completionPercentage = Math.min(100, Math.round((filledFields / totalFields.length) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 8 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={`relative overflow-hidden select-none flex flex-col ${className}`}
      style={{
        width: isPopover ? 360 : "100%",
        backgroundColor: isCyber ? "rgba(5, 8, 22, 0.98)" : "#FFFBF5",
        borderColor: isCyber ? "rgba(0, 245, 255, 0.35)" : "#000000",
        borderWidth: isCyber ? "1.5px" : "3px",
        borderRadius: isCyber ? "18px" : "12px",
        boxShadow: isCyber
          ? "0 20px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 245, 255, 0.15), 0 0 70px rgba(191, 95, 255, 0.08)"
          : "8px 8px 0px 0px #000000",
        color: isCyber ? "#E0E8FF" : "#1A1A1A",
        ...style,
      }}
    >
      {/* ── 1. Animated Full-Width Banner ── */}
      <div className="relative w-full h-32 overflow-hidden bg-slate-900 shrink-0">
        {profile?.banner ? (
          /* Using native img with unoptimized rendering for GIF animation loop */
          <img
            src={profile.banner}
            alt="Profile Banner"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: isCyber
                ? "linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0284C7 100%)"
                : "linear-gradient(135deg, #FF6B35 0%, #FFD700 100%)",
            }}
          />
        )}
        {/* Progressive Blur & Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Status Pill Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-black bg-black/70 backdrop-blur-md text-white border border-white/20 shadow-lg">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: status.color, boxShadow: `0 0 8px ${status.glow}` }}
          />
          <span>{status.label}</span>
        </div>
      </div>

      {/* ── 2. Floating Avatar & Role Badge ── */}
      <div className="px-5 pt-0 relative shrink-0">
        <div className="-mt-12 mb-3 flex items-end justify-between gap-3">
          {/* Overlapping Floating Avatar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="relative w-20 h-20 rounded-full overflow-hidden shrink-0"
            style={{
              border: isCyber ? `3px solid ${status.color}` : "3px solid #000000",
              boxShadow: isCyber ? `0 0 20px ${status.glow}` : "4px 4px 0 #000000",
              backgroundColor: isCyber ? "#0B0F19" : "#FFFFFF",
            }}
          >
            <img
              src={profile?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=MitsuneFox"}
              alt={profile?.name || "User Avatar"}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Role Pill & Zodiac Badge */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <span
              className="px-2.5 py-1 rounded-lg text-[9px] font-mono font-black tracking-wider uppercase border flex items-center gap-1 shadow-sm"
              style={{
                backgroundColor: isCyber ? "rgba(0,245,255,0.12)" : "#FF6B35",
                borderColor: isCyber ? "rgba(0,245,255,0.4)" : "#000000",
                color: isCyber ? "#00F5FF" : "#FFFFFF",
                boxShadow: isCyber ? "none" : "2px 2px 0 #000000",
              }}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>{roleBadge}</span>
            </span>

            {zodiacInfo && (
              <span
                className="px-2 py-1 text-[10px] font-mono font-bold rounded-lg border flex items-center gap-1"
                style={{
                  backgroundColor: isCyber ? "rgba(191,95,255,0.12)" : "#FEF08A",
                  borderColor: isCyber ? "rgba(191,95,255,0.4)" : "#000000",
                  color: isCyber ? "#BF5FFF" : "#854D0E",
                  boxShadow: isCyber ? "none" : "2px 2px 0 #000000",
                }}
              >
                <span>{zodiacInfo.symbol}</span>
                <span>{profile.zodiac}</span>
              </span>
            )}
          </div>
        </div>

        {/* ── 3. Header Details ── */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3
              className="text-lg font-black tracking-tight leading-none"
              style={{ color: isCyber ? "#FFFFFF" : "#000000" }}
            >
              {profile?.name || "Command Operator"}
            </h3>
            {profile?.customTag && (
              <span className="text-xs font-mono font-bold opacity-60">
                {profile.customTag.startsWith("#") ? profile.customTag : `#${profile.customTag}`}
              </span>
            )}
          </div>

          <p className="text-xs font-mono opacity-70 truncate font-medium">
            {profile?.tagline || "Full-Stack Engineer & Gaming Enthusiast"}
          </p>

          {profile?.location && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono opacity-80 pt-0.5">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>

        {/* ── 4. Readable Bio Section ── */}
        {profile?.bio && (
          <div className="mt-3 p-3 rounded-xl border text-xs leading-relaxed opacity-90 backdrop-blur-sm"
            style={{
              backgroundColor: isCyber ? "rgba(15,23,42,0.6)" : "#F8FAFC",
              borderColor: isCyber ? "rgba(0,245,255,0.15)" : "rgba(0,0,0,0.1)",
            }}
          >
            {profile.bio}
          </div>
        )}

        {/* ── 5. Personal Badges Grid ── */}
        <div className="flex items-center gap-1.5 flex-wrap mt-3">
          {profile?.mbti && (
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded border bg-purple-500/10 text-purple-400 border-purple-500/30">
              🧬 MBTI: {profile.mbti}
            </span>
          )}
          {profile?.phoneNumber && (
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              📞 Verified Contact
            </span>
          )}
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded border bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
            📊 Profile Sync: {completionPercentage}%
          </span>
        </div>

        {/* ── 6. Dynamic STACK Section ── */}
        {profile?.skills && profile.skills.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
            <div className="text-[10px] font-mono font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>STACK</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {profile.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-[10px] font-mono font-extrabold rounded-md border"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "#E2E8F0",
                    borderColor: isCyber ? "rgba(0,245,255,0.25)" : "#000000",
                    color: isCyber ? "#00F5FF" : "#0F172A",
                  }}
                >
                  {skill.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── 7. Social Links Bar ── */}
        {profile?.socials && profile.socials.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
            <div className="text-[10px] font-mono font-black uppercase tracking-widest text-pink-400">
              CONNECT & SOCIALS
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.socials.map((s, idx) => {
                if (!s.handle && !s.url) return null;
                const brand = getSocialBrand(s.platform, s.handle, s.url);
                const IconComp = brand.icon;
                return (
                  <motion.a
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={s.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg flex items-center gap-1.5 border transition-all cursor-pointer"
                    style={{
                      background: isCyber ? brand.bgCyber : brand.bgBrutal,
                      borderColor: isCyber ? brand.borderCyber : brand.borderBrutal,
                      color: isCyber ? brand.textCyber : brand.textBrutal,
                      boxShadow: isCyber ? "none" : "2px 2px 0 #000000",
                    }}
                  >
                    <IconComp className="w-3.5 h-3.5 shrink-0" />
                    <span>{s.handle || brand.name}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </motion.a>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 8. Mini Personal Dashboard Live Statistics ── */}
        <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-4 gap-2 text-center">
          <div
            className="p-2 rounded-xl border flex flex-col items-center justify-center"
            style={{
              backgroundColor: isCyber ? "rgba(0,245,255,0.06)" : "#FEF08A",
              borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000000",
            }}
          >
            <span className="text-xs font-mono font-black text-cyan-400">{gamesCount}</span>
            <span className="text-[9px] font-mono uppercase opacity-70">Games</span>
          </div>

          <div
            className="p-2 rounded-xl border flex flex-col items-center justify-center"
            style={{
              backgroundColor: isCyber ? "rgba(168,85,247,0.06)" : "#FFD6E8",
              borderColor: isCyber ? "rgba(168,85,247,0.2)" : "#000000",
            }}
          >
            <span className="text-xs font-mono font-black text-purple-400">{animeCount}</span>
            <span className="text-[9px] font-mono uppercase opacity-70">Anime</span>
          </div>

          <div
            className="p-2 rounded-xl border flex flex-col items-center justify-center"
            style={{
              backgroundColor: isCyber ? "rgba(236,72,153,0.06)" : "#D1FAE5",
              borderColor: isCyber ? "rgba(236,72,153,0.2)" : "#000000",
            }}
          >
            <span className="text-xs font-mono font-black text-pink-400">{dramasCount}</span>
            <span className="text-[9px] font-mono uppercase opacity-70">Drama</span>
          </div>

          <div
            className="p-2 rounded-xl border flex flex-col items-center justify-center"
            style={{
              backgroundColor: isCyber ? "rgba(245,158,11,0.06)" : "#E0E7FF",
              borderColor: isCyber ? "rgba(245,158,11,0.2)" : "#000000",
            }}
          >
            <span className="text-xs font-mono font-black text-amber-400">{favoritesCount}</span>
            <span className="text-[9px] font-mono uppercase opacity-70">Favs</span>
          </div>
        </div>

        {/* ── 9. Footer Actions ── */}
        <div className="my-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
          {!isGuest && onOpenAesthetics && (
            <button
              onClick={() => {
                onOpenAesthetics();
                if (onClose) onClose();
              }}
              className="flex-1 py-1.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-sm"
              style={{
                backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
                color: isCyber ? "#050816" : "#FFFFFF",
                border: isCyber ? "none" : "2px solid #000000",
                boxShadow: isCyber ? "0 0 12px rgba(0,245,255,0.4)" : "2px 2px 0 #000000",
              }}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          )}

          <button
            onClick={handleCopyLink}
            className="py-1.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer border"
            style={{
              backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#FFFFFF",
              borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000000",
              color: isCyber ? "#E0E8FF" : "#000000",
              boxShadow: isCyber ? "none" : "2px 2px 0 #000000",
            }}
            title="Copy Profile Link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Link"}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
