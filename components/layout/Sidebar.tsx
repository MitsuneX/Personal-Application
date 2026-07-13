"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { NavLink } from "@/components/ui/NavLink";
import { ThemeSwitcherToggle } from "@/components/ui/ThemeSwitcherToggle";
import { usePathname } from "next/navigation";

interface SidebarProps {
  collapsed?: boolean;
  onClose?: () => void;
  isMobileDrawer?: boolean;
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
      { href: "/hall-of-fame", icon: "🏆", label: "Hall of Fame" },
    ],
  },
  {
    label: "Gaming",
    items: [
      { href: "/games", icon: "🎮", label: "Games" },
    ],
  },
];

const DRAMA_SUB = [
  { href: "/drama/japanese", icon: "🇯🇵", label: "Japanese" },
  { href: "/drama/korean",   icon: "🇰🇷", label: "Korean"   },
  { href: "/drama/chinese",  icon: "🇨🇳", label: "Chinese"  },
];

export function Sidebar({ collapsed = false, onClose, isMobileDrawer = false }: SidebarProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const pathname = usePathname();
  const [dramaOpen, setDramaOpen] = useState(pathname.startsWith("/drama"));

  const isDramaActive = pathname.startsWith("/drama");

  return (
    <motion.aside
      className={`flex flex-col h-full relative overflow-hidden ${isMobileDrawer ? "w-64" : ""}`}
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
        className="flex items-center gap-3 px-4 h-16 shrink-0"
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
                letterSpacing: isCyber ? "0.08em" : "0em",
              }}
              transition={{ duration: 0.4 }}
            >
              {isCyber ? "NEXUS" : "Dashboard"}
            </motion.span>
            <motion.span
              className="text-xs tracking-widest uppercase truncate"
              animate={{ color: isCyber ? "rgba(0,245,255,0.5)" : "rgba(0,0,0,0.4)" }}
              transition={{ duration: 0.4 }}
            >
              {isCyber ? "// v2.0" : "Personal Hub"}
            </motion.span>
          </motion.div>
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
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold"
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

      {/* ── Bottom: Theme Switcher ── */}
      <div
        className="px-4 py-4 shrink-0"
        style={{ borderTop: isCyber ? "1px solid rgba(0,245,255,0.12)" : "2px solid rgba(0,0,0,0.1)" }}
      >
        {!collapsed && (
          <p
            className="text-xs font-bold tracking-widest uppercase mb-3"
            style={{ color: isCyber ? "rgba(0,245,255,0.35)" : "rgba(0,0,0,0.3)" }}
          >
            Theme
          </p>
        )}
        <div className={collapsed ? "flex justify-center" : ""}>
          <ThemeSwitcherToggle />
        </div>
      </div>
    </motion.aside>
  );
}
