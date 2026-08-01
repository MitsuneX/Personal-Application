"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { ThemeAccentConfig } from "./DossierThemeAccent";
import { DossierCharacter, DossierCastMember } from "@/lib/store/dashboardStore";
import { Users, Star, X, Info } from "lucide-react";

export interface DossierCharacterSpotlightProps {
  characters?: DossierCharacter[];
  castGrid?: DossierCastMember[];
  themeConfig: ThemeAccentConfig;
}

export function DossierCharacterSpotlight({
  characters = [],
  castGrid = [],
  themeConfig,
}: DossierCharacterSpotlightProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const [activeCharacter, setActiveCharacter] = useState<DossierCharacter | null>(null);

  const defaultCharacters: DossierCharacter[] = characters.length > 0 ? characters : [
    {
      id: "char-1",
      name: "Kim Bong-seok",
      actor: "Lee Jung-ha",
      role: "Main Protagonist (Flying Ability)",
      portraitUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      isFavorite: true,
      notes: "Innocent high school student inheriting flight and superhuman senses.",
    },
    {
      id: "char-2",
      name: "Jang Hui-soo",
      actor: "Go Youn-jung",
      role: "Main Protagonist (Regeneration)",
      portraitUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
      isFavorite: true,
      notes: "Athletic transfer student with instantaneous athletic recovery & healing.",
    },
    {
      id: "char-3",
      name: "Kim Doo-shik",
      actor: "Zo In-sung",
      role: "Legendary Black Ops Agent (Flight)",
      portraitUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      isFavorite: false,
      notes: "Veteran NIS black ops agent with unprecedented flight skills.",
    },
  ];

  return (
    <div
      className="p-6 rounded-2xl mb-8 relative border overflow-hidden"
      style={{
        backgroundColor: isCyber ? "rgba(10,15,44,0.75)" : "#FFFFFF",
        borderColor: isCyber ? `${themeConfig.primaryAccent}30` : "#000000",
        boxShadow: isCyber
          ? `0 0 25px ${themeConfig.glowColor}, inset 0 0 20px rgba(0,245,255,0.02)`
          : "4px 4px 0px #000000",
      }}
    >
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6">
        <Users size={20} style={{ color: themeConfig.primaryAccent }} />
        <h2
          className="text-lg font-black tracking-wide"
          style={{
            color: isCyber ? "#E0E8FF" : "#1A1A1A",
            fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
          }}
        >
          {isCyber ? "// CHARACTER SPOTLIGHT & CAST" : "Character Spotlight & Cast"}
        </h2>
      </div>

      {/* Characters Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {defaultCharacters.map((c) => (
          <motion.div
            key={c.id}
            whileHover={{ scale: 1.03, y: -3 }}
            onClick={() => setActiveCharacter(c)}
            className="p-4 rounded-xl border flex gap-3 cursor-pointer relative overflow-hidden select-none"
            style={{
              backgroundColor: isCyber ? "rgba(5,8,22,0.8)" : "#FFF5E4",
              borderColor: isCyber
                ? c.isFavorite
                  ? themeConfig.primaryAccent
                  : "rgba(255,255,255,0.1)"
                : "#000000",
              boxShadow: isCyber
                ? `0 0 15px ${c.isFavorite ? themeConfig.glowColor : "transparent"}`
                : "3px 3px 0px #000000",
            }}
          >
            {/* Portrait */}
            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-white/20">
              <img
                src={c.portraitUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
                alt={c.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <h3
                  className="font-black text-sm truncate"
                  style={{ color: isCyber ? "#E0E8FF" : "#1A1A1A" }}
                >
                  {c.name}
                </h3>
                {c.isFavorite && (
                  <span className="text-yellow-400 text-xs">⭐</span>
                )}
              </div>
              <p className="text-xs font-mono opacity-70 truncate">{c.actor}</p>
              <span
                className="text-[10px] font-mono font-bold mt-1 uppercase tracking-wider truncate"
                style={{ color: themeConfig.primaryAccent }}
              >
                {c.role}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Character Detail Drawer Modal */}
      <AnimatePresence>
        {activeCharacter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setActiveCharacter(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="p-6 rounded-2xl max-w-md w-full border relative overflow-hidden"
              style={{
                backgroundColor: isCyber ? "#050816" : "#FFFFFF",
                borderColor: themeConfig.primaryAccent,
                boxShadow: isCyber ? `0 0 40px ${themeConfig.glowColor}` : "8px 8px 0 #000",
              }}
            >
              <button
                onClick={() => setActiveCharacter(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full border cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0" style={{ borderColor: themeConfig.primaryAccent }}>
                  <img src={activeCharacter.portraitUrl} alt={activeCharacter.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-black text-xl">{activeCharacter.name}</h3>
                  <p className="text-xs font-mono opacity-70">Played by {activeCharacter.actor}</p>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded mt-2 inline-block border" style={{ color: themeConfig.primaryAccent, borderColor: themeConfig.primaryAccent }}>
                    {activeCharacter.role}
                  </span>
                </div>
              </div>

              {activeCharacter.notes && (
                <div className="p-3 rounded-lg bg-black/10 dark:bg-white/5 border border-white/10 text-xs leading-relaxed opacity-90">
                  <p className="font-bold font-mono mb-1 text-[10px] uppercase opacity-60">Personal Character Notes:</p>
                  <p>{activeCharacter.notes}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
