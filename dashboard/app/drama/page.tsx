"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { gridContainerVariants, cardVariants } from "@/lib/theme/motionVariants";

const REGIONS = [
  {
    id: "japanese",
    flag: "🇯🇵",
    label: "Japanese Drama",
    sublabel: "J-Drama",
    href: "/drama/japanese",
    desc: "Thriller, slice-of-life, and high-concept stories from Japan",
    palette: { brutal: { bg: "#FFB7C5", border: "#4A0A2E", accent: "#C9184A" }, cyber: { glow: "#FF69B4", bg: "rgba(201,24,74,0.08)" } },
  },
  {
    id: "korean",
    flag: "🇰🇷",
    label: "Korean Drama",
    sublabel: "K-Drama",
    href: "/drama/korean",
    desc: "Romance, survival thrillers, and superhero stories from Korea",
    palette: { brutal: { bg: "#C9F0FF", border: "#003366", accent: "#2EC4B6" }, cyber: { glow: "#22D3EE", bg: "rgba(46,196,182,0.08)" } },
  },
  {
    id: "chinese",
    flag: "🇨🇳",
    label: "Chinese Drama",
    sublabel: "C-Drama",
    href: "/drama/chinese",
    desc: "Wuxia, historical epics, and romantic xianxia from China",
    palette: { brutal: { bg: "#FFE4C4", border: "#7A0000", accent: "#C8102E" }, cyber: { glow: "#FFD700", bg: "rgba(200,16,46,0.08)" } },
  },
  {
    id: "hollywood",
    flag: "🎬",
    label: "Hollywood Drama",
    sublabel: "Hollywood",
    href: "/drama/hollywood",
    desc: "Blockbuster series, prestige TV, and cinematic universes from the West",
    palette: { brutal: { bg: "#F3E8FF", border: "#4C1D95", accent: "#7C3AED" }, cyber: { glow: "#A78BFA", bg: "rgba(124,58,237,0.08)" } },
  },
  {
    id: "indonesia",
    flag: "🇮🇩",
    label: "Indonesian Drama",
    sublabel: "Indonesian",
    href: "/drama/indonesia",
    desc: "Iconic serials, web series, and blockbuster cinema from Indonesia",
    palette: { brutal: { bg: "#FFE6E6", border: "#800000", accent: "#E60000" }, cyber: { glow: "#FF2A2A", bg: "rgba(255,42,42,0.08)" } },
  },
];


export default function DramaHubPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const dramas = useDashboardStore((s) => s.dramas);

  return (
    <AppShell>
      {/* Summary stats */}
      <motion.div className="flex flex-wrap gap-3 mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {REGIONS.map((r) => {
          const count = dramas.filter((d) => d.country === r.id).length;
          const color = isCyber ? r.palette.cyber.glow : r.palette.brutal.accent;
          return (
            <div key={r.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: isCyber ? r.palette.cyber.bg : `${r.palette.brutal.accent}15`, border: isCyber ? `1px solid ${r.palette.cyber.glow}30` : `2px solid ${r.palette.brutal.accent}` }}>
              <span>{r.flag}</span>
              <span className="font-bold text-sm" style={{ color }}>{count} {r.sublabel}</span>
            </div>
          );
        })}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: isCyber ? "rgba(0,245,255,0.05)" : "rgba(0,0,0,0.05)", border: isCyber ? "1px solid rgba(0,245,255,0.2)" : "2px solid rgba(0,0,0,0.2)" }}>
          <span>📺</span>
          <span className="font-bold text-sm theme-text-primary">{dramas.length} Total</span>
        </div>
      </motion.div>

      {/* Region cards */}
      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={gridContainerVariants} initial="hidden" animate="visible">
        {REGIONS.map((region) => {
          const regionDramas = dramas.filter((d) => d.country === region.id);
          const completed    = regionDramas.filter((d) => d.status === "Completed").length;
          const color        = isCyber ? region.palette.cyber.glow : region.palette.brutal.accent;

          return (
            <motion.div key={region.id} variants={cardVariants}>
              <Link href={region.href}>
                <motion.div
                  className="rounded-xl p-6 cursor-pointer h-full flex flex-col gap-4 relative overflow-hidden"
                  animate={{
                    background: isCyber ? region.palette.cyber.bg : region.palette.brutal.bg,
                    border: isCyber ? `1px solid ${region.palette.cyber.glow}30` : `2px solid ${region.palette.brutal.border}`,
                    boxShadow: isCyber ? `0 0 30px ${region.palette.cyber.glow}15` : `5px 5px 0 rgba(0,0,0,1)`,
                  }}
                  whileHover={{ scale: 1.02, boxShadow: isCyber ? `0 0 50px ${region.palette.cyber.glow}30` : `8px 8px 0 rgba(0,0,0,1)`, y: isCyber ? 0 : -4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Flag + title */}
                  <div>
                    <motion.span className="text-5xl block mb-3"
                      animate={{ filter: isCyber ? `drop-shadow(0 0 12px ${region.palette.cyber.glow}80)` : "none" }}
                      transition={{ duration: 0.4 }}
                    >
                      {region.flag}
                    </motion.span>
                    <h2 className="font-black text-xl mb-1" style={{ color: isCyber ? color : region.palette.brutal.border }}>{region.label}</h2>
                    <p className="text-sm" style={{ color: isCyber ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>{region.desc}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 mt-auto">
                    <div>
                      <p className="font-black text-2xl" style={{ color, textShadow: isCyber ? `0 0 10px ${color}` : "none" }}>{regionDramas.length}</p>
                      <p className="text-xs theme-text-muted">Total</p>
                    </div>
                    <div>
                      <p className="font-black text-2xl" style={{ color: isCyber ? "#39FF14" : "#06D6A0", textShadow: isCyber ? "0 0 10px rgba(57,255,20,0.8)" : "none" }}>{completed}</p>
                      <p className="text-xs theme-text-muted">Completed</p>
                    </div>
                    <div className="ml-auto flex items-end">
                      <motion.span className="text-2xl font-black" style={{ color }}>→</motion.span>
                    </div>
                  </div>

                  {/* Cyber corner accent */}
                  {isCyber && (
                    <motion.div className="absolute top-0 right-0 w-6 h-6" style={{ borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}` }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                  )}
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </AppShell>
  );
}
