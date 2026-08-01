"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { BentoCard } from "@/components/cards/BentoCard";
import { useTheme } from "@/lib/theme";
import { gridContainerVariants, cardVariants } from "@/lib/theme/motionVariants";
import { useDashboardStore, DossierCharacterEntry, HallOfFameEntry } from "@/lib/store/dashboardStore";
import { DossierCharacterCard } from "@/components/cards/DossierCharacterCard";
import { HofEntryCard, getGroupForEntry, getGroupDetails } from "@/components/cards/HofEntryCard";
import { CharacterPreviewModal } from "@/components/ui/CharacterPreviewModal";
import { HofEditorModal } from "@/components/ui/HofEditorModal";
import { useConfirm } from "@/lib/context/ConfirmContext";

const TOKUSATSU_SUBCATEGORIES = [
  { id: "all", label: "All Franchises", icon: "🎬" },
  { id: "ultraman", label: "Ultraman", icon: "⚡" },
  { id: "kamen-rider", label: "Kamen Rider", icon: "🏍️" },
  { id: "super-sentai", label: "Super Sentai", icon: "🔴" },
  { id: "power-rangers", label: "Power Rangers", icon: "⚡" },
  { id: "metal-heroes", label: "Metal Heroes", icon: "🛡️" },
  { id: "other", label: "Other Heroes", icon: "🌟" },
];

