"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { NavLink } from "@/components/ui/NavLink";
import { usePathname, useRouter } from "next/navigation";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { ProfileEditorModal } from "@/components/ui/ProfileEditorModal";
import { ProfileHoverPopover } from "@/components/ui/ProfileHoverPopover";
import { AestheticsModal } from "@/components/ui/AestheticsModal";

interface SidebarProps {
  collapsed?: boolean;
  onClose?: () => void;
  isMobileDrawer?: boolean;
  onToggleCollapse?: () => void;
}

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { href: "/", icon: "🏠", label: "Dashboard", exact: true },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/anime", icon: "⛩️", label: "Anime" },
      { href: "/drama", icon: "🎬", label: "Drama" },
      { href: "/music", icon: "🎵", label: "Music" },
      { href: "/hall-of-fame", icon: "🏆", label: "Hall of Fame" },
      { href: "/characters", icon: "📖", label: "Characters" },
      { href: "/tokusatsu", icon: "🦸", label: "Tokusatsu" },
    ],
  },
  {
    label: "Gaming",
    items: [
      { href: "/games", icon: "🎮", label: "Games" },
      { href: "/heroes", icon: "🛡️", label: "Heroes" },
    ],
  },
  {
    label: "Misc",
    items: [
      { href: "/hobbies", icon: "🎯", label: "Hobbies" },
      { href: "/notepad", icon: "📝", label: "Notepad" },
      { href: "/links", icon: "🔗", label: "Links" },
      { href: "/gallery", icon: "🖼️", label: "Gallery" },
      { href: "/prompt-vault", icon: "⚡", label: "Prompt Vault" },
    ],
  },
];

const DRAMA_SUB = [
  { href: "/drama/japanese",  icon: "🇯🇵", label: "Japanese"  },
  { href: "/drama/korean",    icon: "🇰🇷", label: "Korean"    },
  { href: "/drama/chinese",   icon: "🇨🇳", label: "Chinese"   },
  { href: "/drama/hollywood", icon: "🎬", label: "Hollywood"  },
];

const TOKUSATSU_SUB = [
  { href: "/tokusatsu/ultraman",      icon: "🔴", label: "Ultraman" },
  { href: "/tokusatsu/kamen-rider",    icon: "🟢", label: "Kamen Rider" },
  { href: "/tokusatsu/power-rangers",  icon: "⚡", label: "Power Rangers" },
];

