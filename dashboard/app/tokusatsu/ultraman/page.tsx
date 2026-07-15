"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { gridContainerVariants } from "@/lib/theme/motionVariants";
import { HofEditorModal } from "@/components/ui/HofEditorModal";
import { HofEntryCard, getGroupForEntry, getGroupDetails } from "@/components/cards/HofEntryCard";
import type { HallOfFameEntry } from "@/lib/store/dashboardStore";
import { triggerHeartEffect } from "@/components/ui/FloatingHeartEngine";

const ULTRAMAN_THEME = {
  cyber: {
    banner: "linear-gradient(135deg, #0A0A0A 0%, rgba(239,68,68,0.15) 50%, #0A0A0A 100%)",
    border: "rgba(239,68,68,0.4)",
    accent: "#EF4444",
    accent2: "#E2E8F0",
    textShadow: "0 0 20px rgba(239,68,68,0.6)"
  },
  brutal: {
    banner: "linear-gradient(135deg, #FFD2D2 0%, #FFF5F5 50%, #EF4444 100%)",
    border: "#000000",
    accent: "#EF4444",
    accent2: "#708090"
  }
};

export default function UltramanPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { hallOfFame, deleteHof } = useDashboardStore();

  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<HallOfFameEntry | null>(null);

  const t = isCyber ? ULTRAMAN_THEME.cyber : ULTRAMAN_THEME.brutal;

  // Filter for Ultraman franchise entries
  const ultramanEntries = hallOfFame.filter(
    (e) => e.tokusatsuFranchise?.toLowerCase() === "ultraman"
  );

  const handleEdit = useCallback((entry: HallOfFameEntry) => {
    setSelectedEntry(entry);
    setEditorOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string, name: string) => {
    if (confirm(`Remove "${name}" from Ultraman roster?`)) {
      await deleteHof(id);
    }
  }, [deleteHof]);

  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    let clientX = 0, clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    triggerHeartEffect(clientX, clientY);
  };

  return (
    <AppShell>
      {/* ── Franchise Hero Banner ── */}
      <motion.div
        className="relative rounded-2xl overflow-hidden mb-8 p-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        style={{
          background: t.banner,
          border: isCyber ? `1px solid ${t.border}` : `3px solid ${t.border}`,
          boxShadow: isCyber ? "0 0 50px rgba(239,68,68,0.15)" : "6px 6px 0 rgba(0,0,0,1)",
        }}
      >
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative z-10">
          <div>
            <motion.p 
              className="text-xs font-bold tracking-[0.25em] uppercase mb-2" 
              style={{ color: t.accent }}
            >
              {isCyber ? "// SSSP.DATABASE" : "Science Special Search Party"}
            </motion.p>
            <h1 
              className="font-black text-3xl md:text-5xl mb-2" 
              style={{ 
                color: isCyber ? "#E2E8F0" : "#1A1A1A", 
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                textShadow: isCyber ? t.textShadow : "none" 
              }}
            >
              {isCyber ? "ULTRAMAN_ROSTER" : "Ultraman Franchise Roster"}
            </h1>
            <p className="text-sm opacity-80" style={{ color: isCyber ? "#94A3B8" : "#333" }}>
              The legendary silver and red giants protecting earth from giant Kaiju and alien threats.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedEntry(null);
              setEditorOpen(true);
            }}
            className="px-4 py-2 text-xs font-black rounded-lg transition-transform active:scale-95 border shrink-0"
            style={{
              backgroundColor: t.accent,
              color: "#FFF",
              borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000",
              boxShadow: isCyber ? "0 0 15px rgba(239, 68, 68, 0.4)" : "4px 4px 0 #000"
            }}
          >
            ➕ Enshrine Giant
          </button>
        </div>
      </motion.div>

      {/* ── Franchise Grid ── */}
      {ultramanEntries.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="text-4xl mb-4 grayscale opacity-50">🔴</div>
          <h3 className="font-black text-lg theme-text-primary mb-2">No Giants Enshrined</h3>
          <p className="text-sm theme-text-muted mb-4">Add a new HOF entry and set its Tokusatsu Franchise to "Ultraman".</p>
        </div>
      ) : (
        <motion.div
          variants={gridContainerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 justify-items-center"
        >
          {ultramanEntries.map((entry, idx) => {
            const groupCode = getGroupForEntry(entry);
            const groupDetails = getGroupDetails(groupCode);
            return (
              <HofEntryCard
                key={entry.id}
                entry={entry}
                idx={idx}
                isCyber={isCyber}
                group={groupDetails}
                onEdit={handleEdit}
                onDelete={handleDelete}
                showType={true}
                onDoubleTap={handleDoubleTap}
              />
            );
          })}
        </motion.div>
      )}

      {/* ── Editor Modal ── */}
      <AnimatePresence>
        {editorOpen && (
          <HofEditorModal
            isOpen={editorOpen}
            onClose={() => setEditorOpen(false)}
            entryToEdit={selectedEntry}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
