"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  getVisibleLandingModules,
  renderLandingModuleIcon,
} from "@/lib/config/landingModules";

interface LandingFeaturesProps {
  isCyber: boolean;
  visibleFeatures?: string[];
  accentColor?: string;
}

export function LandingFeatures({
  isCyber,
  visibleFeatures,
  accentColor = "#00F5FF",
}: LandingFeaturesProps) {
  // Use shared catalog single-source of truth filtered by visibleFeatures allowlist
  const activeFeatures = getVisibleLandingModules(visibleFeatures);

  return (
    <div id="explore" className="space-y-6 mb-12 select-none scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col gap-1 text-center md:text-left">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
          // SYSTEM MODULES & ARCHIVE ENGINE
        </span>
        <h2
          className="text-2xl sm:text-3xl font-black tracking-tight"
          style={{
            color: isCyber ? "#E0E8FF" : "#000000",
            fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
          }}
        >
          Explore What This World Contains
        </h2>
      </div>

      {/* Grid of Feature Showcase Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {activeFeatures.map((feat, idx) => (
          <Link key={feat.id} href={feat.route} className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all h-full cursor-pointer"
              style={{
                backgroundColor: isCyber ? "rgba(10,15,36,0.6)" : "#FFFFFF",
                borderColor: isCyber ? "rgba(0,245,255,0.18)" : "#000000",
                borderWidth: isCyber ? "1px" : "2.5px",
                boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.04)" : "4px 4px 0 #000000",
              }}
            >
              <div className="space-y-3">
                {/* Header Icon & Subtitle */}
                <div className="flex items-center justify-between">
                  <div
                    className="p-3 rounded-xl border flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "#FFE600",
                      borderColor: isCyber ? `${accentColor}40` : "#000000",
                      color: isCyber ? accentColor : "#000000",
                    }}
                  >
                    {renderLandingModuleIcon(feat.iconName, 24)}
                  </div>
                  <span className="text-[10px] font-mono font-bold opacity-50 uppercase">
                    MODULE {idx + 1}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3
                    className="text-base font-black tracking-tight"
                    style={{ color: isCyber ? "#E0E8FF" : "#000000" }}
                  >
                    {feat.title}
                  </h3>
                  <p className="text-xs font-mono font-semibold opacity-60 mt-0.5">
                    {feat.subtitle}
                  </p>
                  <p className="text-xs leading-relaxed opacity-80 mt-2 font-mono">
                    {feat.description}
                  </p>
                </div>
              </div>

              {/* Tag Badges */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-black/10 dark:border-white/10">
                {feat.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider border"
                    style={{
                      backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F3F4F6",
                      borderColor: isCyber ? "rgba(255,255,255,0.12)" : "#000000",
                      color: isCyber ? "#94A3B8" : "#4B5563",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
