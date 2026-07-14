"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";

const STATUS_CONFIG = {
  online:  { label: "ONLINE",  color: "#22C55E" },
  away:    { label: "AWAY",    color: "#F59E0B" },
  busy:    { label: "BUSY",    color: "#EF4444" },
  offline: { label: "OFFLINE", color: "#6B7280" },
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
              width: 280,
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
                height: 100,
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
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  overflow: "hidden",
                  position: "absolute",
                  top: -28,
                  border: isCyber ? "3px solid rgba(0,245,255,0.6)" : "3px solid #000",
                  background: isCyber ? "#0A0F2C" : "#FF6B35",
                  boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.3)" : "3px 3px 0 #000",
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
                  <span style={{ fontSize: 22, fontWeight: 900, color: isCyber ? "#00F5FF" : "#fff" }}>
                    {profile.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </span>
                )}
              </motion.div>

              {/* Status dot on avatar */}
              <div
                style={{
                  position: "absolute",
                  width: 13,
                  height: 13,
                  borderRadius: "50%",
                  backgroundColor: status.color,
                  border: isCyber ? "2px solid #050816" : "2px solid #fff",
                  top: -28 + 48,
                  left: 16 + 48,
                  zIndex: 11,
                }}
              />
            </div>

            {/* ── Card Body ────────────────────────────────────────────────── */}
            <div style={{ padding: "40px 16px 14px" }}>
              {/* Name row */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
                <span
                  style={{
                    fontWeight: 900,
                    fontSize: 15,
                    fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                    color: isCyber ? "#00F5FF" : "#1A1A1A",
                    letterSpacing: isCyber ? "0.04em" : "0",
                  }}
                >
                  {profile.name}
                </span>
                {profile.customTag && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: isCyber ? "rgba(0,245,255,0.5)" : "#9CA3AF",
                      fontFamily: "monospace",
                    }}
                  >
                    {profile.customTag}
                  </span>
                )}
              </div>

              {/* Status badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: status.color }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: status.color, letterSpacing: "0.06em" }}>
                  {status.label}
                </span>
              </div>

              {/* Bio (2-line clamp) */}
              {profile.bio && (
                <p
                  style={{
                    fontSize: 11,
                    color: isCyber ? "rgba(224,232,255,0.7)" : "#4B5563",
                    lineHeight: 1.5,
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

              {/* Divider */}
              <div
                style={{
                  height: 1,
                  background: isCyber ? "rgba(0,245,255,0.12)" : "rgba(0,0,0,0.1)",
                  marginBottom: 10,
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
                    boxShadow: isCyber ? "0 0 14px rgba(0,245,255,0.35)" : "3px 3px 0 #000",
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
