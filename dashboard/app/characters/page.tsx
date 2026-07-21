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
 
const TYPE_FILTERS = [
  { id: "all", label: "All Types" },
  { id: "actor", label: "Actors" },
  { id: "actress", label: "Actresses" },
  { id: "anime", label: "Anime" },
  { id: "ultraman", label: "Ultraman" },
  { id: "kamen-rider", label: "Kamen Rider" },
  { id: "power-rangers", label: "Power Rangers" }
];
 
const REGION_SPECIALTY_FILTERS = [
  { id: "all", label: "All Origins" },
  { id: "Korea", label: "🇰🇷 Korean" },
  { id: "Japan", label: "🇯🇵 Japanese" },
  { id: "China", label: "🇨🇳 Chinese" },
  { id: "Hollywood", label: "🎬 Hollywood" },
  { id: "Anime", label: "⛩️ Anime" },
  { id: "Singer", label: "🎤 Singer" }
];
 
function CharactersContent() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { hallOfFame = [], deleteHof, likeHof } = useDashboardStore(); // Guard against undefined store
  const searchParams = useSearchParams();
 
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedRegionSpecialty, setSelectedRegionSpecialty] = useState("all");
 
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<HallOfFameEntry | null>(null);
 
  const targetSearch = searchParams?.get("search") || null;
  const targetId = searchParams?.get("id") || null;
 
  useEffect(() => {
    if (targetSearch) {
      setSearchQuery(targetSearch);
    }
  }, [targetSearch]);
 
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
  }, [targetId]);
 
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
    if (e && 'touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e && 'clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    if (clientX && clientY) {
      triggerHeartEffect(clientX, clientY);
    }
  };
 
  const sortedByLikes = [...hallOfFame].sort((a, b) => {
    const aLikes = a?.likes || 0;
    const bLikes = b?.likes || 0;
    if (aLikes !== bLikes) return bLikes - aLikes;
    return (a?.name || "").localeCompare(b?.name || "");
  });
 
  const filteredDirectoryList = sortedByLikes.filter((entry) => {
    if (!entry) return false;

    const query = searchQuery.toLowerCase();
    
    // SAFE SEARCH: Fallback array/strings to prevent "undefined" runtime crashes
    const matchesSearch = 
      (entry.name || "").toLowerCase().includes(query) ||
      (entry.note || "").toLowerCase().includes(query) ||
      (entry.knownFor || []).some(work => (work || "").toLowerCase().includes(query));
 
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
 
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.03 }
    }
  };
 
  return (
    <AppShell>
      {/* Premium Luxury Banner */}
      <motion.div
        className="relative rounded-2xl overflow-hidden mb-8 p-8 md:p-10 border backdrop-blur-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 140, damping: 22 }}
        style={{
          background: isCyber
            ? "linear-gradient(135deg, #090d22 0%, #161233 50%, #050816 100%)"
            : "linear-gradient(135deg, #ffffff 0%, #f4f7ff 60%, #eef2ff 100%)",
          borderColor: isCyber ? "rgba(255, 20, 147, 0.25)" : "rgba(0, 0, 0, 0.08)",
          boxShadow: isCyber 
            ? "0 20px 50px rgba(0, 0, 0, 0.4)" 
            : "0 20px 40px rgba(0, 0, 0, 0.02)",
        }}
      >
        {isCyber && <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/5 rounded-full blur-[100px] pointer-events-none" />}
 
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 relative z-10">
          <div>
            <div className="flex gap-1.5 mb-3 items-center">
              {["📖", "✨", "👥"].map((e, i) => (
                <motion.span
                  key={i}
                  className="text-lg"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, delay: i * 0.15, repeat: Infinity, ease: "easeInOut" }}
                >
                  {e}
                </motion.span>
              ))}
            </div>
            <h1
              className="font-black text-4xl md:text-5xl tracking-tight mb-2"
              style={{
                color: isCyber ? "#FFF" : "#0f172a",
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                letterSpacing: "-0.02em",
              }}
            >
              {isCyber ? (
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400">
                  CHARACTERS_DIR
                </span>
              ) : (
                "Characters Directory"
              )}
            </h1>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium tracking-wide max-w-xl">
              Discover, filter, and seamlessly curate exceptional profiles across premium entries.
            </p>
          </div>
 
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedEntry(null);
              setEditorOpen(true);
            }}
            className="px-5 py-3 text-xs font-bold rounded-xl transition-all border shrink-0 flex items-center gap-2 shadow-lg tracking-wide uppercase cursor-pointer"
            style={{
              backgroundColor: isCyber ? "#FF1493" : "#0f172a",
              borderColor: isCyber ? "transparent" : "rgba(255,255,255,0.1)",
              color: "#FFF",
              boxShadow: isCyber ? "0 0 25px rgba(255, 20, 147, 0.4)" : "0 10px 20px rgba(15, 23, 42, 0.15)"
            }}
          >
            <span>┼ Add New Entry</span>
          </motion.button>
        </div>
      </motion.div>
 
      {/* Premium Glass Filter Toolbar */}
      <div 
        className="flex flex-col gap-5 mb-8 p-5 rounded-2xl border backdrop-blur-md"
        style={{
          backgroundColor: isCyber ? "rgba(10, 15, 36, 0.6)" : "rgba(255, 255, 255, 0.7)",
          borderColor: isCyber ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
        }}
      >
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, note, or famous masterpieces..."
            className="w-full px-5 py-3 text-xs font-medium rounded-xl outline-none border transition-all duration-300 focus:ring-1 focus:ring-pink-500/30"
            style={{
              backgroundColor: isCyber ? "rgba(5, 8, 22, 0.4)" : "#ffffff",
              borderColor: isCyber ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
              color: isCyber ? "#E2E8F0" : "#0f172a",
            }}
          />
        </div>
 
        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Content Type</span>
            <div className="flex flex-wrap gap-1.5">
              {TYPE_FILTERS.map((tab) => {
                const isActive = selectedType === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedType(tab.id)}
                    className="px-3.5 py-1.5 text-[11px] font-semibold rounded-lg border transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: isActive ? (isCyber ? "rgba(0, 245, 255, 0.15)" : "#0f172a") : "transparent",
                      borderColor: isActive ? (isCyber ? "#00F5FF" : "#0f172a") : (isCyber ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"),
                      color: isActive ? (isCyber ? "#00F5FF" : "#FFF") : (isCyber ? "#94A3B8" : "#475569"),
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
 
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Origin / Specialty</span>
            <div className="flex flex-wrap gap-1.5">
              {REGION_SPECIALTY_FILTERS.map((tab) => {
                const isActive = selectedRegionSpecialty === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedRegionSpecialty(tab.id)}
                    className="px-3.5 py-1.5 text-[11px] font-semibold rounded-lg border transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: isActive ? (isCyber ? "rgba(255, 20, 147, 0.15)" : "#0f172a") : "transparent",
                      borderColor: isActive ? (isCyber ? "#FF1493" : "#0f172a") : (isCyber ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"),
                      color: isActive ? (isCyber ? "#FF1493" : "#FFF") : (isCyber ? "#94A3B8" : "#475569"),
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
 
      {filteredDirectoryList.length === 0 ? (
        <div className="py-24 text-center border border-dashed rounded-2xl border-slate-700/20 max-w-md mx-auto">
          <div className="text-4xl mb-3 grayscale opacity-30">👻</div>
          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">No Profiles Match Your Query</h4>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6 justify-items-center"
        >
          {filteredDirectoryList.map((entry, idx) => {
            const groupCode = getGroupForEntry(entry);
            const groupDetails = getGroupDetails(groupCode);
            return (
              <HofEntryCard
                key={entry?.id || idx}
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
        </motion.div>
      )}
 
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