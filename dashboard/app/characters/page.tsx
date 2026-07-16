"use client";

import React, { useState, useCallback, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { HofEditorModal } from "@/components/ui/HofEditorModal";
import { HofEntryCard, getGroupForEntry, getGroupDetails } from "@/components/cards/HofEntryCard";
import type { HallOfFameEntry } from "@/lib/store/dashboardStore";
import { useSearchParams } from "next/navigation";
import { triggerHeartEffect } from "@/components/ui/FloatingHeartEngine";

// Content Type filters
const TYPE_FILTERS = [
  { id: "all", label: "All Types" },
  { id: "actor", label: "Actors" },
  { id: "actress", label: "Actresses" },
  { id: "anime", label: "Anime" },
  { id: "ultraman", label: "Ultraman" },
  { id: "kamen-rider", label: "Kamen Rider" },
  { id: "power-rangers", label: "Power Rangers" }
];

// Region/Specialty filters
const REGION_SPECIALTY_FILTERS = [
  { id: "all", label: "All Origins" },
  { id: "Korea", label: "🇰🇷 Korean" },
  { id: "Japan", label: "🇯🇵 Japanese" },
  { id: "China", label: "🇨🇳 Chinese" },
  { id: "Hollywood", label: "🎬 Hollywood" },
  { id: "Anime", label: "⛩️ Anime Ranked" },
  { id: "Singer", label: "🎤 Singer" }
];

function CharactersContent() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { hallOfFame, deleteHof, likeHof } = useDashboardStore();
  const searchParams = useSearchParams();

  // Multi-tier filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedRegionSpecialty, setSelectedRegionSpecialty] = useState("all");

  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<HallOfFameEntry | null>(null);

  // ── Auto-scroll & Highlight from Deep Link ──
 // ── Auto-scroll & Highlight from Deep Link ──

const targetSearch = searchParams.get("search");
const targetId = searchParams.get("id");

// Fix 1: Only update state if the actual search string changes
useEffect(() => {
  if (targetSearch) {
    setSearchQuery(targetSearch);
  }
}, [targetSearch]); // Depend on the primitive string, not the object

// Fix 2: Only trigger scroll if the actual ID string changes
useEffect(() => {
  if (targetId) {
    const timer = setTimeout(() => {
      const el = document.getElementById(`entry-${targetId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.animate([
          { filter: 'brightness(1.5)', transform: 'scale(1.05)' },
          { filter: 'brightness(1)', transform: 'scale(1)' }
        ], { duration: 800, easing: 'ease-out' });
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }
}, [targetId]); // Depend on the primitive string, not the object

  // ── Handlers ──
  const handleEdit = useCallback((entry: HallOfFameEntry) => {
    setSelectedEntry(entry);
    setEditorOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string, name: string) => {
    if (confirm(`Remove "${name}" from the database?`)) {
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

  // Sorting purely by Dynamic Like Counts Descending
  const sortedByLikes = [...hallOfFame].sort((a, b) => {
    const aLikes = a.likes || 0;
    const bLikes = b.likes || 0;
    if (aLikes !== bLikes) return bLikes - aLikes;
    return a.name.localeCompare(b.name);
  });

  // Filtered List
  const filteredDirectoryList = sortedByLikes.filter((entry) => {
    // 1. Text Search matching name, notes or famous works
    const matchesSearch = 
      entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.note && entry.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
      entry.knownFor.some(work => work.toLowerCase().includes(searchQuery.toLowerCase()));

    // 2. Type Filter
    let matchesType = false;
    if (selectedType === "all") {
      matchesType = true;
    } else if (selectedType === "ultraman") {
      matchesType = entry.tokusatsuFranchise === "Ultraman";
    } else if (selectedType === "kamen-rider") {
      matchesType = entry.tokusatsuFranchise === "Kamen Rider";
    } else if (selectedType === "power-rangers") {
      matchesType = entry.tokusatsuFranchise === "Power Rangers";
    } else {
      matchesType = entry.type === selectedType;
    }

    // 3. Region/Specialty Filter
    let matchesRegionSpecialty = true;
    if (selectedRegionSpecialty !== "all") {
      const groupCode = getGroupForEntry(entry);
      if (selectedRegionSpecialty === "Singer") {
        matchesRegionSpecialty = groupCode === "__other__" || entry.nationality?.toLowerCase() === "singer";
      } else {
        matchesRegionSpecialty = groupCode === selectedRegionSpecialty;
      }
    }

    return matchesSearch && matchesType && matchesRegionSpecialty;
  });

  return (
    <AppShell>
      {/* ── Banner ── */}
      <motion.div
        className="relative rounded-2xl overflow-hidden mb-8 p-6 md:p-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        style={{
          background: isCyber
            ? "linear-gradient(135deg, #050816, rgba(255,20,147,0.08), rgba(0,245,255,0.05))"
            : "linear-gradient(135deg, #F0F8FF, #E6E6FA)",
          border: isCyber ? "1px solid rgba(255,20,147,0.3)" : "3px solid #000",
          boxShadow: isCyber ? "0 0 60px rgba(255,20,147,0.15)" : "5px 5px 0 rgba(0,0,0,1)",
        }}
      >
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative z-10">
          <div>
            <div className="flex gap-2 mb-2 items-center">
              {["📖", "✨", "👥"].map((e, i) => (
                <motion.span
                  key={i}
                  className="text-xl"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 1.5 + i * 0.2, repeat: Infinity }}
                >
                  {e}
                </motion.span>
              ))}
            </div>
            <h1
              className="font-black text-3xl md:text-5xl mb-1"
              style={{
                color: isCyber ? "#FF1493" : "#1A1A1A",
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                textShadow: isCyber ? "0 0 20px rgba(255,20,147,0.5)" : "none",
              }}
            >
              {isCyber ? "CHARACTERS_DIR" : "Characters Directory"}
            </h1>
            <p className="theme-text-secondary text-xs font-semibold">
              Search, filter, and curate profiles of actors, actresses, singers, and anime characters.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedEntry(null);
              setEditorOpen(true);
            }}
            className="px-4 py-2 text-xs font-black rounded-lg transition-transform active:scale-95 border border-adaptive-unique shrink-0 flex items-center gap-1.5"
            style={{
              backgroundColor: isCyber ? "#FF1493" : "#FF6B35",
              color: "#FFF",
              boxShadow: isCyber ? "0 0 15px rgba(255, 20, 147, 0.4)" : "4px 4px 0 #000"
            }}
          >
            <span>➕ Add New Entry</span>
          </button>
        </div>
      </motion.div>

      {/* Multi-Tier Filter Toolbar */}
      <div className="flex flex-col gap-4 mb-6 bg-black/10 dark:bg-white/5 p-4 rounded-xl border border-adaptive-unique">
        {/* Search Box */}
        <div className="w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, note, or famous works..."
            className="w-full px-4 py-2 text-xs font-semibold rounded-lg outline-none border focus:ring-2 transition-all"
            style={{
              backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#F9F9F9",
              borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#D1D5DB",
              color: isCyber ? "#E0E8FF" : "#1A1A1A",
            }}
          />
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          {/* Content Types Chips */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-black uppercase tracking-wider theme-text-muted">Content Type</span>
            <div className="flex flex-wrap gap-1">
              {TYPE_FILTERS.map((tab) => {
                const isActive = selectedType === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedType(tab.id)}
                    className="px-3 py-1 text-[10px] font-black rounded-md border transition-all"
                    style={{
                      backgroundColor: isActive
                        ? isCyber ? "rgba(0, 245, 255, 0.2)" : "#000"
                        : "transparent",
                      borderColor: isCyber 
                        ? isActive ? "#00F5FF" : "rgba(0,245,255,0.15)"
                        : "#000",
                      color: isActive 
                        ? isCyber ? "#00F5FF" : "#FFF"
                        : isCyber ? "#94A3B8" : "#000",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Region / Specialties Chips */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-black uppercase tracking-wider theme-text-muted">Origin / Specialty</span>
            <div className="flex flex-wrap gap-1">
              {REGION_SPECIALTY_FILTERS.map((tab) => {
                const isActive = selectedRegionSpecialty === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedRegionSpecialty(tab.id)}
                    className="px-3 py-1 text-[10px] font-black rounded-md border transition-all"
                    style={{
                      backgroundColor: isActive
                        ? isCyber ? "rgba(255, 20, 147, 0.2)" : "#000"
                        : "transparent",
                      borderColor: isCyber 
                        ? isActive ? "#FF1493" : "rgba(255,20,147,0.15)"
                        : "#000",
                      color: isActive 
                        ? isCyber ? "#FF1493" : "#FFF"
                        : isCyber ? "#94A3B8" : "#000",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      {filteredDirectoryList.length === 0 ? (
        <div className="py-16 text-center">
          <div className="text-3xl mb-2 grayscale opacity-45">👻</div>
          <h4 className="font-bold theme-text-primary text-sm">No Match Found</h4>
          <p className="text-xs theme-text-muted mt-1">Try resetting the filters or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 justify-items-center">
          {filteredDirectoryList.map((entry, idx) => {
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
                showType={selectedType === "all"}
                onDoubleTap={handleDoubleTap}
              />
            );
          })}
        </div>
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

const SkeletonHofCard = () => (
  <div className="rounded-2xl border p-4 h-[350px] animate-pulse flex flex-col bg-slate-900/5 dark:bg-white/5 border-black/10 dark:border-white/10">
    <div className="w-full h-[230px] rounded-xl bg-black/10 dark:bg-white/10 mb-4" />
    <div className="h-4 bg-black/15 dark:bg-white/15 rounded w-2/3 mb-2" />
    <div className="h-3 bg-black/10 dark:bg-white/10 rounded w-1/2" />
  </div>
);

const HofSkeletonGrid = () => (
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
    {[...Array(8)].map((_, i) => (
      <SkeletonHofCard key={i} />
    ))}
  </div>
);

export default function CharactersPage() {
  return (
    <Suspense fallback={<HofSkeletonGrid />}>
      <CharactersContent />
    </Suspense>
  );
}