export default function TokusatsuPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { dossierCharacters = [], hallOfFame = [], removeDossierCharacter, deleteHof } = useDashboardStore();
  const { confirm } = useConfirm();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [previewCharacter, setPreviewCharacter] = useState<DossierCharacterEntry | null>(null);
  const [editingHofEntry, setEditingHofEntry] = useState<HallOfFameEntry | null>(null);
  const [isHofEditorOpen, setIsHofEditorOpen] = useState(false);

  // Combine Tokusatsu entries from master dossier & hall of fame (filtered view over master database)
  const tokusatsuDossierItems = useMemo(() => {
    return dossierCharacters.filter((c) => {
      const cat = (c.category || "").toLowerCase();
      const role = (c.role || "").toLowerCase();
      const tags = (c.tags || []).map((t) => t.toLowerCase());
      return cat.includes("toku") || role.includes("toku") || tags.some((t) => t.includes("toku"));
    });
  }, [dossierCharacters]);

  const tokusatsuHofItems = useMemo(() => {
    return hallOfFame.filter((h) => {
      const type = (h.type || "").toLowerCase();
      const franchise = (h.tokusatsuFranchise || "").toLowerCase();
      const knownFor = (Array.isArray(h.knownFor) ? h.knownFor.join(" ") : h.knownFor || "").toLowerCase();
      return (
        type.includes("toku") ||
        type.includes("ultraman") ||
        type.includes("kamen") ||
        type.includes("sentai") ||
        type.includes("power ranger") ||
        !!franchise ||
        knownFor.includes("toku") ||
        knownFor.includes("ultraman") ||
        knownFor.includes("kamen rider") ||
        knownFor.includes("super sentai")
      );
    });
  }, [hallOfFame]);

  // Combined filtered roster
  const filteredHofItems = useMemo(() => {
    return tokusatsuHofItems.filter((item) => {
      // 1. Subcategory filter
      if (selectedSubcategory !== "all") {
        const text = (
          item.tokusatsuFranchise ||
          item.type ||
          (Array.isArray(item.knownFor) ? item.knownFor.join(" ") : item.knownFor) ||
          ""
        ).toLowerCase();

        if (selectedSubcategory === "ultraman" && !text.includes("ultraman")) return false;
        if (selectedSubcategory === "kamen-rider" && !text.includes("kamen") && !text.includes("rider")) return false;
        if (selectedSubcategory === "super-sentai" && !text.includes("sentai")) return false;
        if (selectedSubcategory === "power-rangers" && !text.includes("power ranger") && !text.includes("ranger")) return false;
        if (selectedSubcategory === "metal-heroes" && !text.includes("metal")) return false;
      }

      // 2. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchKnown = (Array.isArray(item.knownFor) ? item.knownFor.join(" ") : item.knownFor || "")
          .toLowerCase()
          .includes(q);
        const matchType = (item.type || "").toLowerCase().includes(q);
        if (!matchName && !matchKnown && !matchType) return false;
      }

      return true;
    });
  }, [tokusatsuHofItems, selectedSubcategory, searchQuery]);

  const stats = useMemo(() => {
    const textOf = (h: HallOfFameEntry) =>
      `${h.tokusatsuFranchise || ""} ${Array.isArray(h.knownFor) ? h.knownFor.join(" ") : h.knownFor || ""}`.toLowerCase();

    return {
      total: tokusatsuHofItems.length + tokusatsuDossierItems.length,
      ultraman: tokusatsuHofItems.filter((h) => textOf(h).includes("ultra")).length,
      kamenRider: tokusatsuHofItems.filter((h) => textOf(h).includes("kamen")).length,
      sentai: tokusatsuHofItems.filter((h) => textOf(h).includes("sentai")).length,
      powerRangers: tokusatsuHofItems.filter((h) => textOf(h).includes("ranger")).length,
    };
  }, [tokusatsuHofItems, tokusatsuDossierItems]);

  return (
    <AppShell>
      <motion.div
        variants={gridContainerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 max-w-7xl mx-auto pb-12"
      >
        {/* Hero Banner */}
        <motion.div variants={cardVariants}>
          <div
            className="p-6 sm:p-8 rounded-3xl border relative overflow-hidden shadow-2xl"
            style={{
              backgroundColor: isCyber ? "rgba(10,15,30,0.85)" : "#FFFFFF",
              borderColor: isCyber ? "#EF444460" : "#000000",
              borderWidth: isCyber ? "1.5px" : "3px",
              boxShadow: isCyber ? "0 0 35px rgba(239,68,68,0.2)" : "6px 6px 0 #000000",
            }}
          >
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-red-500/20 text-red-500 border border-red-500/40">
                    🎬 Tokusatsu Special Forces
                  </span>
                  <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Filtered View Engine
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black theme-text-primary tracking-tight">
                  Tokusatsu Master Universe
                </h1>
                <p className="text-sm theme-text-muted max-w-2xl font-mono leading-relaxed">
                  Filtered database view across Ultraman, Kamen Rider, Super Sentai, Power Rangers, and Metal Heroes. Connected directly to the Master Character Directory.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/characters"
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-500 text-black border-2 border-black shadow-[3px_3px_0_#000] hover:translate-y-[-2px] transition-all cursor-pointer"
                >
                  ← Open All Characters
                </Link>
                <Link
                  href="/hall-of-fame"
                  className="px-4 py-2.5 rounded-xl font-bold text-xs"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#E0F2FE",
                    color: isCyber ? "#00F5FF" : "#0369A1",
                    border: isCyber ? "1px solid rgba(0,245,255,0.4)" : "2px solid #000",
                  }}
                >
                  🏆 Hall of Fame
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Franchise Statistics Matrix */}
        <motion.div variants={cardVariants}>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl border text-center font-mono" style={{ backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#F8FAFC", borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#000", borderWidth: isCyber ? "1px" : "2px" }}>
              <span className="text-[10px] theme-text-muted block">TOTAL HEROES</span>
              <strong className="text-xl font-black theme-text-primary">{stats.total}</strong>
            </div>

            <div className="p-4 rounded-2xl border text-center font-mono" style={{ backgroundColor: isCyber ? "rgba(239,68,68,0.05)" : "#FEF2F2", borderColor: isCyber ? "rgba(239,68,68,0.2)" : "#000", borderWidth: isCyber ? "1px" : "2px" }}>
              <span className="text-[10px] text-red-400 block">ULTRAMAN</span>
              <strong className="text-xl font-black text-red-500">{stats.ultraman}</strong>
            </div>

            <div className="p-4 rounded-2xl border text-center font-mono" style={{ backgroundColor: isCyber ? "rgba(168,85,247,0.05)" : "#F3E8FF", borderColor: isCyber ? "rgba(168,85,247,0.2)" : "#000", borderWidth: isCyber ? "1px" : "2px" }}>
              <span className="text-[10px] text-purple-400 block">KAMEN RIDER</span>
              <strong className="text-xl font-black text-purple-500">{stats.kamenRider}</strong>
            </div>

            <div className="p-4 rounded-2xl border text-center font-mono" style={{ backgroundColor: isCyber ? "rgba(59,130,246,0.05)" : "#EFF6FF", borderColor: isCyber ? "rgba(59,130,246,0.2)" : "#000", borderWidth: isCyber ? "1px" : "2px" }}>
              <span className="text-[10px] text-blue-400 block">SUPER SENTAI</span>
              <strong className="text-xl font-black text-blue-500">{stats.sentai}</strong>
            </div>

            <div className="p-4 rounded-2xl border text-center font-mono" style={{ backgroundColor: isCyber ? "rgba(234,179,8,0.05)" : "#FEFCE8", borderColor: isCyber ? "rgba(234,179,8,0.2)" : "#000", borderWidth: isCyber ? "1px" : "2px" }}>
              <span className="text-[10px] text-amber-400 block">POWER RANGERS</span>
              <strong className="text-xl font-black text-amber-500">{stats.powerRangers}</strong>
            </div>
          </div>
        </motion.div>

        {/* Category Pills & Search Controls */}
        <motion.div variants={cardVariants} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Franchise Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full sm:w-auto scrollbar-none">
              {TOKUSATSU_SUBCATEGORIES.map((cat) => {
                const isActive = selectedSubcategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedSubcategory(cat.id)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold font-mono whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
                    style={{
                      backgroundColor: isActive
                        ? isCyber ? "#EF4444" : "#FEF08A"
                        : isCyber ? "rgba(255,255,255,0.05)" : "#F1F5F9",
                      color: isActive
                        ? isCyber ? "#FFFFFF" : "#854D0E"
                        : isCyber ? "#94A3B8" : "#475569",
                      border: isActive
                        ? isCyber ? "1px solid #EF4444" : "2px solid #000000"
                        : isCyber ? "1px solid rgba(255,255,255,0.1)" : "1.5px solid #CBD5E1",
                      boxShadow: !isCyber && isActive ? "2px 2px 0 #000" : "none",
                    }}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Tokusatsu heroes..."
                className="w-full px-3.5 py-2 rounded-xl border text-xs font-mono focus:outline-none"
                style={{
                  backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#FFFFFF",
                  color: isCyber ? "#F8FAFC" : "#0F172A",
                  borderColor: isCyber ? "rgba(239,68,68,0.3)" : "#000000",
                  borderWidth: isCyber ? "1px" : "2px",
                }}
              />
            </div>
          </div>

          {/* Roster Grid */}
          <BentoCard>
            {filteredHofItems.length === 0 && tokusatsuDossierItems.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="text-4xl">🦸</div>
                <h3 className="font-black text-base theme-text-primary">No Tokusatsu entries found.</h3>
                <p className="text-xs theme-text-muted max-w-md mx-auto">
                  Try selecting another franchise subcategory or add a new Tokusatsu character to your Master Directory.
                </p>
                <button
                  onClick={() => {
                    setSelectedSubcategory("all");
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 rounded-xl font-bold text-xs bg-amber-500 text-black border-2 border-black shadow-[2px_2px_0_#000] cursor-pointer"
                >
                  Reset Filters ↺
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredHofItems.map((entry, idx) => (
                    <HofEntryCard
                      key={entry.id}
                      entry={entry}
                      idx={idx}
                      isCyber={isCyber}
                      group={getGroupDetails(getGroupForEntry(entry))}
                      onEdit={() => {
                        setEditingHofEntry(entry);
                        setIsHofEditorOpen(true);
                      }}
                      onDelete={() => {
                        confirm({
                          title: `Delete ${entry.name}?`,
                          message: `Are you sure you want to remove ${entry.name} from Tokusatsu records?`,
                          variant: "danger",
                          onConfirm: async () => {
                            await deleteHof(entry.id);
                          },
                        });
                      }}
                    />
                  ))}

                  {tokusatsuDossierItems.map((char) => (
                    <DossierCharacterCard
                      key={char.id}
                      character={char}
                      onSelect={(c) => setPreviewCharacter(c)}
                      onDelete={(c) => {
                        confirm({
                          title: `Delete ${c.name}?`,
                          message: `Are you sure you want to remove ${c.name}?`,
                          variant: "danger",
                          onConfirm: async () => {
                            await removeDossierCharacter(c.id);
                          },
                        });
                      }}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </BentoCard>
        </motion.div>

        {/* Preview Overlay */}
        <CharacterPreviewModal
          isOpen={!!previewCharacter}
          onClose={() => setPreviewCharacter(null)}
          character={previewCharacter}
        />

        {/* HOF Editor Modal */}
        <HofEditorModal
          isOpen={isHofEditorOpen}
          onClose={() => setIsHofEditorOpen(false)}
          entryToEdit={editingHofEntry}
        />
      </motion.div>
    </AppShell>
  );
}
