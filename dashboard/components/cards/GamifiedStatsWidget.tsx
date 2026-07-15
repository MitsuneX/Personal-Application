"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";

interface Particle {
  id: number;
  x: number;
  y: number;
  text: string;
}

export function GamifiedStatsWidget() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  // Widget A: RPG Stats
  const [hp, setHp] = useState(85);
  const [mp, setMp] = useState(60);
  const [agi, setAgi] = useState(72);

  // Widget B: XP & Level
  const [level, setLevel] = useState(19);
  const [xp, setXp] = useState(74);

  // Widget C: Now Playing Spotify/Discord
  const [activity, setActivity] = useState({
    type: "spotify",
    title: "Lo-Fi Coding Beats",
    subtitle: "Idealism - Phantasia",
    icon: "🎧",
  });

  useEffect(() => {
    // Simulate periodic activity updates
    const interval = setInterval(() => {
      setActivity((prev) => {
        if (prev.type === "spotify") {
          return {
            type: "discord",
            title: "Coding in VS Code",
            subtitle: "Project: Nexus Xeon Dashboard",
            icon: "💻",
          };
        } else {
          return {
            type: "spotify",
            title: "Lo-Fi Coding Beats",
            subtitle: "Idealism - Phantasia",
            icon: "🎧",
          };
        }
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Widget D: Arcade Pings & Particles
  const [pings, setPings] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);

  const triggerPing = (text: string) => {
    setPings((prev) => prev + 1);
    const newId = Date.now() + Math.random();
    const newParticle: Particle = {
      id: newId,
      // Random coordinates inside button bounds or center
      x: Math.random() * 80 - 40,
      y: -20 - Math.random() * 20,
      text,
    };
    setParticles((prev) => [...prev, newParticle]);

    // Clean up
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newId));
    }, 1000);
  };

  const handleCastHeal = () => {
    setHp((prev) => Math.min(100, prev + 10));
    setMp((prev) => Math.max(0, prev - 15));
    triggerPing("✨ HEAL! +10 HP");
  };

  const handleSendPing = () => {
    setXp((prev) => {
      if (prev >= 95) {
        setLevel((l) => l + 1);
        return 0;
      }
      return prev + 5;
    });
    triggerPing("📡 PING! +5 XP");
  };

  return (
    <div
      className="p-5 rounded-2xl border flex flex-col gap-5 relative overflow-hidden"
      style={{
        backgroundColor: isCyber ? "rgba(10, 15, 44, 0.6)" : "#FFFFFF",
        borderColor: isCyber ? "rgba(0, 245, 255, 0.25)" : "#000000",
        borderWidth: isCyber ? "1px" : "3px",
        boxShadow: isCyber ? "0 0 30px rgba(0, 245, 255, 0.08)" : "6px 6px 0px #000000",
      }}
    >
      <h2
        className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5"
        style={{
          color: isCyber ? "#00F5FF" : "#000000",
          fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
          textShadow: isCyber ? "0 0 10px rgba(0,245,255,0.4)" : "none",
        }}
      >
        🎮 ACTIVITY & RPG STATS
      </h2>

      {/* WIDGET B: XP / Level-Up Progress Bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-xs font-black">
          <span style={{ color: isCyber ? "#FFD700" : "#B45309" }}>⚡ LVL {level}</span>
          <span className="opacity-60">{xp}% XP</span>
        </div>
        <div
          className="h-3 rounded-full overflow-hidden border border-black/20 dark:border-white/10"
          style={{
            backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#F3F4F6",
          }}
        >
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${xp}%` }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
            style={{
              background: isCyber
                ? "linear-gradient(90deg, #FF6B35, #FFD700)"
                : "#FF6B35",
              boxShadow: isCyber ? "0 0 10px rgba(255,107,53,0.5)" : "none",
            }}
          />
        </div>
        <p className="text-[10px] theme-text-muted mt-0.5 font-bold uppercase tracking-wider flex items-center gap-1">
          <span>⚔️ Active Quest:</span>
          <span className="opacity-95" style={{ color: isCyber ? "#00F5FF" : "#1E3A8A" }}>Refactoring Profile Customizer Layout</span>
        </p>
      </div>

      {/* WIDGET A: RPG Stat Block */}
      <div className="flex flex-col gap-3 p-3 rounded-xl border border-black/10 dark:border-white/5 bg-black/5 dark:bg-white/5">
        <span className="text-[10px] font-black uppercase tracking-wider theme-text-muted">RPG Stats Attributes</span>
        
        {/* HP Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold w-8 text-red-500 shrink-0">HP</span>
          <input
            type="range"
            min="0"
            max="100"
            value={hp}
            onChange={(e) => setHp(Number(e.target.value))}
            className="flex-1 accent-red-500 h-1 cursor-pointer"
          />
          <span className="text-xs font-mono font-bold w-8 text-right text-red-500">{hp}</span>
        </div>

        {/* MP Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold w-8 text-blue-500 shrink-0">MP</span>
          <input
            type="range"
            min="0"
            max="100"
            value={mp}
            onChange={(e) => setMp(Number(e.target.value))}
            className="flex-1 accent-blue-500 h-1 cursor-pointer"
          />
          <span className="text-xs font-mono font-bold w-8 text-right text-blue-500">{mp}</span>
        </div>

        {/* AGI Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold w-8 text-green-500 shrink-0">AGI</span>
          <input
            type="range"
            min="0"
            max="100"
            value={agi}
            onChange={(e) => setAgi(Number(e.target.value))}
            className="flex-1 accent-green-500 h-1 cursor-pointer"
          />
          <span className="text-xs font-mono font-bold w-8 text-right text-green-500">{agi}</span>
        </div>
      </div>

      {/* WIDGET C: "Now Playing" Activity Block */}
      <div
        className="p-3 rounded-xl border flex items-center gap-3 relative overflow-hidden transition-all duration-200"
        style={{
          background: isCyber ? "rgba(0,0,0,0.2)" : "#FFFDEB",
          borderColor: isCyber ? "rgba(0,245,255,0.12)" : "rgba(0,0,0,0.1)",
        }}
      >
        <span className="text-2xl animate-bounce shrink-0">{activity.icon}</span>
        <div className="min-w-0">
          <p className="text-[10px] font-black tracking-widest uppercase text-green-500">Live Status</p>
          <h4 className="text-xs font-black truncate theme-text-primary leading-tight">{activity.title}</h4>
          <p className="text-[10px] theme-text-muted truncate mt-0.5">{activity.subtitle}</p>
        </div>
      </div>

      {/* WIDGET D: Interactive Arcade Ping Button */}
      <div className="flex gap-2 items-center justify-between">
        <div className="text-xs font-bold">
          <span className="opacity-60 uppercase tracking-widest text-[9px] block">Actions Casted</span>
          <span className="text-sm font-black font-mono" style={{ color: isCyber ? "#FFD700" : "#B45309" }}>{pings} Hits</span>
        </div>

        <div className="flex gap-2 relative">
          {/* Floating particles display */}
          <AnimatePresence>
            {particles.map((p) => (
              <motion.span
                key={p.id}
                initial={{ opacity: 1, scale: 0.8, y: 0, x: p.x }}
                animate={{ opacity: 0, scale: 1.2, y: -80, rotate: p.x }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute text-[10px] font-black pointer-events-none select-none z-50 px-2 py-0.5 rounded border border-black/20"
                style={{
                  background: isCyber ? "rgba(0, 245, 255, 0.95)" : "#FEF08A",
                  color: isCyber ? "#050816" : "#000000",
                  boxShadow: isCyber ? "0 0 15px #00F5FF" : "2px 2px 0px #000000",
                  textShadow: "none",
                }}
              >
                {p.text}
              </motion.span>
            ))}
          </AnimatePresence>

          <button
            onClick={handleCastHeal}
            disabled={mp < 15}
            className="px-3.5 py-2 text-[10px] font-black rounded-xl transition-all border disabled:opacity-50 select-none shrink-0"
            style={{
              backgroundColor: isCyber ? "rgba(168,85,247,0.15)" : "#E9D5FF",
              borderColor: isCyber ? "rgba(168,85,247,0.4)" : "#000000",
              color: isCyber ? "#C084FC" : "#7E22CE",
              borderWidth: isCyber ? "1px" : "2.5px",
              boxShadow: isCyber ? "0 0 8px rgba(168,85,247,0.2)" : "3px 3px 0px #000000",
              transform: isCyber ? "none" : "translate(-1px, -1px)",
            }}
          >
            🪄 Cast Heal (-15 MP)
          </button>

          <button
            onClick={handleSendPing}
            className="px-3.5 py-2 text-[10px] font-black rounded-xl transition-all border select-none shrink-0"
            style={{
              backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#FFB7C5",
              borderColor: isCyber ? "rgba(0,245,255,0.4)" : "#000000",
              color: isCyber ? "#00F5FF" : "#C9184A",
              borderWidth: isCyber ? "1px" : "2.5px",
              boxShadow: isCyber ? "0 0 8px rgba(0,245,255,0.2)" : "3px 3px 0px #000000",
              transform: isCyber ? "none" : "translate(-1px, -1px)",
            }}
          >
            📡 Cast Ping (+5 XP)
          </button>
        </div>
      </div>
    </div>
  );
}
