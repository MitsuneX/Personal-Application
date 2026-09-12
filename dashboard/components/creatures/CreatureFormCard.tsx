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
      className={`group relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 ${
        isPreview ? "shadow-md" : "hover:-translate-y-1"
      }`}
      style={{
        backgroundColor: isCyber ? "#080c1a" : "#FFFFFF",
        borderColor: isCyber
          ? "rgba(168, 85, 247, 0.35)"
          : "#000000",
        borderWidth: isCyber ? "1.5px" : "2.5px",
        boxShadow: isCyber
          ? isPreview
            ? "0 0 15px rgba(168, 85, 247, 0.2)"
            : "0 4px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(168, 85, 247, 0.15)"
          : isPreview
          ? "3px 3px 0px #000000"
          : "4px 4px 0px #000000",
      }}
    >
      {/* ── 1. FULL ARTWORK CONTAINER ── */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[4/3] max-h-72 overflow-hidden bg-black/40 border-b border-white/10">
        {artwork ? (
          <>
            {/* Ambient blurred backdrop — ensures no ugly empty gray bars and preserves natural aspect ratio */}
            <div
              className="absolute inset-0 bg-cover bg-center scale-125 blur-2xl opacity-35 transition-transform duration-700 group-hover:scale-135"
              style={{ backgroundImage: `url(${artwork})` }}
            />
            {/* Cinematic bottom vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent pointer-events-none z-1" />
            {/* Crisp full-artwork foreground: contained without aggressive cropping */}
            <img
              src={artwork}
              alt={name}
              className="relative z-10 w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105 drop-shadow-md"
              loading="lazy"
            />
          </>
        ) : (
          <div
            className={`w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center ${
              isCyber
                ? "bg-gradient-to-br from-violet-950/40 via-purple-950/20 to-black/80"
                : "bg-gradient-to-br from-violet-50 via-purple-50 to-amber-50"
            }`}
          >
            <span className="text-4xl opacity-50 animate-pulse">✦</span>
            <span
              className="text-[11px] font-mono font-bold tracking-widest uppercase opacity-60"
              style={{ color: isCyber ? "#C084FC" : "#7E22CE" }}
            >
              No Form Artwork
            </span>
          </div>
        )}

        {/* Optional preview tag */}
        {isPreview && (
          <div className="absolute top-2.5 right-2.5 z-20">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider bg-black/70 text-cyan-300 border border-cyan-400/50 backdrop-blur-md">
              Live Preview
            </span>
          </div>
        )}
      </div>

      {/* ── 2. FORM BODY HIERARCHY ── */}
      <div className="p-4 sm:p-5 space-y-2.5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* FORM NAME */}
          <h5
            className="text-base sm:text-lg font-black font-mono tracking-tight leading-tight transition-colors"
            style={{
              color: isCyber ? "#FFFFFF" : "#000000",
              textShadow: isCyber ? "0 2px 10px rgba(0,0,0,0.8)" : "none",
            }}
          >
            {name}
          </h5>

          {/* FORM TYPE / BADGE */}
          {form.variantType && (
            <div>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider border shadow-sm"
                style={{
                  backgroundColor: isCyber ? "rgba(168, 85, 247, 0.2)" : "#F3E8FF",
                  borderColor: isCyber ? "rgba(168, 85, 247, 0.5)" : "#000000",
                  color: isCyber ? "#C084FC" : "#6B21A8",
                  boxShadow: isCyber ? "0 0 10px rgba(168,85,247,0.25)" : "2px 2px 0px #000000",
                }}
              >
                <span>✦</span>
                <span>{form.variantType}</span>
              </span>
            </div>
          )}

          {/* SHORT DESCRIPTION */}
          {form.description && (
            <p
              className={`text-xs font-mono leading-relaxed line-clamp-3 ${
                isCyber ? "text-slate-300/85" : "text-slate-700"
              }`}
            >
              {form.description}
            </p>
          )}
        </div>

        {/* FORM TAGS / METADATA */}
        {form.tags && form.tags.length > 0 && (
          <div
            className={`flex flex-wrap items-center gap-1.5 pt-2 border-t ${
              isCyber ? "border-white/10" : "border-black/10"
            }`}
          >
            {form.tags.map((tag) => (
              <span
                key={tag}
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-medium ${
                  isCyber
                    ? "bg-white/5 border-white/10 text-slate-300"
                    : "bg-amber-50 border border-black/30 text-slate-800"
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
