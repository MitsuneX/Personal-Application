"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useRouter } from "next/navigation";
import { Plus, Gamepad2, UserPlus, Film, Tv, Trophy, Bot, StickyNote, Sparkles } from "lucide-react";

import { GameEditorModal } from "@/components/ui/GameEditorModal";
import { GameCharacterEditorModal } from "@/components/ui/GameCharacterEditorModal";
import { ManualDramaModal } from "@/components/ui/ManualDramaModal";
import { ManualAnimeModal } from "@/components/ui/ManualAnimeModal";
import { HofEditorModal } from "@/components/ui/HofEditorModal";
import { AiToolEditorModal } from "@/components/ui/AiToolEditorModal";

export function QuickActionsToolbar() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const router = useRouter();

  // Canonical Modal States
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [isDramaModalOpen, setIsDramaModalOpen] = useState(false);
  const [isAnimeModalOpen, setIsAnimeModalOpen] = useState(false);
  const [isHofModalOpen, setIsHofModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const actions = [
    {
      label: "Game",
      icon: Gamepad2,
      color: isCyber ? "#00F5FF" : "#FF6B35",
      onClick: () => setIsGameModalOpen(true),
    },
    {
      label: "Character",
      icon: UserPlus,
      color: isCyber ? "#39FF14" : "#06D6A0",
      onClick: () => setIsCharModalOpen(true),
    },
    {
      label: "Drama",
      icon: Film,
      color: isCyber ? "#FF7EB9" : "#EF476F",
      onClick: () => setIsDramaModalOpen(true),
    },
    {
      label: "Anime",
      icon: Tv,
      color: isCyber ? "#BF5FFF" : "#7B2FBE",
      onClick: () => setIsAnimeModalOpen(true),
    },
    {
      label: "Hall Legend",
      icon: Trophy,
      color: isCyber ? "#FFD700" : "#D97706",
      onClick: () => setIsHofModalOpen(true),
    },
    {
      label: "AI Tool",
      icon: Bot,
      color: isCyber ? "#00F5FF" : "#0284C7",
      onClick: () => setIsAiModalOpen(true),
    },
    {
      label: "Quick Note",
      icon: StickyNote,
      color: isCyber ? "#FFD166" : "#EAB308",
      onClick: () => router.push("/notepad"),
    },
    {
      label: "Prompt",
      icon: Sparkles,
      color: isCyber ? "#FF6B35" : "#EA580C",
      onClick: () => router.push("/prompt-vault"),
    },
  ];

  return (
    <>
      <div
        className="rounded-2xl p-4 border"
        style={{
          backgroundColor: isCyber ? "rgba(10, 15, 30, 0.75)" : "#FFFFFF",
          borderColor: isCyber ? "rgba(255, 255, 255, 0.1)" : "#000000",
          borderWidth: isCyber ? "1px" : "2.5px",
          boxShadow: isCyber ? "0 0 20px rgba(0, 0, 0, 0.4)" : "4px 4px 0 #000000",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Plus size={15} className={isCyber ? "text-cyan-400" : "text-black"} />
            <h3
              className="font-black text-xs uppercase tracking-wider"
              style={{
                color: isCyber ? "#E0E8FF" : "#1A1A1A",
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
              }}
            >
              {isCyber ? "// QUICK ACTIONS · CREATION TOOLBAR" : "Quick Actions Toolbar"}
            </h3>
          </div>
          <span className="text-[10px] theme-text-muted">Instant canonical modal launcher</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={action.onClick}
                className="py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer border select-none"
                style={{
                  backgroundColor: isCyber ? `${action.color}10` : "#F8FAFC",
                  borderColor: isCyber ? `${action.color}40` : "#CBD5E1",
                  color: isCyber ? "#FFFFFF" : "#1E293B",
                  boxShadow: isCyber ? `0 0 10px ${action.color}15` : "2px 2px 0 rgba(0,0,0,0.08)",
                }}
              >
                <Icon size={14} style={{ color: action.color }} />
                <span className="truncate">{action.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Canonical Modals Mounted on Demand ── */}
      {isGameModalOpen && (
        <GameEditorModal
          isOpen={isGameModalOpen}
          onClose={() => setIsGameModalOpen(false)}
        />
      )}

      {isCharModalOpen && (
        <GameCharacterEditorModal
          isOpen={isCharModalOpen}
          onClose={() => setIsCharModalOpen(false)}
        />
      )}

      {isDramaModalOpen && (
        <ManualDramaModal
          isOpen={isDramaModalOpen}
          onClose={() => setIsDramaModalOpen(false)}
        />
      )}

      {isAnimeModalOpen && (
        <ManualAnimeModal
          isOpen={isAnimeModalOpen}
          onClose={() => setIsAnimeModalOpen(false)}
        />
      )}

      {isHofModalOpen && (
        <HofEditorModal
          isOpen={isHofModalOpen}
          onClose={() => setIsHofModalOpen(false)}
        />
      )}

      {isAiModalOpen && (
        <AiToolEditorModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
        />
      )}
    </>
  );
}
