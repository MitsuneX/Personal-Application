"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { BentoCard } from "@/components/cards/BentoCard";
import { useTheme } from "@/lib/theme";
import { gridContainerVariants, cardVariants } from "@/lib/theme/motionVariants";

interface HeroCharacter {
  id: string;
  name: string;
  game: string;
  class: string;
  element: string;
  accent: string;
  avatarIcon: string;
  stats: { label: string; value: number }[];
  skills: string[];
  description: string;
}

const HEROES_ROSTER: HeroCharacter[] = [
  {
    id: "h-anby",
    name: "Anby Demara",
    game: "Zenless Zone Zero",
    class: "Slash / Stun",
    element: "Electric ⚡",
    accent: "#F59E0B",
    avatarIcon: "⚡",
    stats: [
      { label: "ATK", value: 95 },
      { label: "CRIT", value: 82 },
      { label: "STUN", value: 92 },
    ],
    skills: ["Lightning Edge", "Energy Flow", "Thunderous Dodge"],
    description: "A calm, collected girl with a mysterious background who loves movies and burgers.",
  },
  {
    id: "h-xiao",
    name: "Xiao",
    game: "Genshin Impact",
    class: "Polearm / DPS",
    element: "Anemo 🍃",
    accent: "#10B981",
    avatarIcon: "🍃",
    stats: [
      { label: "ATK", value: 98 },
      { label: "CRIT", value: 94 },
      { label: "SPEED", value: 88 },
    ],
    skills: ["Bane of All Evil", "Wind Cycling", "Lemniscatic Wind"],
    description: "The Vigilant Yaksha who guards Liyue. Fierce, swift, and carries a heavy karmic debt.",
  },
  {
    id: "h-jinwoo",
    name: "Sung Jinwoo",
    game: "Solo Leveling: ARISE",
    class: "Mage / Shadow",
    element: "Darkness 💀",
    accent: "#6366F1",
    avatarIcon: "💀",
    stats: [
      { label: "ATK", value: 99 },
      { label: "CRIT", value: 90 },
      { label: "SHADOWS", value: 98 },
    ],
    skills: ["Arise", "Shadow extraction", "Dagger Rush"],
    description: "The world's strongest hunter who levels up alone. Commander of the Shadow Army.",
  },
  {
    id: "h-jett",
    name: "Jett",
    game: "Valorant",
    class: "Duelist / Evade",
    element: "Wind 🌀",
    accent: "#EF4444",
    avatarIcon: "🎯",
    stats: [
      { label: "AIM", value: 92 },
      { label: "EVADE", value: 96 },
      { label: "SPEED", value: 94 },
    ],
    skills: ["Blade Storm", "Tailwind", "Updraft"],
    description: "An agile duelist from South Korea who values speed, precision, and high-altitude combat.",
  },
  {
    id: "h-goku",
    name: "Goku",
    game: "Dragon Ball Legends",
    class: "Saiyan / Strike",
    element: "Ki 🔥",
    accent: "#F97316",
    avatarIcon: "☄️",
    stats: [
      { label: "KI", value: 99 },
      { label: "ATK", value: 98 },
      { label: "STAMINA", value: 92 },
    ],
    skills: ["Kamehameha", "Instant Transmission", "Super Saiyan"],
    description: "The legendary Saiyan hero who fights for peace and always seeks stronger opponents.",
  },
  {
    id: "h-layla",
    name: "Layla",
    game: "Mobile Legends",
    class: "Marksman / Range",
    element: "Energy 🎆",
    accent: "#3B82F6",
    avatarIcon: "🔫",
    stats: [
      { label: "RANGE", value: 95 },
      { label: "ATK", value: 90 },
      { label: "CRIT", value: 85 },
    ],
    skills: ["Destruction Rush", "Void Projectile", "Malefic Gun"],
    description: "A determined marksman armed with a prototype energy cannon, guarding her home city.",
  },
];

