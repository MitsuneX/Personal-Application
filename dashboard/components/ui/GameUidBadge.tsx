"use client";

import React, { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

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

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(cleanHandle).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isSmall = size === "sm";

  // Single direct copy button (when no profileLink)
  if (!hasLink) {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className={`inline-flex items-center gap-1.5 font-mono font-bold rounded-lg transition-all active:scale-95 cursor-pointer select-none ${
          isSmall ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
        } ${className}`}
        style={{
          border: isCyber
            ? `1px solid ${copied ? "#10B981" : `${accentColor}50`}`
            : `1.5px solid ${copied ? "#10B981" : "#000000"}`,
          backgroundColor: isCyber
            ? copied
              ? "rgba(16,185,129,0.15)"
              : "rgba(255,255,255,0.05)"
            : copied
            ? "#D1FAE5"
            : "#FFFFFF",
          color: isCyber
            ? copied
              ? "#34D399"
              : "#E2E8F0"
            : copied
            ? "#065F46"
            : "#1A1A1A",
          boxShadow: isCyber
            ? copied
              ? "0 0 10px rgba(16,185,129,0.3)"
              : `0 0 8px ${accentColor}20`
            : copied
            ? "2px 2px 0 #065F46"
            : "2px 2px 0 #000000",
        }}
        title="Click to copy UID"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 text-emerald-500 shrink-0" />
            <span className="text-emerald-500 font-black">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3 opacity-60 shrink-0" />
            <span className="truncate">{cleanHandle}</span>
          </>
        )}
      </button>
    );
  }

  // Dual option badge (Link + Copy)
  return (
    <div
      className={`inline-flex items-center rounded-lg overflow-hidden border select-none transition-all ${
        isSmall ? "text-[10px]" : "text-xs"
      } ${className}`}
      style={{
        borderColor: isCyber ? `${accentColor}60` : "#000000",
        borderWidth: isCyber ? "1px" : "1.5px",
        boxShadow: isCyber ? `0 0 10px ${accentColor}25` : "2px 2px 0 #000000",
      }}
    >
      {/* Option 1: Profile Link */}
      <a
        href={profileLink!}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-mono font-bold hover:opacity-85 transition-opacity px-2 py-1 cursor-pointer truncate"
        style={{
          backgroundColor: isCyber ? `${accentColor}20` : "#FF6B35",
          color: isCyber ? "#00F5FF" : "#FFFFFF",
        }}
        title={`Visit profile link for ${cleanHandle}`}
      >
        <span className="truncate">{cleanHandle}</span>
        <ExternalLink className="w-3 h-3 shrink-0 opacity-80" />
      </a>

      {/* Divider */}
      <div
        className="w-px h-full shrink-0"
        style={{ backgroundColor: isCyber ? `${accentColor}40` : "#000000" }}
      />

      {/* Option 2: Copy UID Button */}
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1 font-mono font-bold px-2 py-1 transition-all active:scale-95 cursor-pointer shrink-0"
        style={{
          backgroundColor: isCyber
            ? copied
              ? "rgba(16,185,129,0.25)"
              : "rgba(10,15,30,0.8)"
            : copied
            ? "#D1FAE5"
            : "#FFFFFF",
          color: isCyber
            ? copied
              ? "#34D399"
              : "#CBD5E1"
            : copied
            ? "#065F46"
            : "#1A1A1A",
        }}
        title="Copy UID"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 text-emerald-500" />
            <span className="text-[9px] font-black text-emerald-500 uppercase">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3 opacity-70" />
            <span className="text-[9px] uppercase font-bold opacity-70">Copy</span>
          </>
        )}
      </button>
    </div>
  );
}
