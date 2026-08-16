"use client";

import React, { useState } from "react";
import { ProfileData } from "@/lib/store/dashboardStore";
import { LandingView } from "./LandingView";
import { useTheme } from "@/lib/theme";
import { Eye, X, Moon, Sun } from "lucide-react";

interface LandingPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  draftProfile: ProfileData;
}

export function LandingPreviewModal({
  isOpen,
  onClose,
  draftProfile,
}: LandingPreviewModalProps) {
  const { theme } = useTheme();
  const [previewTheme, setPreviewTheme] = useState<"cyber" | "brutal">(theme === "brutal" ? "brutal" : "cyber");

  if (!isOpen) return null;

  const isCyber = previewTheme === "cyber";

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center">
      {/* Top Floating Preview Control Bar */}
      <div
        className="w-full max-w-6xl p-3 mb-4 rounded-2xl border flex items-center justify-between gap-4 font-mono select-none sticky top-2 z-50 backdrop-blur-xl shadow-2xl"
        style={{
          backgroundColor: isCyber ? "rgba(5,8,22,0.95)" : "#FFFDF0",
          borderColor: isCyber ? "rgba(0,245,255,0.4)" : "#000000",
          borderWidth: isCyber ? "1px" : "3px",
          color: isCyber ? "#00F5FF" : "#000000",
          boxShadow: isCyber ? "0 0 30px rgba(0,245,255,0.25)" : "4px 4px 0 #000000",
        }}
      >
        <div className="flex items-center gap-2">
          <Eye size={18} className="animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider">
            👁️ LIVE DRAFT LANDING PREVIEW (UNSAVED CHANGES)
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle in Preview */}
          <button
            onClick={() => setPreviewTheme(isCyber ? "brutal" : "cyber")}
            className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer border flex items-center gap-1.5"
            style={{
              backgroundColor: isCyber ? "rgba(0,245,255,0.12)" : "#FFE600",
              borderColor: isCyber ? "#00F5FF" : "#000000",
              color: isCyber ? "#00F5FF" : "#000000",
            }}
          >
            {isCyber ? <Sun size={14} /> : <Moon size={14} />}
            <span>Mode: {isCyber ? "Cyberpunk" : "Neo-Brutalism"}</span>
          </button>

          {/* Close Modal */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-xs font-black cursor-pointer hover:bg-black/10 dark:hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Preview Container — Uses Canonical LandingView Renderer */}
      <div
        className="w-full max-w-6xl rounded-3xl border shadow-2xl overflow-hidden"
        style={{
          backgroundColor: isCyber ? "#050816" : "#FFFDF0",
          borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
          borderWidth: isCyber ? "1px" : "3px",
        }}
      >
        <LandingView
          profile={draftProfile}
          isCyber={isCyber}
          isLoggedIn={true}
          displayName={draftProfile.name || "Explorer"}
          stats={{ gamesCount: 12, charactersCount: 28, musicCount: 145, mediaCount: 42, hallCount: 18 }}
          onEnterDashboard={() => {
            alert("Preview Mode: This button routes directly to your Dashboard when logged in.");
          }}
          onThemeToggle={() => setPreviewTheme(isCyber ? "brutal" : "cyber")}
          isPreview={true}
        />
      </div>
    </div>
  );
}
