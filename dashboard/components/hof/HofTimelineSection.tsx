"use client";

import React from "react";
import { ChampionshipTimelineItem } from "@/lib/utils/hofEngine";
import { useContextMenu } from "@/hooks/useContextMenu";

interface HofTimelineSectionProps {
  timeline: ChampionshipTimelineItem[];
  isCyber: boolean;
}

export function HofTimelineSection({ timeline, isCyber }: HofTimelineSectionProps) {
  const { openContextMenu } = useContextMenu();

  const handleTimelineContextMenu = (e: React.MouseEvent, item: ChampionshipTimelineItem) => {
    e.preventDefault();
    openContextMenu(
      e,
      [
        {
          id: "tl-inspect",
          label: `Inspect ${item.year} Season Champion`,
          icon: "👑",
          onClick: () => {},
        },
        {
          id: "tl-copy",
          label: `Copy ${item.year} Champion Record`,
          icon: "📋",
          onClick: () => {
            navigator.clipboard.writeText(`${item.year} Champion: ${item.championName} (${item.votes} votes)`);
          },
        },
      ],
      `${item.year} Champion: ${item.championName}`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">🏛️</span>
          <h3 className="text-base font-black theme-text-primary tracking-tight font-mono">
            Championship History & Season Legacy Archive
          </h3>
        </div>
        <span className="text-xs font-mono theme-text-muted font-bold">2022 – 2026 Champions</span>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-6 border-l-2" style={{ borderColor: isCyber ? "rgba(255,215,0,0.3)" : "#000000" }}>
        {timeline.map((item) => (
          <div
            key={item.year}
            onContextMenu={(e) => handleTimelineContextMenu(e, item)}
            className="relative p-5 rounded-3xl border font-mono space-y-2 cursor-pointer transition-all hover:translate-x-1"
            style={{
              backgroundColor: isCyber ? "rgba(10,15,36,0.6)" : "#FFFFFF",
              borderColor: item.year === 2026 ? "#FFD700" : isCyber ? "rgba(255,255,255,0.1)" : "#000000",
              borderWidth: item.year === 2026 ? (isCyber ? "2px" : "3px") : isCyber ? "1px" : "2px",
              boxShadow: item.year === 2026 ? (isCyber ? "0 0 25px rgba(255,215,0,0.2)" : "5px 5px 0 #000000") : "3px 3px 0 rgba(0,0,0,0.1)",
            }}
          >
            {/* Timeline node marker dot */}
            <div
              className="absolute -left-[31px] sm:-left-[39px] top-6 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-black"
              style={{
                backgroundColor: item.year === 2026 ? "#FFD700" : isCyber ? "#050816" : "#FFFFFF",
                borderColor: item.year === 2026 ? "#FFD700" : isCyber ? "#00F5FF" : "#000000",
                color: item.year === 2026 ? "#000" : isCyber ? "#00F5FF" : "#000",
              }}
            >
              {item.year === 2026 ? "👑" : "🏆"}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  SEASON {item.year}
                </span>
                <strong className="text-base font-black theme-text-primary">{item.championName}</strong>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-black/10 dark:bg-white/10 theme-text-muted">
                  {item.category}
                </span>
                <span className="text-xs font-bold text-amber-500">❤️ {item.votes} Votes</span>
              </div>
            </div>

            <p className="text-xs theme-text-muted leading-relaxed font-mono">
              &quot;{item.note}&quot;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