export function Sidebar({ collapsed = false, onClose, isMobileDrawer = false, onToggleCollapse }: SidebarProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const pathname = usePathname();
  const [dramaOpen, setDramaOpen] = useState(pathname.startsWith("/drama"));
  const [tokusatsuOpen, setTokusatsuOpen] = useState(pathname.startsWith("/tokusatsu"));
  const [editorOpen, setEditorOpen] = useState(false);
  const [aestheticsOpen, setAestheticsOpen] = useState(false);
  const router = useRouter();

  const { profile } = useDashboardStore();
  const avatar = profile.avatar || "/avatar.png";
  const isDramaActive = pathname.startsWith("/drama");
  const isTokusatsuActive = pathname.startsWith("/tokusatsu");

  return (
    <>
      <motion.aside
        className={`flex flex-col h-full relative overflow-visible ${isMobileDrawer ? "w-64" : ""}`}
        animate={{
          backgroundColor: isCyber ? "rgba(5, 8, 22, 0.95)" : "#FFF5E4",
          borderRightColor: isCyber ? "rgba(0,245,255,0.2)" : "#000000",
        }}
        transition={{ duration: 0.5 }}
        style={{ borderRightWidth: "2px", borderRightStyle: "solid" }}
      >
        {/* Cyber BG effects */}
        {isCyber && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,1) 2px, rgba(0,245,255,1) 3px)",
              }}
            />
            <motion.div
              className="absolute -top-20 -left-20 w-48 h-48 rounded-full"
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ background: "radial-gradient(circle, rgba(0,245,255,0.3) 0%, transparent 70%)", filter: "blur(30px)" }}
            />
          </div>
        )}

        {/* ── Brand ── */}
        <div
          className="flex items-center gap-3 px-4 h-16 shrink-0 relative"
          style={{ borderBottom: isCyber ? "1px solid rgba(0,245,255,0.12)" : "2px solid rgba(0,0,0,0.1)" }}
        >
          <motion.div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-base shrink-0"
            animate={{
              backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
              color: isCyber ? "#050816" : "#fff",
              boxShadow: isCyber ? "0 0 12px rgba(0,245,255,0.7)" : "2px 2px 0px 0px rgba(0,0,0,1)",
              borderRadius: isCyber ? "8px" : "4px",
            }}
            transition={{ duration: 0.5 }}
          >
            {isCyber ? "◈" : "✦"}
          </motion.div>

          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="flex flex-col leading-tight min-w-0"
            >
              <motion.span
                className="font-black text-sm truncate"
                animate={{
                  color: isCyber ? "#E0E8FF" : "#1A1A1A",
                  fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                  letterSpacing: isCyber ? "0.12em" : "0em",
                }}
                transition={{ duration: 0.4 }}
              >
                {isCyber ? "NEXUS" : "XENON"}
              </motion.span>
              <motion.span
                className="text-xs tracking-widest uppercase truncate"
                animate={{ color: isCyber ? "rgba(0,245,255,0.5)" : "rgba(0,0,0,0.4)" }}
                transition={{ duration: 0.4 }}
              >
                {isCyber ? "// Cyberpunk Mode" : "Neubrutalism Mode"}
              </motion.span>
            </motion.div>
          )}

          {/* Collapse toggle button for desktop */}
          {!isMobileDrawer && onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border flex items-center justify-center text-xs font-black z-50 cursor-pointer shadow-md select-none transition-all hover:scale-110 active:scale-95"
              style={{
                backgroundColor: isCyber ? "#050816" : "#FFF5E4",
                borderColor: isCyber ? "#00F5FF" : "#000000",
                color: isCyber ? "#00F5FF" : "#000000",
                boxShadow: isCyber ? "0 0 10px rgba(0,245,255,0.4)" : "3px 3px 0px rgba(0,0,0,1)",
                borderWidth: "2px",
              }}
            >
              {collapsed ? "▶" : "◀"}
            </button>
          )}

          {/* Mobile close */}
          {isMobileDrawer && (
            <button onClick={onClose} className="ml-auto p-1 rounded-md" style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}>
              ✕
            </button>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              {/* Section label */}
              {!collapsed && (
                <p
                  className="px-3 pb-1.5 text-xs font-bold tracking-widest uppercase"
                  style={{ color: isCyber ? "rgba(0,245,255,0.35)" : "rgba(0,0,0,0.3)" }}
                >
                  {section.label}
                </p>
              )}

              {section.items.map((item) => {
                const isDrama = item.href === "/drama";
                return (
                  <div key={item.href}>
                    {isDrama ? (
                      <>
                        {/* Drama accordion toggle */}
                        <motion.button
                          onClick={() => setDramaOpen((o) => !o)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold relative"
                          animate={{
                            backgroundColor: isDramaActive
                              ? isCyber ? "rgba(0,245,255,0.1)" : "rgba(255,107,53,0.12)"
                              : "rgba(0,0,0,0)",
                            color: isDramaActive
                              ? isCyber ? "#00F5FF" : "#FF6B35"
                              : isCyber ? "#94A3B8" : "#4A4A4A",
                          }}
                          whileHover={{ backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
                          transition={{ duration: 0.15 }}
                        >
                          {isDramaActive && (
                            <motion.div
                              layoutId="nav-active-bar"
                              className="absolute left-2 w-0.5 h-5 rounded-full"
                              style={{ backgroundColor: isCyber ? "#00F5FF" : "#FF6B35", boxShadow: isCyber ? "0 0 8px rgba(0,245,255,0.9)" : "none" }}
                              transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                          )}
                          <span className="text-lg w-6 text-center">{item.icon}</span>
                          {!collapsed && (
                            <>
                              <span className="flex-1 text-left">{item.label}</span>
                              <motion.span
                                animate={{ rotate: dramaOpen ? 180 : 0 }}
                                transition={{ duration: 0.25 }}
                                className="text-xs opacity-60"
                              >
                                ▼
                              </motion.span>
                            </>
                          )}
                        </motion.button>

                        {/* Sub-items */}
                        <AnimatePresence initial={false}>
                          {dramaOpen && !collapsed && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="overflow-hidden ml-4 pl-3 mt-1 space-y-0.5"
                              style={{ borderLeft: isCyber ? "1px solid rgba(0,245,255,0.15)" : "2px solid rgba(0,0,0,0.1)" }}
                            >
                              {DRAMA_SUB.map((sub) => (
                                <NavLink key={sub.href} href={sub.href} icon={sub.icon} label={sub.label} onClick={onClose} />
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : item.href === "/tokusatsu" ? (
                      <>
                        {/* Tokusatsu accordion toggle */}
                        <motion.button
                          onClick={() => setTokusatsuOpen((o) => !o)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold relative"
                          animate={{
                            backgroundColor: isTokusatsuActive
                              ? isCyber ? "rgba(0,245,255,0.1)" : "rgba(255,107,53,0.12)"
                              : "rgba(0,0,0,0)",
                            color: isTokusatsuActive
                              ? isCyber ? "#00F5FF" : "#FF6B35"
                              : isCyber ? "#94A3B8" : "#4A4A4A",
                          }}
                          whileHover={{ backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
                          transition={{ duration: 0.15 }}
                        >
                          {isTokusatsuActive && (
                            <motion.div
                              layoutId="nav-active-bar"
                              className="absolute left-2 w-0.5 h-5 rounded-full"
                              style={{ backgroundColor: isCyber ? "#00F5FF" : "#FF6B35", boxShadow: isCyber ? "0 0 8px rgba(0,245,255,0.9)" : "none" }}
                              transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                          )}
                          <span className="text-lg w-6 text-center">{item.icon}</span>
                          {!collapsed && (
                            <>
                              <span className="flex-1 text-left">{item.label}</span>
                              <motion.span
                                animate={{ rotate: tokusatsuOpen ? 180 : 0 }}
                                transition={{ duration: 0.25 }}
                                className="text-xs opacity-60"
                              >
                                ▼
                              </motion.span>
                            </>
                          )}
                        </motion.button>

                        {/* Sub-items */}
                        <AnimatePresence initial={false}>
                          {tokusatsuOpen && !collapsed && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="overflow-hidden ml-4 pl-3 mt-1 space-y-0.5"
                              style={{ borderLeft: isCyber ? "1px solid rgba(0,245,255,0.15)" : "2px solid rgba(0,0,0,0.1)" }}
                            >
                              {TOKUSATSU_SUB.map((sub) => (
                                <NavLink key={sub.href} href={sub.href} icon={sub.icon} label={sub.label} onClick={onClose} />
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <NavLink
                        href={item.href}
                        icon={item.icon}
                        label={collapsed ? "" : item.label}
                        exact={"exact" in item ? (item as {exact?: boolean}).exact : false}
                        collapsed={collapsed}
                        onClick={onClose}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {!collapsed ? (
          <div
            className="shrink-0 relative overflow-visible"
            style={{
              borderTop: isCyber ? "1px solid rgba(0,245,255,0.12)" : "2px solid rgba(0,0,0,0.1)",
              height: "auto",
              background: isCyber ? "rgba(5, 8, 22, 0.95)" : "#FFFDEB",
            }}
          >
            {/* Nameplate background */}
            {profile.nameplate && (
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-40">
                {/\.(mp4|webm|ogg)(\?.*)?$/i.test(profile.nameplate) ? (
                  <video
                    src={profile.nameplate}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={profile.nameplate}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}

            {/* Sidebar Bottom Bar Container */}
            <div className="relative z-10 flex flex-col justify-between p-3.5 min-w-0 gap-1.5">
              <ProfileHoverPopover
                onOpenAesthetics={() => setAestheticsOpen(true)}
                placement="up"
                className="min-w-0 w-full relative"
              >
                <div className="flex flex-col gap-1.5 cursor-pointer min-w-0">
                  {/* Top Row: Avatar & Name */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Avatar with status dot */}
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full overflow-hidden border"
                        style={{
                          borderColor: isCyber ? "#00F5FF" : "#FF6B35",
                        }}
                      >
                        <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      {/* Active Status Dot */}
                      <span 
                        className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border bg-[#22c55e]"
                        style={{
                          borderColor: isCyber ? "#050816" : "#FFFFFF",
                          boxShadow: "0 0 6px #22c55e",
                        }}
                      />
                    </div>

                    {/* Name & tagline/customTag */}
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="font-black text-xs truncate" style={{ color: isCyber ? "#E0E8FF" : "#1A1A1A" }}>
                        {profile.name}
                      </p>
                      <p className="text-[9px] theme-text-muted truncate font-bold font-mono">
                        {profile.customTag ? profile.customTag : (isCyber ? `STATUS::${profile.status.toUpperCase()}` : profile.tagline)}
                      </p>
                    </div>
                  </div>

                  {/* Bio snippet */}
                  {profile.bio && (
                    <p className="text-[10px] theme-text-secondary line-clamp-2 leading-normal">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </ProfileHoverPopover>
            </div>
          </div>
        ) : (
          <ProfileHoverPopover
            onOpenAesthetics={() => setAestheticsOpen(true)}
            placement="right"
          >
            <div
              onClick={() => router.push("/profile")}
              className="py-4 shrink-0 flex justify-center cursor-pointer block"
              style={{ borderTop: isCyber ? "1px solid rgba(0,245,255,0.12)" : "2px solid rgba(0,0,0,0.1)" }}
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full overflow-hidden border-2" style={{ borderColor: isCyber ? "#00F5FF" : "#FF6B35" }}>
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <span 
                  className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border bg-[#22c55e]"
                  style={{
                    borderColor: isCyber ? "#050816" : "#FFFFFF",
                    boxShadow: "0 0 6px #22c55e",
                  }}
                />
              </div>
            </div>
          </ProfileHoverPopover>
        )}
      </motion.aside>

      {/* Profile Editor Dialog */}
      <ProfileEditorModal isOpen={editorOpen} onClose={() => setEditorOpen(false)} />

      {/* Aesthetics Dialog */}
      <AestheticsModal isOpen={aestheticsOpen} onClose={() => setAestheticsOpen(false)} />
    </>
  );
}

function SidebarMicButton({ isCyber }: { isCyber: boolean }) {
  const [isMuted, setIsMuted] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setIsMuted(!isMuted)}
      className="p-1 rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10 relative flex items-center justify-center"
      style={{ color: isMuted ? "#EF4444" : isCyber ? "#00F5FF" : "#6B7280", width: 22, height: 22 }}
      title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
    >
      <span>🎙️</span>
      {isMuted && (
        <span
          className="absolute inset-0 flex items-center justify-center font-black text-red-500 pointer-events-none select-none"
          style={{ fontSize: "16px", transform: "rotate(-45deg)", marginTop: "-2px" }}
        >
          \
        </span>
      )}
    </button>
  );
}

function SidebarDeafenButton({ isCyber }: { isCyber: boolean }) {
  const [isDeafened, setIsDeafened] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setIsDeafened(!isDeafened)}
      className="p-1 rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10 relative flex items-center justify-center"
      style={{ color: isDeafened ? "#EF4444" : isCyber ? "#00F5FF" : "#6B7280", width: 22, height: 22 }}
      title={isDeafened ? "Undeafen Audio" : "Deafen Audio"}
    >
      <span>🎧</span>
      {isDeafened && (
        <span
          className="absolute inset-0 flex items-center justify-center font-black text-red-500 pointer-events-none select-none"
          style={{ fontSize: "16px", transform: "rotate(-45deg)", marginTop: "-2px" }}
        >
          \
        </span>
      )}
    </button>
  );
}