export default function HeroesPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const [selectedHero, setSelectedHero] = useState<HeroCharacter | null>(null);

  return (
    <AppShell>
      {/* Header section */}
      <motion.div
        className="mb-8 p-6 rounded-2xl relative overflow-hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: isCyber 
            ? "linear-gradient(135deg, #050816, rgba(167,139,250,0.06), rgba(0,245,255,0.04))"
            : "linear-gradient(135deg, #FFE4B5, #FFF5E4, #C9F0FF)",
          border: isCyber ? "1px solid rgba(0,245,255,0.2)" : "3px solid #000",
          boxShadow: isCyber ? "0 0 40px rgba(0,245,255,0.15)" : "5px 5px 0 rgba(0,0,0,1)",
        }}
      >
        <h1 className="font-black text-3xl md:text-5xl mb-2"
          style={{
            color: isCyber ? "#E0E8FF" : "#1A1A1A",
            fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
            letterSpacing: isCyber ? "0.08em" : "normal",
          }}
        >
          {isCyber ? "HEROES_REGISTRY" : "🛡️ My Heroes"}
        </h1>
        <p className="text-sm theme-text-secondary">
          Dossier tracking of top-tier active game mains, capabilities, and telemetry rankings.
        </p>
      </motion.div>

      {/* Grid of Heroes */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={gridContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {HEROES_ROSTER.map((hero, i) => (
          <motion.div
            key={hero.id}
            variants={cardVariants}
            custom={i}
            onClick={() => setSelectedHero(hero)}
            className="cursor-pointer"
          >
            <BentoCard>
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: isCyber ? "1px solid rgba(255,255,255,0.08)" : "1.5px dashed rgba(0,0,0,0.15)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xl"
                    style={{
                      background: isCyber ? `${hero.accent}12` : hero.accent,
                      color: isCyber ? hero.accent : "#FFF",
                      border: isCyber ? `1px solid ${hero.accent}40` : "2px solid #000",
                      boxShadow: isCyber ? `0 0 10px ${hero.accent}30` : "2px 2px 0 #000",
                    }}
                  >
                    {hero.avatarIcon}
                  </div>
                  <div>
                    <h3 className="font-black text-base theme-text-primary leading-tight">{hero.name}</h3>
                    <p className="text-[10px] theme-text-muted font-bold font-mono">{hero.game.toUpperCase()}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
                    color: isCyber ? "#94A3B8" : "#4A4A4A",
                    border: isCyber ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.15)"
                  }}
                >
                  {hero.class}
                </span>
              </div>

              {/* Element & description */}
              <div className="mb-4">
                <span className="text-xs font-black uppercase px-2 py-0.5 rounded-md"
                  style={{
                    backgroundColor: `${hero.accent}15`,
                    color: isCyber ? hero.accent : "#1a1a1a",
                    border: `1.5px solid ${hero.accent}`,
                  }}
                >
                  {hero.element}
                </span>
                <p className="text-xs theme-text-secondary mt-3 line-clamp-2 leading-relaxed">
                  {hero.description}
                </p>
              </div>

              {/* Stats telemetry */}
              <div className="space-y-2 mb-2">
                {hero.stats.map((st) => (
                  <div key={st.label}>
                    <div className="flex justify-between text-[10px] font-bold font-mono mb-0.5" style={{ color: isCyber ? "#94A3B8" : "#4A4A4A" }}>
                      <span>{st.label}</span>
                      <span>{st.value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: isCyber ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)" }}>
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: st.value / 100 }}
                        style={{
                          transformOrigin: "left",
                          backgroundColor: hero.accent,
                          boxShadow: isCyber ? `0 0 10px ${hero.accent}` : "none",
                        }}
                        transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.3 + i * 0.05 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Hero detail drawer modal */}
      <AnimatePresence>
        {selectedHero && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedHero(null)}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                className="w-full max-w-lg pointer-events-auto rounded-2xl p-6 relative overflow-hidden border-adaptive-unique"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                style={{
                  backgroundColor: isCyber ? "#0A0F2C" : "#FFFFFF",
                  border: isCyber ? `1px solid ${selectedHero.accent}45` : "3px solid #000000",
                  boxShadow: isCyber 
                    ? `0 0 40px ${selectedHero.accent}20`
                    : "5px 5px 0 rgba(0,0,0,1)",
                }}
              >
                {/* Cyber Brackets */}
                {isCyber && (
                  <div className="absolute top-0 left-0 w-6 h-6" style={{ borderTop: `2px solid ${selectedHero.accent}`, borderLeft: `2px solid ${selectedHero.accent}` }} />
                )}

                {/* Close Button */}
                <button
                  onClick={() => setSelectedHero(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                >
                  ✕
                </button>

                {/* Content Header */}
                <div className="flex gap-4 items-center mb-6 pb-4" style={{ borderBottom: isCyber ? "1px solid rgba(255,255,255,0.08)" : "2px dashed #000" }}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
                    style={{
                      background: isCyber ? `${selectedHero.accent}15` : selectedHero.accent,
                      border: "2px solid #000",
                      boxShadow: isCyber ? `0 0 15px ${selectedHero.accent}` : "2px 2px 0 #000",
                      color: "#FFF",
                    }}
                  >
                    {selectedHero.avatarIcon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black theme-text-primary leading-tight">{selectedHero.name}</h2>
                    <p className="text-xs theme-text-muted font-black font-mono tracking-widest uppercase mt-0.5">{selectedHero.game}</p>
                  </div>
                </div>

                {/* Stats Detail */}
                <div className="mb-6">
                  <h4 className="text-xs font-black uppercase tracking-wider theme-text-secondary mb-3">Capabilities Dossier</h4>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {selectedHero.stats.map((st) => (
                      <div key={st.label} className="p-3 rounded-xl border border-adaptive-unique" style={{ backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#FFFDEB" }}>
                        <p className="text-[10px] uppercase font-bold theme-text-muted">{st.label}</p>
                        <p className="text-2xl font-black mt-1" style={{ color: selectedHero.accent }}>{st.value}%</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-6">
                  <h4 className="text-xs font-black uppercase tracking-wider theme-text-secondary mb-2.5">Combat Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedHero.skills.map((sk) => (
                      <span key={sk} className="text-xs font-bold px-3 py-1.5 rounded-lg border border-adaptive-unique"
                        style={{
                          backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#FFF",
                          borderColor: selectedHero.accent,
                        }}
                      >
                        ⚡ {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider theme-text-secondary mb-1.5">Character Briefing</h4>
                  <p className="text-xs leading-relaxed theme-text-secondary">
                    {selectedHero.description}
                  </p>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
