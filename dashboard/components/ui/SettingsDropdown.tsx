"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useRouter } from "next/navigation";
import { ChangelogModal } from "@/components/ui/ChangelogModal";

interface SettingsDropdownProps {
  onOpenAesthetics?: () => void;
}

export function SettingsDropdown({ onOpenAesthetics }: SettingsDropdownProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative z-40">
      {/* Trigger Settings Button */}
      <motion.button
        whileHover={{ scale: 1.05, rotate: 30 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black border cursor-pointer transition-colors"
        style={{
          backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "#FFF9F0",
          borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
          borderWidth: isCyber ? "1px" : "2px",
          color: isCyber ? "#00F5FF" : "#000000",
          boxShadow: isCyber ? "0 0 10px rgba(0,245,255,0.2)" : "2px 2px 0 #000000",
        }}
        title="Settings & Log Updates"
        aria-label="Settings Menu"
      >
        ⚙️
      </motion.button>

      {/* Settings Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-11 right-0 w-56 p-2 rounded-2xl border shadow-2xl backdrop-blur-xl space-y-1 select-none"
            style={{
              backgroundColor: isCyber ? "rgba(5, 8, 22, 0.95)" : "#FFFFFF",
              borderColor: isCyber ? "rgba(0, 245, 255, 0.4)" : "#000000",
              borderWidth: isCyber ? "1px" : "3px",
              boxShadow: isCyber ? "0 0 25px rgba(0, 245, 255, 0.25)" : "4px 4px 0 #000000",
              color: isCyber ? "#E0E8FF" : "#000000",
            }}
          >
            {/* Header Title */}
            <div className="px-3 py-1.5 border-b mb-1" style={{ borderColor: isCyber ? "rgba(0,245,255,0.15)" : "rgba(0,0,0,0.1)" }}>
              <span className="text-[10px] font-black uppercase tracking-wider opacity-60" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
                ⚙️ Quick Settings
              </span>
            </div>

            {/* Menu Items */}
            {/* 1. Log Updates (Changelog) */}
            <button
              onClick={() => {
                setIsOpen(false);
                setChangelogOpen(true);
              }}
              className="w-full text-left px-3 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-between cursor-pointer"
              style={{
                backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#FFF9F0",
                color: isCyber ? "#00F5FF" : "#000000",
              }}
            >
              <div className="flex items-center gap-2">
                <span>📜</span>
                <span>Log Updates</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase bg-cyan-500/20 text-cyan-300">
                v2.5.0
              </span>
            </button>

            {/* 2. Theme Aesthetics */}
            <button
              onClick={() => {
                setIsOpen(false);
                if (onOpenAesthetics) onOpenAesthetics();
              }}
              className="w-full text-left px-3 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 hover:bg-slate-800/40 cursor-pointer"
            >
              <span>🎨</span>
              <span>Theme Aesthetics</span>
            </button>

            {/* 3. Profile Panel */}
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/profile");
              }}
              className="w-full text-left px-3 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 hover:bg-slate-800/40 cursor-pointer"
            >
              <span>👤</span>
              <span>Profile Settings</span>
            </button>

            {/* 4. Log Out Session */}
            <div className="pt-1 border-t" style={{ borderColor: isCyber ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)" }}>
              <button
                onClick={async () => {
                  setIsOpen(false);
                  if (confirm("Are you sure you want to log out?")) {
                    try {
                      const { createClient } = await import("@/utils/supabase/client");
                      const supabase = createClient();
                      await supabase.auth.signOut();
                    } catch (err) {
                      console.error(err);
                    }
                    localStorage.removeItem("supabase.auth.token");
                    router.push("/login");
                  }
                }}
                className="w-full text-left px-3 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                style={{
                  backgroundColor: isCyber ? "rgba(239, 68, 68, 0.15)" : "#FEE2E2",
                  color: isCyber ? "#EF4444" : "#991B1B",
                }}
              >
                <span>🚪</span>
                <span>Log Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Changelog Modal */}
      <ChangelogModal isOpen={changelogOpen} onClose={() => setChangelogOpen(false)} />
    </div>
  );
}
