"use client";

import React from "react";
import { HallActivityItem } from "@/lib/utils/hofEngine";
import { useContextMenu } from "@/hooks/useContextMenu";

interface HofActivityFeedProps {
  activityFeed: HallActivityItem[];
  isCyber: boolean;
}

export function HofActivityFeed({ activityFeed, isCyber }: HofActivityFeedProps) {
  const { openContextMenu } = useContextMenu();

  const handleActivityContextMenu = (e: React.MouseEvent, item: HallActivityItem) => {
    e.preventDefault();
    openContextMenu(
      e,
      [
        {
          id: "act-copy",
          label: `Copy Feed Update: ${item.title}`,
          icon: "⚡",
          onClick: () => {
            navigator.clipboard.writeText(`${item.title}: ${item.description}`);
          },
        },
      ],
      item.title
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <h3 className="text-base font-black theme-text-primary tracking-tight font-mono">
            Live Museum Activity & Milestone Feed
          </h3>
        </div>
        <span className="text-xs font-mono text-emerald-400 font-bold">● Live Log Active</span>
      </div>

      <div className="space-y-3 font-mono">
        {activityFeed.map((item) => (
          <div
            key={item.id}
            onContextMenu={(e) => handleActivityContextMenu(e, item)}
            className="p-4 rounded-3xl border text-xs flex items-center justify-between gap-4 cursor-pointer transition-all hover:translate-x-1"
            style={{
              backgroundColor: isCyber ? "rgba(10,15,36,0.6)" : "#F8FAFC",
              borderColor: isCyber ? "rgba(255,215,0,0.2)" : "#000000",
              borderWidth: isCyber ? "1px" : "2px",
              boxShadow: isCyber ? "0 0 15px rgba(255,215,0,0.05)" : "3px 3px 0 #000000",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl p-2 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                {item.type === "champion" ? "👑" : item.type === "goat" ? "💎" : item.type === "climb" ? "📈" : "⚡"}
              </span>
              <div>
                <strong className="theme-text-primary text-sm font-black block">{item.title}</strong>
                <span className="theme-text-muted text-xs leading-relaxed block">{item.description}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold theme-text-muted shrink-0 px-2.5 py-1 rounded-full bg-black/10 dark:bg-white/10">
              {item.timestamp}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
