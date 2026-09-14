"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useRouter } from "next/navigation";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { QuickLaunchModal, getShortcutIcon } from "./QuickLaunchModal";
import { DEFAULT_QUICK_LAUNCH_SHORTCUTS, QuickLaunchShortcut } from "@/lib/data/guestSeedData";
import { Settings, Plus, ExternalLink } from "lucide-react";

export function QuickLaunchBar() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const router = useRouter();

  const { profile, updateQuickLaunch } = useDashboardStore();
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [initialAddMode, setInitialAddMode] = useState(false);

  const rawShortcuts = profile?.quickLaunch;
  const shortcuts: QuickLaunchShortcut[] =
    Array.isArray(rawShortcuts) && rawShortcuts.length > 0
      ? rawShortcuts
      : DEFAULT_QUICK_LAUNCH_SHORTCUTS;

  const handleLaunch = (shortcut: QuickLaunchShortcut) => {
    const isExternal = shortcut.type === "external" || /^https?:\/\//i.test(shortcut.target);

    if (isExternal) {
      if (shortcut.openInNewTab !== false) {
        window.open(shortcut.target, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = shortcut.target;
      }
    } else {
      if (shortcut.openInNewTab) {
        window.open(shortcut.target, "_blank", "noopener,noreferrer");
      } else {
        router.push(shortcut.target);
      }
    }
  };

  const handleOpenAdd = () => {
    setInitialAddMode(true);
    setIsCustomizeOpen(true);
  };

  const handleOpenCustomize = () => {
    setInitialAddMode(false);
    setIsCustomizeOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl p-4 border relative overflow-hidden"
        style={{
          backgroundColor: isCyber ? "rgba(10, 15, 30, 0.75)" : "#FFFFFF",
          borderColor: isCyber ? "rgba(0, 245, 255, 0.25)" : "#000000",
          borderWidth: isCyber ? "1px" : "2.5px",
          boxShadow: isCyber ? "0 0 20px rgba(0, 245, 255, 0.08)" : "4px 4px 0 #000000",
        }}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base" role="img" aria-label="bolt">
              ⚡
            </span>
            <h3
              className="font-black text-xs uppercase tracking-wider"
              style={{
                color: isCyber ? "#E0E8FF" : "#1A1A1A",
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
              }}
            >
              {isCyber ? "// QUICK LAUNCH · PERSONAL SHORTCUTS" : "Quick Launch"}
            </h3>
          </div>

          <button
            type="button"
            onClick={handleOpenCustomize}
            className="py-1 px-2.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            style={{
              backgroundColor: isCyber ? "rgba(255, 255, 255, 0.04)" : "#F1F5F9",
              borderColor: isCyber ? "rgba(255, 255, 255, 0.15)" : "#CBD5E1",
              color: isCyber ? "#00F5FF" : "#334155",
            }}
            title="Customize shortcuts, order, and destinations"
          >
            <Settings size={13} />
            <span>Customize</span>
          </button>
        </div>

        {/* Shortcuts Horizontal Wrapping Grid */}
        <div className="flex flex-wrap items-center gap-2">
          {shortcuts.map((shortcut) => {
            const IconComponent = getShortcutIcon(shortcut.icon);
            const accent = shortcut.color || (isCyber ? "#00F5FF" : "#FF6B35");
            const isExternal = shortcut.type === "external" || /^https?:\/\//i.test(shortcut.target);

            return (
              <motion.button
                key={shortcut.id}
                type="button"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleLaunch(shortcut)}
                className="py-2 px-3 rounded-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer border select-none max-w-[200px]"
                style={{
                  backgroundColor: isCyber ? `${accent}12` : "#F8FAFC",
                  borderColor: isCyber ? `${accent}40` : "#CBD5E1",
                  color: isCyber ? "#FFFFFF" : "#1E293B",
                  boxShadow: isCyber
                    ? `0 0 12px ${accent}15`
                    : "2px 2px 0 rgba(0,0,0,0.1)",
                }}
                title={`Launch ${shortcut.name} (${shortcut.target})`}
              >
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${accent}20`,
                    color: accent,
                  }}
                >
                  <IconComponent size={12} style={{ color: accent }} />
                </div>
                <span className="truncate">{shortcut.name}</span>
                {isExternal && (
                  <ExternalLink size={10} className="shrink-0 opacity-50" />
                )}
              </motion.button>
            );
          })}

          {/* Inline Add Quick Shortcut Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenAdd}
            className="py-2 px-2.5 rounded-xl border border-dashed flex items-center justify-center text-xs font-bold transition-all cursor-pointer select-none"
            style={{
              backgroundColor: isCyber ? "rgba(0, 245, 255, 0.05)" : "#F8FAFC",
              borderColor: isCyber ? "rgba(0, 245, 255, 0.3)" : "#94A3B8",
              color: isCyber ? "#00F5FF" : "#64748B",
            }}
            title="Add a new Quick Launch shortcut"
          >
            <Plus size={14} />
          </motion.button>
        </div>
      </motion.div>

      {/* Customize Modal */}
      {isCustomizeOpen && (
        <QuickLaunchModal
          isOpen={isCustomizeOpen}
          onClose={() => setIsCustomizeOpen(false)}
          shortcuts={shortcuts}
          onSave={async (newShortcuts) => {
            await updateQuickLaunch(newShortcuts);
          }}
          initialAddMode={initialAddMode}
        />
      )}
    </>
  );
}
