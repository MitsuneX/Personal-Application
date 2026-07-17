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
import Link from "next/link";

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
  { href: "/drama/hollywood", icon: "🎬", label: "Hollywood" },
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
        className={`flex flex-col h-full relative overflow-visible select-none ${isMobileDrawer ? "w-64" : ""}`}
        animate={{
          backgroundColor: isCyber ? "rgba(4, 6, 14, 0.98)" : "#FFF9F0",
          borderRightColor: isCyber ? "rgba(0, 245, 255, 0.15)" : "#000000",
        }}
        transition={{ duration: 0.3 }}
        style={{ borderRightWidth: "2px", borderRightStyle: "solid" }}
      >
        {/* Cyber Atmosphere BG Layer */}
        {isCyber && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,1) 2px, rgba(0,245,255,1) 3px)",
              }}
            />
            <div 
              className="absolute top-0 right-0 w-[1px] h-full"
              style={{
                background: "linear-gradient(to bottom, transparent, rgba(0,245,255,0.4), transparent)"
              }}
            />
          </div>
        )}

        {/* ── Brand Header ── */}
        <div
          className="flex items-center gap-3 px-4 h-16 shrink-0 relative"
          style={{ borderBottom: isCyber ? "1px solid rgba(0,245,255,0.08)" : "2px solid rgba(0,0,0,1)" }}
        >
          <motion.div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-base shrink-0"
            animate={{
              backgroundColor: isCyber ? "rgba(0, 245, 255, 0.1)" : "#000000",
              color: isCyber ? "#00F5FF" : "#FFF9F0",
              boxShadow: isCyber ? "0 0 14px rgba(0,245,255,0.25)" : "3px 3px 0px rgba(0,0,0,1)",
              borderRadius: isCyber ? "8px" : "0px",
              border: isCyber ? "1px solid rgba(0,245,255,0.4)" : "2px solid #000000"
            }}
            transition={{ duration: 0.3 }}
          >
            {isCyber ? "◈" : "✦"}
          </motion.div>

          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              className="flex flex-col leading-none min-w-0"
            >
              <span
                className="font-black text-sm tracking-wider uppercase truncate"
                style={{
                  color: isCyber ? "#F0F5FF" : "#000000",
                  fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                  letterSpacing: isCyber ? "0.15em" : "0.05em",
                }}
              >
                {isCyber ? "NEXUS" : "XENON"}
              </span>
              <span
                className="text-[9px] tracking-widest uppercase truncate font-mono mt-0.5"
                style={{ color: isCyber ? "rgba(0,245,255,0.45)" : "rgba(0,0,0,0.5)" }}
              >
                {isCyber ? "SYS // ONLINE" : "CORE // STABLE"}
              </span>
            </motion.div>
          )}

          {/* Collapse Toggle Control */}
          {!isMobileDrawer && onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border flex items-center justify-center text-xs font-black z-50 cursor-pointer shadow-sm select-none transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: isCyber ? "#04060E" : "#FFF9F0",
                borderColor: isCyber ? "rgba(0,245,255,0.4)" : "#000000",
                color: isCyber ? "#00F5FF" : "#000000",
                boxShadow: isCyber ? "0 0 10px rgba(0,245,255,0.2)" : "3px 3px 0px rgba(0,0,0,1)",
                borderWidth: "2px",
              }}
            >
              {collapsed ? "▶" : "◀"}
            </button>
          )}

          {isMobileDrawer && (
            <button onClick={onClose} className="ml-auto p-1 rounded-md text-xs font-bold" style={{ color: isCyber ? "#94A3B8" : "#000" }}>
              ✕
            </button>
          )}
        </div>

        {/* ── Navigation List ── */}
        <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-4 custom-scrollbar">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="space-y-0.5">
              {!collapsed && (
                <p
                  className="px-3 pb-1.5 text-[10px] font-bold tracking-widest uppercase font-mono"
                  style={{ color: isCyber ? "rgba(0,245,255,0.3)" : "rgba(0,0,0,0.4)" }}
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
                        <motion.button
                          onClick={() => setDramaOpen((o) => !o)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold relative"
                          animate={{
                            backgroundColor: isDramaActive
                              ? isCyber ? "rgba(0,245,255,0.06)" : "rgba(0,0,0,0.05)"
                              : "transparent",
                            color: isDramaActive
                              ? isCyber ? "#00F5FF" : "#000000"
                              : isCyber ? "#8A99AD" : "#4A4A4A",
                          }}
                          whileHover={{ backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
                        >
                          {isDramaActive && (
                            <motion.div
                              layoutId="nav-active-bar"
                              className="absolute left-1 w-1 h-4 rounded-full"
                              style={{ 
                                backgroundColor: isCyber ? "#00F5FF" : "#000000", 
                                boxShadow: isCyber ? "0 0 8px rgba(0,245,255,0.6)" : "none" 
                              }}
                              transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                          )}
                          <span className="text-base w-5 text-center">{item.icon}</span>
                          {!collapsed && (
                            <>
                              <span className="flex-1 text-left tracking-wide">{item.label}</span>
                              <motion.span
                                animate={{ rotate: dramaOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-[10px] opacity-50"
                              >
                                ▼
                              </motion.span>
                            </>
                          )}
                        </motion.button>

                        <AnimatePresence initial={false}>
                          {dramaOpen && !collapsed && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="overflow-hidden ml-5 pl-2.5 mt-0.5 space-y-0.5"
                              style={{ borderLeft: isCyber ? "1px solid rgba(0,245,255,0.1)" : "2px solid rgba(0,0,0,0.1)" }}
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
                        <motion.button
                          onClick={() => setTokusatsuOpen((o) => !o)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold relative"
                          animate={{
                            backgroundColor: isTokusatsuActive
                              ? isCyber ? "rgba(0,245,255,0.06)" : "rgba(0,0,0,0.05)"
                              : "transparent",
                            color: isTokusatsuActive
                              ? isCyber ? "#00F5FF" : "#000000"
                              : isCyber ? "#8A99AD" : "#4A4A4A",
                          }}
                          whileHover={{ backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
                        >
                          {isTokusatsuActive && (
                            <motion.div
                              layoutId="nav-active-bar"
                              className="absolute left-1 w-1 h-4 rounded-full"
                              style={{ 
                                backgroundColor: isCyber ? "#00F5FF" : "#000000", 
                                boxShadow: isCyber ? "0 0 8px rgba(0,245,255,0.6)" : "none" 
                              }}
                              transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                          )}
                          <span className="text-base w-5 text-center">{item.icon}</span>
                          {!collapsed && (
                            <>
                              <span className="flex-1 text-left tracking-wide">{item.label}</span>
                              <motion.span
                                animate={{ rotate: tokusatsuOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-[10px] opacity-50"
                              >
                                ▼
                              </motion.span>
                            </>
                          )}
                        </motion.button>

                        <AnimatePresence initial={false}>
                          {tokusatsuOpen && !collapsed && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="overflow-hidden ml-5 pl-2.5 mt-0.5 space-y-0.5"
                              style={{ borderLeft: isCyber ? "1px solid rgba(0,245,255,0.1)" : "2px solid rgba(0,0,0,0.1)" }}
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

        {/* ── Premium Clean Profile Plate ── */}
        {!collapsed ? (
          <div
            className="shrink-0 relative overflow-visible transition-colors duration-300"
            style={{
              borderTop: isCyber ? "1px solid rgba(0,245,255,0.1)" : "2px solid #000000",
              height: 84,
              background: isCyber ? "rgba(6, 9, 22, 0.98)" : "#FFFDF6",
            }}
          >
            {/* Nameplate Backdrop Asset */}
            {profile.nameplate && (
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-25 mix-blend-luminosity">
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

            {/* Profile Content Block */}
            <div className="absolute inset-0 z-10 flex items-center p-4 min-w-0">
              <ProfileHoverPopover
                onOpenAesthetics={() => setAestheticsOpen(true)}
                placement="up"
                className="min-w-0 w-full relative"
              >
                <div className="flex items-center gap-3 cursor-pointer min-w-0 group/plate w-full">
                  {/* Avatar wrapper */}
                  <div className="relative shrink-0">
                    <div 
                      className="w-10 h-10 rounded-full overflow-hidden transition-transform duration-300 group-hover/plate:scale-105"
                      style={{
                        border: isCyber ? "1px solid rgba(0,245,255,0.4)" : "2px solid #000000",
                        boxShadow: isCyber ? "0 0 8px rgba(0,245,255,0.2)" : "none"
                      }}
                    >
                      <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    {/* Pulsing Status Dot */}
                    <span 
                      className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border bg-[#22c55e]"
                      style={{
                        borderColor: isCyber ? "#060916" : "#FFFDF6",
                        boxShadow: "0 0 6px #22c55e",
                      }}
                    />
                  </div>

                  {/* Identity text labels */}
                  <div className="min-w-0 flex-1 leading-tight pr-1">
                    <p 
                      className="font-black text-xs truncate transition-colors" 
                      style={{ color: isCyber ? "#E2E8F0" : "#000000" }}
                    >
                      {profile.name}
                    </p>
                    <p className="text-[9px] theme-text-muted truncate font-bold font-mono uppercase tracking-wider mt-0.5">
                      {profile.customTag ? profile.customTag : (isCyber ? `SYS::${profile.status.toUpperCase()}` : profile.tagline)}
                    </p>
                  </div>
                </div>
              </ProfileHoverPopover>
            </div>
          </div>
        ) : (
          <div 
            className="py-4 shrink-0 flex justify-center cursor-pointer"
            style={{ borderTop: isCyber ? "1px solid rgba(0,245,255,0.1)" : "2px solid #000000" }}
          >
            <ProfileHoverPopover
              onOpenAesthetics={() => setAestheticsOpen(true)}
              placement="right"
            >
              <div onClick={() => router.push("/profile")} className="relative group/collapsedPlate">
                <div 
                  className="w-9 h-9 rounded-full overflow-hidden transition-transform duration-300 group-hover/collapsedPlate:scale-105" 
                  style={{ border: isCyber ? "1px solid rgba(0,245,255,0.4)" : "2px solid #000000" }}
                >
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
            </ProfileHoverPopover>
          </div>
        )}
      </motion.aside>

      {/* Dialog Layers */}
      <ProfileEditorModal isOpen={editorOpen} onClose={() => setEditorOpen(false)} />
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
      className="p-1 rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10 relative flex items-center justify-center cursor-pointer"
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
      className="p-1 rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10 relative flex items-center justify-center cursor-pointer"
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