"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { gridContainerVariants } from "@/lib/theme/motionVariants";
import { HofEditorModal } from "@/components/ui/HofEditorModal";
import { HofEntryCard, getGroupForEntry, getGroupDetails } from "@/components/cards/HofEntryCard";
import { CharacterVotePanel } from "@/components/ui/CharacterVotePanel";
import type { HallOfFameEntry } from "@/lib/store/dashboardStore";
import { triggerHeartEffect } from "@/components/ui/FloatingHeartEngine";

const POWER_RANGERS_THEME = {
  cyber: {
    banner: "linear-gradient(135deg, #0A0A0A 0%, rgba(234,179,8,0.15) 50%, #0A0A0A 100%)",
    border: "rgba(234,179,8,0.4)",
    accent: "#EAB308",
    accent2: "#F43F5E",
    textShadow: "0 0 20px rgba(234,179,8,0.6)"
  },
  brutal: {
    banner: "linear-gradient(135deg, #FEF08A 0%, #FFFDF0 50%, #EAB308 100%)",
    border: "#000000",
    accent: "#EAB308",
    accent2: "#EF4444",
    textShadow: "none"
  }
};

export default function PowerRangersPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { hallOfFame, deleteHof } = useDashboardStore();

  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<HallOfFameEntry | null>(null);

  const t = isCyber ? POWER_RANGERS_THEME.cyber : POWER_RANGERS_THEME.brutal;

  // Filter for Power Rangers franchise entries
  const powerRangersEntries = hallOfFame.filter(
    (e) => e.tokusatsuFranchise?.toLowerCase() === "power rangers"
  );

  const handleEdit = useCallback((entry: HallOfFameEntry) => {
    setSelectedEntry(entry);
    setEditorOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string, name: string) => {
    if (confirm(`Remove "${name}" from Power Rangers roster?`)) {
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
          boxShadow: isCyber ? "0 0 50px rgba(234,179,8,0.15)" : "6px 6px 0 rgba(0,0,0,1)",
        }}
      >
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative z-10">
          <div>
            <motion.p 
              className="text-xs font-bold tracking-[0.25em] uppercase mb-2" 
              style={{ color: t.accent }}
            >
              {isCyber ? "// GRID.MORPH" : "Morphin Grid Database"}
            </motion.p>
            <h1 
              className="font-black text-3xl md:text-5xl mb-2" 
              style={{ 
                color: isCyber ? "#E2E8F0" : "#1A1A1A", 
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                textShadow: isCyber ? t.textShadow : "none" 
              }}
            >
              {isCyber ? "POWER_RANGERS_ROSTER" : "Power Rangers Directory"}
            </h1>
            <p className="text-sm opacity-80" style={{ color: isCyber ? "#94A3B8" : "#333" }}>
              The multi-colored superhero teams harnessing the power of dinosaurs, space, and beasts to battle evil forces.
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
              color: isCyber ? "#050816" : "#FFF",
              borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000",
              boxShadow: isCyber ? "0 0 15px rgba(234, 179, 8, 0.4)" : "4px 4px 0 #000"
            }}
          >
            ➕ Enshrine Ranger
          </button>
        </div>
      </motion.div>

      {/* ── Franchise Grid ── */}
      {powerRangersEntries.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="text-4xl mb-4 grayscale opacity-50">⚡</div>
          <h3 className="font-black text-lg theme-text-primary mb-2">No Rangers Enshrined</h3>
          <p className="text-sm theme-text-muted mb-4">Add a new HOF entry and set its Tokusatsu Franchise to "Power Rangers".</p>
        </div>
      ) : (
        <motion.div
          variants={gridContainerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 justify-items-center"
        >
          {powerRangersEntries.map((entry, idx) => {
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

      {/* ── Voting Leaderboard ── */}
      <CharacterVotePanel
        entries={powerRangersEntries}
        franchise="Power Rangers"
        accentColor="#EAB308"
      />

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
