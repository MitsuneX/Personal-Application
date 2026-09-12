"use client";

import React from "react";
import { CreatureForm } from "@/lib/data/creatureSchema";

interface CreatureFormCardProps {
  form: Partial<CreatureForm>;
  isCyber: boolean;
  isPreview?: boolean;
}

export function CreatureFormCard({
  form,
  isCyber,
  isPreview = false,
}: CreatureFormCardProps) {
  const artwork = form.artwork?.trim() || null;
  const name = form.displayName || form.name || (isPreview ? "Form Name Preview" : "Unnamed Form");

  return (
    <div
      className={`group relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 select-none w-full aspect-[3/4] min-h-[360px] sm:min-h-[400px] ${
        isPreview ? "shadow-md" : "hover:-translate-y-1.5"
      }`}
      style={{
        backgroundColor: isCyber ? "#050816" : "#FFFDF5",
        borderColor: isCyber
          ? isPreview
            ? "rgba(168, 85, 247, 0.6)"
            : "rgba(168, 85, 247, 0.35)"
          : "#000000",
        borderWidth: isCyber ? "1.5px" : "3px",
        boxShadow: isCyber
          ? isPreview
            ? "0 0 20px rgba(168, 85, 247, 0.3)"
            : "0 4px 25px rgba(0, 0, 0, 0.6), 0 0 15px rgba(168, 85, 247, 0.2)"
          : isPreview
          ? "4px 4px 0px #000000"
          : "5px 5px 0px #000000",
      }}
    >
      {/* ── 1. FULL ARTWORK CANVAS ── */}
      {artwork ? (
        <>
          {/* Ambient blurred backdrop — ensures rich color luminescence across the entire card */}
          <div
            className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl opacity-40 transition-transform duration-700 ease-out group-hover:scale-125 pointer-events-none"
            style={{ backgroundImage: `url(${artwork})` }}
          />

          {/* Foreground Full-Card Artwork — object-cover maintains exact aspect ratio without distortion */}
          <img
            src={artwork}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none"
            loading="lazy"
          />

          {/* Top Subtle Vignette — gives clean contrast for top badges */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 via-black/20 to-transparent pointer-events-none z-1" />

          {/* Bottom Readable Gradient Overlay — transparent upward gradient for crisp text legibility */}
          <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/95 via-black/75 via-45% to-transparent pointer-events-none z-1" />
        </>
      ) : (
        /* Fallback when no artwork exists */
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center ${
            isCyber
              ? "bg-gradient-to-br from-violet-950/50 via-purple-950/30 to-black"
              : "bg-gradient-to-br from-amber-50 via-purple-50 to-violet-100"
          }`}
        >
          <span className="text-5xl opacity-40 animate-pulse">✦</span>
          <span
            className="text-xs font-mono font-bold tracking-widest uppercase opacity-70"
            style={{ color: isCyber ? "#C084FC" : "#7E22CE" }}
          >
            No Form Artwork
          </span>
          <p className="text-[10px] font-mono opacity-50 max-w-[200px]">
            Upload or provide an image URL in the editor to display full-art collectible artwork.
          </p>
        </div>
      )}

      {/* ── 2. OVERLAID CONTENT HIERARCHY ── */}
      <div className="relative z-10 flex flex-col justify-between h-full p-4 sm:p-5 pointer-events-none">
        {/* TOP ROW: Variant Pill & Live Preview Tag */}
        <div className="flex items-start justify-between gap-2">
          {form.variantType ? (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider backdrop-blur-md shadow-md"
              style={{
                backgroundColor: isCyber ? "rgba(10, 15, 40, 0.8)" : "#FACC15",
                borderColor: isCyber ? "rgba(168, 85, 247, 0.6)" : "#000000",
                borderWidth: isCyber ? "1px" : "2px",
                color: isCyber ? "#E9D5FF" : "#000000",
                boxShadow: isCyber ? "0 0 12px rgba(168, 85, 247, 0.35)" : "2px 2px 0px #000000",
              }}
            >
              <span className={isCyber ? "text-violet-400" : "text-black"}>✦</span>
              <span>{form.variantType}</span>
            </span>
          ) : (
            <div />
          )}

          {isPreview && (
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider bg-black/80 text-cyan-300 border border-cyan-400/70 backdrop-blur-md shadow-lg shrink-0">
              Live Preview
            </span>
          )}
        </div>

        {/* BOTTOM SECTION: Name, Description, Tags */}
        <div className="space-y-2 pt-6">
          {/* Form Name */}
          <h5
            className="text-base sm:text-lg md:text-xl font-black font-mono tracking-tight leading-snug text-white transition-colors"
            style={{
              textShadow: "0 2px 8px rgba(0,0,0,0.95), 0 0 20px rgba(0,0,0,0.8)",
            }}
          >
            {name}
          </h5>

          {/* Short Description */}
          {form.description && (
            <p
              className="text-xs font-mono leading-relaxed line-clamp-3 text-slate-200/90"
              style={{
                textShadow: "0 1px 4px rgba(0,0,0,0.9)",
              }}
            >
              {form.description}
            </p>
          )}

          {/* Form Tags / Metadata */}
          {form.tags && form.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/15">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-md font-bold backdrop-blur-md"
                  style={{
                    backgroundColor: isCyber ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.9)",
                    borderColor: isCyber ? "rgba(255, 255, 255, 0.25)" : "#000000",
                    borderWidth: isCyber ? "1px" : "1.5px",
                    color: isCyber ? "#F1F5F9" : "#000000",
                    boxShadow: isCyber ? "none" : "1px 1px 0px #000000",
                    textShadow: isCyber ? "0 1px 3px rgba(0,0,0,0.8)" : "none",
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
