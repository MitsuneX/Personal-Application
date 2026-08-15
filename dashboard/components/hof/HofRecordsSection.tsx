"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { HallRecord, computeHallRecords } from "@/lib/utils/hofEngine";
import { HallOfFameEntry } from "@/lib/store/dashboardStore";
import { useContextMenu } from "@/hooks/useContextMenu";

interface HofRecordsSectionProps {
  records?: HallRecord[];
  hallList?: HallOfFameEntry[];
  championshipHistory?: any[];
  hallEvents?: any[];
  gameCharacters?: any[];
  games?: any[];
  isCyber: boolean;
  /** The raw category key from the master Museum Showcase filter (e.g. "all", "game", "actor") */
  activeCategoryFilter?: string;
  activeCategoryLabel?: string;
}

export function HofRecordsSection({
  records: initialRecords,
  hallList = [],
  championshipHistory = [],
  hallEvents = [],
  gameCharacters = [],
  games = [],
  isCyber,
  activeCategoryFilter = "all",
  activeCategoryLabel = "Overall Showcase",
}: HofRecordsSectionProps) {
  const { openContextMenu } = useContextMenu();

  // Prepare combined list including game characters for the 'game' category
  const combinedList = useMemo(() => {
    if (hallList.length === 0 && gameCharacters.length === 0) return [];
    const gameEntries: HallOfFameEntry[] = gameCharacters.map((gc) => ({
      ...gc,
      id: `gc-${gc.id}`,
      name: gc.name,
      type: "game character" as any,
      status: "Completed" as any,
      knownFor: [gc.gameName || "Game Character", gc.role || "", gc.element || ""].filter(Boolean),
      nationality: gc.nation || gc.gameName || "Game",
      singerType: gc.gameName || undefined,
      note: gc.notes || undefined,
      avatarUrl: gc.avatarUrl || (gc as any).portraitUrl || undefined,
      imageUrl: gc.cardImage || gc.avatarUrl || gc.splashArt || undefined,
      portraitUrl: (gc as any).portraitUrl || undefined,
      rank: gc.rank || null,
      likes: gc.likes || 0,
      isChampion: false,
      isFavorite: gc.isFavorite,
      badges: gc.isFeatured ? ["⭐ FEATURED"] : [],
      gameName: gc.gameName,
      isFeatured: gc.isFeatured,
      isGameCharacterEntry: true,
      stats: gc.stats,
      cropData: (gc.stats as any)?.cropData || (gc as any).cropData,
      videoFraming: (gc.stats as any)?.videoFraming || (gc as any).videoFraming,
      posterFraming: (gc.stats as any)?.cropData?.posterFraming || (gc as any).posterFraming,
      details: (gc as any).details || gc.stats,
    }));

    const normalizedHall = hallList.map((h) => ({
      ...h,
      avatarUrl:
        h.avatarUrl ||
        (h.details as any)?.avatarUrl ||
        (h.details as any)?.profileAvatarUrl ||
        (h.details as any)?.avatar ||
        (h as any).stats?.avatarUrl ||
        undefined,
    }));

    return [...normalizedHall, ...gameEntries];
  }, [hallList, gameCharacters]);

  // Compute records dynamically using the master page-level category filter
  const computedRecords = useMemo(() => {
    if (combinedList.length > 0) {
      return computeHallRecords(
        combinedList,
        championshipHistory,
        hallEvents,
        activeCategoryFilter
      );
    }
    return initialRecords || [];
  }, [combinedList, championshipHistory, hallEvents, activeCategoryFilter, initialRecords]);

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
    <div className="space-y-4 font-mono">
      {/* Header & Meta */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3"
        style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🏆</span>
          <h3 className="text-base font-black theme-text-primary tracking-tight">
            Hall Achievements &amp; Historical Records
          </h3>
        </div>
        <span className="text-xs theme-text-muted font-bold">
          {computedRecords.length} Active Records • {activeCategoryLabel}
        </span>
      </div>

      {/* Records Grid */}
      {computedRecords.length === 0 ? (
        <div
          className="p-8 rounded-2xl border text-center text-xs opacity-60"
          style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}
        >
          No achievement records match the current category selection.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {computedRecords.map((rec, idx) => (
            <div
              key={`${rec.title}-${rec.holderName}-${idx}`}
              onContextMenu={(e) => handleRecordContextMenu(e, rec)}
              className="p-5 rounded-3xl border space-y-2 relative overflow-hidden transition-all hover:translate-y-[-2px] cursor-pointer"
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
                <div className="flex items-center gap-2 mt-0.5">
                  {rec.holderImage && (
                    <div className="w-5 h-5 rounded-md overflow-hidden relative shrink-0 border border-amber-400/40">
                      <Image
                        src={rec.holderImage}
                        alt={rec.holderName}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <strong className="text-sm font-black theme-text-primary block truncate">
                    {rec.holderName}
                  </strong>
                </div>
              </div>

              <div
                className="pt-2 border-t flex items-center justify-between"
                style={{ borderColor: isCyber ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}
              >
                <span className="text-xs font-black text-amber-500">{rec.value}</span>
                <span className="text-[9px] theme-text-muted italic">Verified Record</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
