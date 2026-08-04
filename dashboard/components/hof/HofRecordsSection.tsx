"use client";

import React from "react";
import { HallRecord } from "@/lib/utils/hofEngine";
import { useContextMenu } from "@/hooks/useContextMenu";

interface HofRecordsSectionProps {
  records: HallRecord[];
  isCyber: boolean;
}

export function HofRecordsSection({ records, isCyber }: HofRecordsSectionProps) {
  const { openContextMenu } = useContextMenu();

  const handleRecordContextMenu = (e: React.MouseEvent, record: HallRecord) => {
    e.preventDefault();
    openContextMenu(
      e,
      [
        {
          id: "rec-inspect",
          label: `Inspect Record: ${record.title}`,
          icon: "🏆",
          onClick: () => {},
        },
        {
          id: "rec-share",
          label: `Share Milestone: ${record.holderName}`,
          icon: "🔗",
          onClick: () => {
            navigator.clipboard.writeText(`${record.title}: ${record.holderName} (${record.value})`);
          },
        },
      ],
      record.title
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">🏆</span>
          <h3 className="text-base font-black theme-text-primary tracking-tight font-mono">
            Hall Achievements & Historical Records
          </h3>
        </div>
        <span className="text-xs font-mono theme-text-muted font-bold">{records.length} Active Trophy Categories</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {records.map((rec, idx) => (
          <div
            key={idx}
            onContextMenu={(e) => handleRecordContextMenu(e, rec)}
            className="p-5 rounded-3xl border font-mono space-y-2 relative overflow-hidden transition-all hover:translate-y-[-2px] cursor-pointer"
            style={{
              backgroundColor: isCyber ? "rgba(255,215,0,0.03)" : "#FEFCE8",
              borderColor: isCyber ? "rgba(255,215,0,0.25)" : "#000000",
              borderWidth: isCyber ? "1.5px" : "2.5px",
              boxShadow: isCyber ? "0 0 20px rgba(255,215,0,0.06)" : "4px 4px 0px 0px #000",
            }}
          >
            {/* Background subtle badge icon */}
            <span className="absolute -bottom-2 -right-2 text-5xl opacity-10 pointer-events-none">
              {rec.icon}
            </span>

            <div className="flex items-center justify-between">
              <span className="text-2xl">{rec.icon}</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {rec.metric}
              </span>
            </div>

            <div>
              <span className="text-[10px] theme-text-muted uppercase font-bold block">{rec.title}</span>
              <strong className="text-base font-black theme-text-primary block truncate">{rec.holderName}</strong>
            </div>

            <div className="pt-2 border-t flex items-center justify-between" style={{ borderColor: isCyber ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
              <span className="text-xs font-black text-amber-500">{rec.value}</span>
              <span className="text-[9px] theme-text-muted italic">Verified Record</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
