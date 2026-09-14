"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import Link from "next/link";
import Image from "next/image";
import { Heart, Sparkles, ArrowRight } from "lucide-react";

export function CoupleSpotlightCard() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const { couples = [], loveCouple } = useDashboardStore();
  const [isLoverBumping, setIsLoverBumping] = useState(false);

  // Surface currently strongest Love Match (highest likes, prioritizing favorites)
  const spotlightCouple = useMemo(() => {
    if (!couples || couples.length === 0) return null;
    const sorted = [...couples].sort((a, b) => {
      const aLikes = a.likes ?? 0;
      const bLikes = b.likes ?? 0;
      if (bLikes !== aLikes) return bLikes - aLikes;
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return 0;
    });
    return sorted[0];
  }, [couples]);

  const handleLoveMatchClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!spotlightCouple) return;
    setIsLoverBumping(true);
    setTimeout(() => setIsLoverBumping(false), 500);
    try {
      await loveCouple(spotlightCouple.id);
    } catch (err) {
      console.error("Failed to increment love match:", err);
    }
  };

  if (!spotlightCouple) {
    return (
      <div
        className="rounded-2xl p-5 border flex flex-col justify-between h-full"
        style={{
          backgroundColor: isCyber ? "rgba(10, 15, 30, 0.85)" : "#FFFFFF",
          borderColor: isCyber ? "rgba(255, 126, 185, 0.25)" : "#000000",
          borderWidth: isCyber ? "1px" : "2.5px",
          boxShadow: isCyber ? "0 0 15px rgba(255, 126, 185, 0.08)" : "4px 4px 0 #000000",
        }}
      >
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base" role="img" aria-label="heart">
              💕
            </span>
            <h3
              className="font-black text-xs uppercase tracking-wider"
              style={{
                color: isCyber ? "#FF7EB9" : "#1A1A1A",
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
              }}
            >
              {isCyber ? "// LOVE MATCH · SPOTLIGHT" : "Love Match Spotlight"}
            </h3>
          </div>
          <div className="p-6 text-center border border-dashed rounded-xl border-white/15 my-4">
            <p className="text-xs theme-text-muted italic">No couples cataloged yet.</p>
            <Link
              href="/couples"
              className="mt-2 inline-block text-xs font-bold text-pink-400 hover:underline"
            >
              + Create your first couple
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const coupleArtwork =
    spotlightCouple.media?.cover ||
    spotlightCouple.media?.card ||
    spotlightCouple.partnerA?.avatar ||
    spotlightCouple.partnerB?.avatar ||
    null;

  const partnerAName = spotlightCouple.partnerA?.name || "Partner A";
  const partnerBName = spotlightCouple.partnerB?.name || "Partner B";

  return (
    <div
      className="rounded-2xl p-5 border flex flex-col justify-between h-full relative overflow-hidden"
      style={{
        backgroundColor: isCyber ? "rgba(10, 15, 30, 0.85)" : "#FFFFFF",
        borderColor: isCyber ? "rgba(255, 126, 185, 0.3)" : "#000000",
        borderWidth: isCyber ? "1px" : "2.5px",
        boxShadow: isCyber ? "0 0 20px rgba(255, 126, 185, 0.12)" : "4px 4px 0 #000000",
      }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="text-base" role="img" aria-label="heart">
              💕
            </span>
            <h3
              className="font-black text-xs uppercase tracking-wider"
              style={{
                color: isCyber ? "#FF7EB9" : "#1A1A1A",
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
              }}
            >
              {isCyber ? "// LOVE MATCH · SPOTLIGHT" : "Love Match"}
            </h3>
          </div>

          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase"
            style={{
              backgroundColor: isCyber ? "rgba(255, 126, 185, 0.12)" : "#FFE4E6",
              borderColor: isCyber ? "rgba(255, 126, 185, 0.4)" : "#FDA4AF",
              color: isCyber ? "#FF7EB9" : "#E11D48",
            }}
          >
            {spotlightCouple.tier ? `${spotlightCouple.tier}-Tier` : "Top Pairing"}
          </span>
        </div>

        {/* Couple Card Body */}
        <div className="relative rounded-xl overflow-hidden border border-white/10 group mb-3.5">
          {/* Artwork Thumbnail / Banner */}
          <div className="relative h-32 w-full bg-slate-900 flex items-center justify-center overflow-hidden">
            {coupleArtwork ? (
              <Image
                src={coupleArtwork}
                alt={spotlightCouple.coupleName}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border border-pink-400/40 bg-pink-500/20 flex items-center justify-center text-lg">
                  🌸
                </div>
                <div className="text-pink-400 font-bold">♥</div>
                <div className="w-12 h-12 rounded-full border border-pink-400/40 bg-pink-500/20 flex items-center justify-center text-lg">
                  ✨
                </div>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            {/* Love Match Badge on artwork */}
            <div className="absolute top-2.5 right-2.5">
              <motion.button
                type="button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleLoveMatchClick}
                className="px-2.5 py-1 rounded-full border flex items-center gap-1.5 text-[11px] font-bold shadow-lg backdrop-blur-md cursor-pointer transition-all"
                style={{
                  backgroundColor: isCyber ? "rgba(10, 15, 30, 0.85)" : "#FFFFFF",
                  borderColor: isCyber ? "#FF7EB9" : "#E11D48",
                  color: isCyber ? "#FF7EB9" : "#E11D48",
                  boxShadow: isCyber ? "0 0 12px rgba(255,126,185,0.4)" : "2px 2px 0 #000",
                }}
                title="Click to celebrate (+1 Love Match)"
              >
                <motion.span
                  animate={isLoverBumping ? { scale: [1, 1.4, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Heart size={12} className="fill-current text-pink-400" />
                </motion.span>
                <span className="font-mono">{spotlightCouple.likes || 0}</span>
              </motion.button>
            </div>

            {/* Bottom Title Overlay */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 min-w-0">
              <p className="text-white font-black text-sm truncate drop-shadow-md">
                {spotlightCouple.coupleName}
              </p>
              <p className="text-pink-200/80 text-[10px] truncate font-medium">
                {spotlightCouple.source?.title || `${partnerAName} × ${partnerBName}`}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamics or relationship preview */}
        <div className="flex flex-wrap gap-1 mb-2">
          {(spotlightCouple.relationship?.dynamics || ["Canon Pairing"]).slice(0, 2).map((dyn) => (
            <span
              key={dyn}
              className="text-[10px] px-2 py-0.5 rounded-md border font-medium truncate"
              style={{
                backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#F1F5F9",
                borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#E2E8F0",
                color: isCyber ? "#E2E8F0" : "#475569",
              }}
            >
              {dyn}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-[10px] theme-text-muted">
          {spotlightCouple.likes || 0} Love Matches recorded
        </span>
        <Link
          href="/couples"
          className="inline-flex items-center gap-1 text-xs font-bold transition-all hover:gap-1.5"
          style={{ color: isCyber ? "#FF7EB9" : "#E11D48" }}
        >
          <span>View Couple</span>
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
