"use client";

import React, { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { FloatingPopover } from "@/components/ui/FloatingPopover";

export interface GameUidBadgeProps {
  handle: string;
  profileLink?: string | null;
  isCyber?: boolean;
  accentColor?: string;
  size?: "sm" | "md";
  className?: string;
}

export function GameUidBadge({
  handle,
  profileLink,
  isCyber = false,
  accentColor = "#00F5FF",
  size = "md",
  className = "",
}: GameUidBadgeProps) {
  const [copied, setCopied] = useState(false);

  if (!handle || !handle.trim()) return null;

  const cleanHandle = handle.trim();
  const hasLink = Boolean(profileLink && profileLink.trim());

  const handleCopy = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(cleanHandle).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isSmall = size === "sm";

  const triggerBadge = (
    <div
      className={`inline-flex items-center gap-1 font-mono font-bold rounded-md select-none transition-all hover:scale-[1.02] active:scale-95 cursor-pointer ${
        isSmall ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      } ${className}`}
      style={{
        border: isCyber
          ? `1px solid ${copied ? "#10B981" : `${accentColor}70`}`
          : `1.5px solid ${copied ? "#10B981" : "#000000"}`,
        backgroundColor: isCyber
          ? copied
            ? "rgba(16,185,129,0.2)"
            : `${accentColor}18`
          : copied
          ? "#D1FAE5"
          : "#FFFFFF",
        color: isCyber
          ? copied
            ? "#34D399"
            : "#00F5FF"
          : copied
          ? "#065F46"
          : "#000000",
        boxShadow: isCyber
          ? copied
            ? "0 0 10px rgba(16,185,129,0.3)"
            : `0 0 10px ${accentColor}25`
          : copied
          ? "2px 2px 0 #065F46"
          : "2px 2px 0 #000000",
      }}
      title={hasLink ? `Options for ${cleanHandle}` : `Click to copy ${cleanHandle}`}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-emerald-500 shrink-0" />
          <span className="text-emerald-500 font-black">Copied!</span>
        </>
      ) : (
        <>
          <span className="truncate">{cleanHandle}</span>
          {hasLink && <span className="opacity-70 text-[9px] ml-0.5">↗</span>}
        </>
      )}
    </div>
  );

  // If no profile link, direct 1-click copy
  if (!hasLink) {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className="inline-block border-none bg-transparent p-0 cursor-pointer"
      >
        {triggerBadge}
      </button>
    );
  }

  // If profile link exists, click opens popover with 2 choices: Explore Link or Copy UID
  return (
    <FloatingPopover
      triggerMode="click"
      placement="bottom-end"
      offsetDistance={6}
      content={({ close }) => (
        <div
          className="p-1.5 rounded-xl border shadow-2xl backdrop-blur-xl flex flex-col gap-1 min-w-[170px] select-none text-xs font-mono z-[9999]"
          style={{
            backgroundColor: isCyber ? "rgba(10,15,30,0.96)" : "#FFFFFF",
            borderColor: isCyber ? `${accentColor}60` : "#000000",
            borderWidth: isCyber ? "1px" : "2px",
            boxShadow: isCyber ? `0 0 25px ${accentColor}35` : "4px 4px 0 #000000",
            color: isCyber ? "#E2E8F0" : "#000000",
          }}
        >
          {/* Option 1: Explore Profile Link */}
          <a
            href={profileLink!}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => close()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-bold transition-all hover:bg-cyan-500/15 cursor-pointer"
            style={{ color: isCyber ? "#00F5FF" : "#1A1A1A" }}
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-80" />
            <span>Explore Profile Link</span>
          </a>

          {/* Option 2: Copy UID */}
          <button
            type="button"
            onClick={(e) => {
              handleCopy(e);
              close();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-bold transition-all hover:bg-emerald-500/15 text-left cursor-pointer border-t"
            style={{
              color: isCyber ? "#34D399" : "#065F46",
              borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#F3F4F6",
            }}
          >
            <Copy className="w-3.5 h-3.5 shrink-0 opacity-80" />
            <span>Copy UID ({cleanHandle})</span>
          </button>
        </div>
      )}
    >
      {triggerBadge}
    </FloatingPopover>
  );
}
