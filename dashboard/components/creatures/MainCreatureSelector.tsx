"use client";

import React, { useState, useMemo } from "react";
import { CreatureEntry, getClassificationMeta, CREATURE_TIER_META } from "@/lib/data/creatureSchema";

interface MainCreatureSelectorProps {
  /** ID of the currently assigned Main Creature (from mainCreatureId) */
  value: string | null | undefined;
  /** All available creatures to pick from */
  creatures: CreatureEntry[];
  /** Called with the new creature ID when the user assigns one, or null to clear */
  onChange: (creatureId: string | null) => void;
  isCyber: boolean;
  /** Optional label override */
  label?: string;
}

export function MainCreatureSelector({
  value,
  creatures,
  onChange,
  isCyber,
  label = "Main Creature",
}: MainCreatureSelectorProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const assignedCreature = useMemo(
    () => (value ? creatures.find((c) => c.id === value) ?? null : null),
    [value, creatures]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return creatures;
    return creatures.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.classification.toLowerCase().includes(q) ||
        c.sourceTitle.toLowerCase().includes(q) ||
        (c.species && c.species.toLowerCase().includes(q))
    );
  }, [creatures, query]);

  const containerStyle = isCyber
    ? "bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-3"
    : "bg-white border-2 border-black rounded-2xl p-4 space-y-3 shadow-[3px_3px_0px_#000]";

  const inputStyle = isCyber
    ? "w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-cyan-400/60 placeholder-slate-500"
    : "w-full px-3 py-2 rounded-xl bg-white border-2 border-black text-black text-xs font-mono focus:outline-none focus:ring-2 focus:ring-black placeholder-slate-400";

  const buttonBase = isCyber
    ? "text-xs font-mono font-bold px-3 py-1.5 rounded-xl border cursor-pointer transition-all"
    : "text-xs font-mono font-bold px-3 py-1.5 rounded-xl border-2 border-black cursor-pointer transition-all shadow-[2px_2px_0px_#000]";

  /* ── When a creature IS assigned, show the preview ── */
  if (assignedCreature && !isSearching) {
    const art =
      assignedCreature.media.card ||
      assignedCreature.media.primary ||
      assignedCreature.media.gallery?.[0] ||
      null;
    const meta = getClassificationMeta(assignedCreature.classification);
    const tierMeta = CREATURE_TIER_META[assignedCreature.tier];

    return (
      <div className={containerStyle}>
        <div className="flex items-center justify-between">
          <span
            className={`text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5 ${
              isCyber ? "text-amber-300" : "text-amber-800"
            }`}
          >
            🌟 {label}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSearching(true)}
              className={`${buttonBase} ${
                isCyber
                  ? "border-slate-600 text-slate-300 hover:border-cyan-400/50 hover:text-cyan-300"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className={`${buttonBase} ${
                isCyber
                  ? "border-red-500/40 text-red-400 hover:border-red-400 hover:bg-red-500/10"
                  : "bg-red-100 text-red-800 hover:bg-red-200"
              }`}
            >
              Remove
            </button>
          </div>
        </div>

        {/* Preview card */}
        <div
          className={`flex items-center gap-3 p-3 rounded-xl border ${
            isCyber
              ? "bg-amber-500/5 border-amber-500/20"
              : "bg-amber-50 border border-amber-300"
          }`}
        >
          <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-black/20 bg-slate-900">
            {art ? (
              <img
                src={art}
                alt={assignedCreature.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                {meta.icon}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className={`text-sm font-black font-mono truncate ${isCyber ? "text-white" : "text-black"}`}>
              {assignedCreature.name}
            </p>
            <div className="flex flex-wrap items-center gap-1">
              <span
                className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border uppercase"
                style={{
                  backgroundColor: isCyber ? meta.bgCyber : meta.bgNeo,
                  borderColor: isCyber ? meta.borderCyber : "#000",
                  color: isCyber ? meta.color : "#000",
                }}
              >
                {meta.icon} {meta.label}
              </span>
              {assignedCreature.tier && (
                <span
                  className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold border uppercase"
                  style={{
                    backgroundColor: isCyber ? tierMeta?.bgCyber : tierMeta?.bgNeo,
                    borderColor: isCyber ? tierMeta?.borderCyber : "#000",
                    color: isCyber ? tierMeta?.color : "#000",
                  }}
                >
                  {assignedCreature.tier} TIER
                </span>
              )}
              <span className={`text-[9px] font-mono truncate ${isCyber ? "text-slate-400" : "text-slate-600"}`}>
                {assignedCreature.sourceTitle}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── No creature assigned OR in search mode: render the picker ── */
  return (
    <div className={containerStyle}>
      <div className="flex items-center justify-between">
        <span
          className={`text-[10px] font-mono font-black uppercase tracking-wider ${
            isCyber ? "text-amber-300" : "text-amber-800"
          }`}
        >
          🌟 {label}
        </span>
        {isSearching && assignedCreature && (
          <button
            type="button"
            onClick={() => { setIsSearching(false); setQuery(""); }}
            className={`${buttonBase} ${
              isCyber
                ? "border-slate-600 text-slate-400 hover:text-slate-200"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            Cancel
          </button>
        )}
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, species, franchise…"
        className={inputStyle}
      />

      {/* Results list */}
      <div className="space-y-1 max-h-56 overflow-y-auto rounded-xl">
        {filtered.length === 0 ? (
          <div className={`text-center py-6 text-xs font-mono ${isCyber ? "text-slate-500" : "text-slate-400"}`}>
            No creatures found
          </div>
        ) : (
          filtered.map((c) => {
            const art = c.media.card || c.media.primary || c.media.gallery?.[0] || null;
            const meta = getClassificationMeta(c.classification);
            const tierMeta = CREATURE_TIER_META[c.tier];
            const isSelected = c.id === value;

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onChange(c.id);
                  setIsSearching(false);
                  setQuery("");
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? isCyber
                      ? "bg-amber-500/15 border-amber-400/50"
                      : "bg-amber-100 border border-amber-400"
                    : isCyber
                    ? "bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-white/20"
                    : "bg-white border border-black/10 hover:bg-amber-50 hover:border-black/40"
                }`}
              >
                <div className="shrink-0 w-8 h-8 rounded-lg overflow-hidden border border-black/20 bg-slate-900">
                  {art ? (
                    <img src={art} alt={c.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-base">{meta.icon}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className={`text-xs font-black font-mono truncate ${isCyber ? "text-white" : "text-black"}`}>
                    {c.name}
                  </p>
                  <p className={`text-[10px] font-mono truncate ${isCyber ? "text-slate-400" : "text-slate-600"}`}>
                    {meta.icon} {meta.label}
                    {c.tier && (
                      <span
                        className="ml-1 font-bold"
                        style={{ color: isCyber ? tierMeta?.color : "#000" }}
                      >
                        · {c.tier} TIER
                      </span>
                    )}
                    {" · "}{c.sourceTitle}
                  </p>
                </div>
                {isSelected && (
                  <span className={`shrink-0 text-xs font-mono font-bold ${isCyber ? "text-amber-300" : "text-amber-700"}`}>
                    ✓
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
