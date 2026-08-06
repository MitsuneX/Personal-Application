"use client";

import React from "react";

export interface DynamicGameStatsProps {
  gameCategory?: string; // e.g., "MOBA", "Hero Shooter", "Gacha RPG", "Tactical FPS", etc.
  gameName?: string;
  role?: string;
  category?: string;
  element?: string;
  path?: string;
  weapon?: string;
  rarity?: string;
  nation?: string;
  birthday?: string;
  health?: number | null;
  damage?: number | null;
  difficulty?: string | null;
  pickRate?: number | null;
  banRate?: number | null;
  winRate?: number | null;
  className?: string;
  compact?: boolean;
}

export function DynamicGameStats({
  gameCategory = "",
  gameName = "",
  role,
  category,
  element,
  path,
  weapon,
  rarity,
  nation,
  birthday,
  health,
  damage,
  difficulty,
  pickRate,
  banRate,
  winRate,
  className = "",
  compact = false,
}: DynamicGameStatsProps) {
  const normCategory = (gameCategory || "").toLowerCase();
  const normGame = (gameName || "").toLowerCase();

  const isMoba = normCategory.includes("moba") || normGame.includes("mobile legends") || normGame.includes("league of legends") || normGame.includes("dota");
  const isShooter = normCategory.includes("shooter") || normCategory.includes("fps") || normGame.includes("valorant") || normGame.includes("overwatch");
  const isGacha = normCategory.includes("gacha") || normCategory.includes("rpg") || normGame.includes("star rail") || normGame.includes("genshin") || normGame.includes("wuthering") || normGame.includes("zone zero") || normGame.includes("nikke") || normGame.includes("fate");

  if (compact) {
    return (
      <div className={`flex flex-wrap items-center gap-1.5 text-xs ${className}`}>
        {rarity && (
          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
            {rarity}
          </span>
        )}
        {element && (
          <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            ✨ {element}
          </span>
        )}
        {path && (
          <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
            🌌 {path}
          </span>
        )}
        {role && (
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            🎯 {role}
          </span>
        )}
        {isMoba && winRate !== undefined && winRate !== null && winRate > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
            📊 {winRate}% WR
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 ${className}`}>
      {/* Gacha RPG Metadata */}
      {rarity && (
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Rarity</span>
          <span className="text-sm font-bold text-amber-300">⭐ {rarity}</span>
        </div>
      )}
      {element && (
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Element / Vision</span>
          <span className="text-sm font-semibold text-cyan-400">✨ {element}</span>
        </div>
      )}
      {path && (
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Path / Specialty</span>
          <span className="text-sm font-semibold text-purple-400">🌌 {path}</span>
        </div>
      )}
      {weapon && (
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Weapon</span>
          <span className="text-sm font-semibold text-slate-200">⚔️ {weapon}</span>
        </div>
      )}
      {nation && (
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Nation / Faction</span>
          <span className="text-sm font-semibold text-sky-300">🏛️ {nation}</span>
        </div>
      )}
      {birthday && (
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Birthday</span>
          <span className="text-sm font-semibold text-pink-300">🎂 {birthday}</span>
        </div>
      )}

      {/* Role / Lane */}
      {role && (
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Combat Role</span>
          <span className="text-sm font-semibold text-emerald-400">🎯 {role}</span>
        </div>
      )}
      {category && (
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Lane / Class</span>
          <span className="text-sm font-semibold text-indigo-300">🛡️ {category}</span>
        </div>
      )}

      {/* Hero Shooter Stats */}
      {isShooter && health !== undefined && health !== null && (
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Base HP</span>
          <span className="text-sm font-bold text-red-400">❤️ {health}</span>
        </div>
      )}
      {isShooter && damage !== undefined && damage !== null && (
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">DPS / Output</span>
          <span className="text-sm font-bold text-orange-400">💥 {damage}</span>
        </div>
      )}
      {isShooter && difficulty && (
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Difficulty</span>
          <span className="text-sm font-semibold text-amber-400">⚡ {difficulty}</span>
        </div>
      )}

      {/* MOBA Stats (Win Rate ONLY for MOBA/Competitive) */}
      {isMoba && winRate !== undefined && winRate !== null && (
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Win Rate</span>
          <span className="text-sm font-bold text-green-400">📈 {winRate}%</span>
        </div>
      )}
      {isMoba && pickRate !== undefined && pickRate !== null && (
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Pick Rate</span>
          <span className="text-sm font-semibold text-blue-400">📊 {pickRate}%</span>
        </div>
      )}
      {isMoba && banRate !== undefined && banRate !== null && (
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Ban Rate</span>
          <span className="text-sm font-semibold text-rose-400">🚫 {banRate}%</span>
        </div>
      )}
    </div>
  );
}
