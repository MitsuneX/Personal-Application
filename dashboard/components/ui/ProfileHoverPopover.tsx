"use client";

import React, { useRef, useState } from "react";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { FloatingLayer } from "./FloatingLayer";
import { Z_INDEX } from "./ViewportBoundary";
import { 
  Github, 
  Instagram, 
  MessageSquare, 
  Twitter, 
  Share2 
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

  if (plat.includes("discord") || link.includes("discord")) {
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

export interface ProfileHoverPopoverProps {
  children: React.ReactNode;
  placement?: "up" | "right" | "down-left";
  onOpenAesthetics?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function ProfileHoverPopover({
  children,
  placement = "right",
  onOpenAesthetics,
  className = "",
  style = {},
}: ProfileHoverPopoverProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { profile } = useDashboardStore();

  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setIsOpen(false), 200);
  };

  const statusKey = (profile?.status || "online") as keyof typeof STATUS_CONFIG;
  const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.online;
  const zodiacInfo = profile?.zodiac ? ZODIAC_METADATA[profile.zodiac] : null;

  const targetPlacement =
    placement === "up" ? "top-start" : placement === "down-left" ? "bottom-end" : "right-start";

  return (
    <div
      ref={triggerRef}
      className={`inline-block ${className}`}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      <FloatingLayer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
        placement={targetPlacement}
        zIndex={Z_INDEX.POPOVER}
      >
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            width: 320,
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
          {/* Top Banner */}
          <div
            style={{
              height: 90,
              backgroundImage: profile?.banner ? `url(${profile.banner})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: isCyber ? "#0F172A" : "#FFD700",
            }}
            className="relative"
          >
            {/* Status Pill Badge */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: status.color }} />
              <span>{status.label}</span>
            </div>
          </div>

          {/* User Details */}
          <div className="p-4 pt-0 relative select-none">
            {/* Avatar */}
            <div className="-mt-10 mb-2 flex justify-between items-end">
              <div
                className="w-16 h-16 rounded-full overflow-hidden border-2 bg-slate-900"
                style={{ borderColor: isCyber ? "#00F5FF" : "#000" }}
              >
                <img
                  src={profile?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=MitsuneFox"}
                  alt={profile?.name || "User"}
                  className="w-full h-full object-cover"
                />
              </div>

              {zodiacInfo && (
                <span
                  className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-full border flex items-center gap-1"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#FFFCDE",
                    borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000",
                    color: isCyber ? "#00F5FF" : "#000",
                  }}
                >
                  <span>{zodiacInfo.symbol}</span>
                  <span>{profile?.zodiac}</span>
                </span>
              )}
            </div>

            {/* Display Name & Handle */}
            <h4 className="text-base font-black truncate" style={{ color: isCyber ? "#E0E8FF" : "#000" }}>
              {profile?.name || "MitsuneFox"}
            </h4>
            <p className="text-xs font-mono opacity-70 truncate mb-2">
              @{profile?.tagline || "mitsunefox"}
            </p>

            {/* Bio */}
            {profile?.bio && (
              <p className="text-xs opacity-85 leading-relaxed mb-3 line-clamp-2">
                {profile.bio}
              </p>
            )}

            {/* Social Links */}
            {profile?.socials && profile.socials.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
                {profile.socials.map((s: { platform: string; handle: string; url?: string }, idx: number) => {
                  const brand = getSocialBrand(s.platform, s.handle, s.url);
                  const IconComp = brand.icon;
                  return (
                    <a
                      key={idx}
                      href={s.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 text-[10px] font-mono font-bold rounded flex items-center gap-1 transition-transform hover:scale-105"
                      style={{
                        background: isCyber ? brand.bgCyber : brand.bgBrutal,
                        border: `1px solid ${isCyber ? brand.borderCyber : brand.borderBrutal}`,
                        color: isCyber ? brand.textCyber : brand.textBrutal,
                      }}
                    >
                      <IconComp size={12} />
                      <span>{brand.name}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </FloatingLayer>
    </div>
  );
}
