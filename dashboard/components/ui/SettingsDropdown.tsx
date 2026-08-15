"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useRouter } from "next/navigation";
import { ChangelogModal } from "@/components/ui/ChangelogModal";
import { useConfirm } from "@/lib/context/ConfirmContext";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { FloatingPopover } from "@/components/ui/FloatingPopover";
import { Z_INDEX } from "./ViewportBoundary";

interface SettingsDropdownProps {
  onOpenAesthetics?: () => void;
  onOpenHistory?: () => void;
}

export function SettingsDropdown({ onOpenAesthetics, onOpenHistory }: SettingsDropdownProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const router = useRouter();
  const { confirm } = useConfirm();

  const [isOpen, setIsOpen] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <FloatingPopover
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement="bottom-end"
        triggerMode="click"
        offsetDistance={10}
        zIndex={Z_INDEX.POPOVER}
        content={({ close }) => (
          <div
            className="w-56 p-2 rounded-2xl border shadow-2xl backdrop-blur-xl space-y-1 select-none font-mono"
            style={{
              backgroundColor: isCyber ? "rgba(5, 8, 22, 0.96)" : "#FFFFFF",
              borderColor: isCyber ? "rgba(0, 245, 255, 0.4)" : "#000000",
              borderWidth: isCyber ? "1px" : "3px",
              boxShadow: isCyber ? "0 0 25px rgba(0, 245, 255, 0.25)" : "4px 4px 0 #000000",
              color: isCyber ? "#E0E8FF" : "#000000",
            }}
          >
            {/* Header Title */}
            <div
              className="px-3 py-1.5 border-b mb-1"
              style={{ borderColor: isCyber ? "rgba(0,245,255,0.15)" : "rgba(0,0,0,0.1)" }}
            >
              <span
                className="text-[10px] font-black uppercase tracking-wider opacity-60"
                style={{ color: isCyber ? "#00F5FF" : "#000000" }}
              >
                ⚙️ Quick Settings
              </span>
            </div>

            {/* Menu Items */}
            {/* 1. Log Updates (Changelog) */}
            <button
              onClick={() => {
                close();
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
                v12.3.0
              </span>
            </button>

            {/* 2. Theme Aesthetics */}
            <button
              onClick={() => {
                close();
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
                close();
                router.push("/profile");
              }}
              className="w-full text-left px-3 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 hover:bg-slate-800/40 cursor-pointer"
            >
              <span>👤</span>
              <span>Profile Settings</span>
            </button>

            {/* 4. History */}
            <button
              onClick={() => {
                close();
                if (onOpenHistory) onOpenHistory();
              }}
              className="w-full text-left px-3 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 hover:bg-slate-800/40 cursor-pointer"
            >
              <span>📜</span>
              <span>History</span>
            </button>

            {/* 5. Log Out Session */}
            <div
              className="pt-1 border-t"
              style={{ borderColor: isCyber ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)" }}
            >
              <button
                onClick={() => {
                  close();
                  confirm({
                    title: "Logout Confirmation",
                    message: "Are you sure you want to sign out of Nexus Xenon?",
                    confirmText: "Log Out",
                    cancelText: "Stay Signed In",
                    variant: "warning",
                    actionType: "logout",
                    itemPreview: {
                      title: "Personal Dashboard Session",
                      subtitle: "Nexus Xenon Command Center",
                      icon: "🚪",
                    },
                    successToast: "✓ Logged out successfully.",
                    onConfirm: async () => {
                      try {
                        useDashboardStore.getState().resetUserStore();
                        document.cookie =
                          "is_guest=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
                        localStorage.removeItem("is_guest");
                        const { createClient } = await import("@/utils/supabase/client");
                        const supabase = createClient();
                        await supabase.auth.signOut();
                      } catch (err) {
                        console.error(err);
                      }
                      window.location.href = "/login";
                    },
                  });
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
              >
                <span>🚪</span>
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
      >
        <motion.button
          ref={buttonRef}
          whileHover={{ scale: 1.05, y: -1, rotate: 20 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-black border cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 shrink-0"
          style={{
            backgroundColor: isCyber ? "rgba(0,245,255,0.05)" : "#FFF9F0",
            borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
            borderWidth: isCyber ? "1px" : "2px",
            color: isCyber ? "#00F5FF" : "#000000",
            boxShadow: isCyber ? "0 0 12px rgba(0,245,255,0.15)" : "2.5px 2.5px 0 #000000",
          }}
          title="Settings & Log Updates"
          aria-label="Settings Menu"
        >
          ⚙️
        </motion.button>
      </FloatingPopover>

      {/* Changelog Modal */}
      <ChangelogModal isOpen={changelogOpen} onClose={() => setChangelogOpen(false)} />
    </>
  );
}
