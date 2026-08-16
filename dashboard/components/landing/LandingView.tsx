"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileData } from "@/lib/store/dashboardStore";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingWorldStatus } from "@/components/landing/LandingWorldStatus";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingAbout } from "@/components/landing/LandingAbout";
import { Sun, Moon, LogIn, Sparkles, ArrowUp, ExternalLink } from "lucide-react";
import Link from "next/link";

export interface LandingViewProps {
  profile: ProfileData;
  isCyber: boolean;
  isLoggedIn?: boolean;
  displayName?: string;
  stats?: {
    gamesCount?: number;
    charactersCount?: number;
    musicCount?: number;
    mediaCount?: number;
    hallCount?: number;
  };
  onEnterDashboard?: () => void;
  onGuestLogin?: () => void;
  onThemeToggle?: () => void;
  isPreview?: boolean;
}

export function LandingView({
  profile,
  isCyber,
  isLoggedIn = false,
  displayName = "",
  stats = {},
  onEnterDashboard,
  onGuestLogin,
  onThemeToggle,
  isPreview = false,
}: LandingViewProps) {
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Monitor window scroll position for floating Back to Top button
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ── Canonical Title & Identity Precedence ─────────────────────────────────────
  // If Personal World Name is configured, use it consistently everywhere.
  // Otherwise, default to personalized greeting when logged in, or universal digital sanctuary when logged out.
  const hasCustomWorldName = Boolean(profile.dashboardName?.trim());
  const customWorldName = profile.dashboardName?.trim();

  const headerTitle = hasCustomWorldName
    ? customWorldName
    : (isLoggedIn && displayName ? `${displayName}'s World` : "Personal Digital Sanctuary");

  const accentColor = profile.landingAccentColor || (isCyber ? "#00F5FF" : "#FF6B35");

  return (
    <div
      className="min-h-screen w-full transition-colors duration-300 font-sans p-4 sm:p-6 md:p-10 relative"
      style={{
        backgroundColor: isCyber ? "#050816" : "#FFFDF0",
        color: isCyber ? "#E0E8FF" : "#1A1A1A",
      }}
    >
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
        {/* Top Header Bar */}
        <header
          className="w-full p-4 rounded-2xl border flex items-center justify-between gap-4 font-mono shadow-lg backdrop-blur-xl sticky top-4 z-40"
          style={{
            backgroundColor: isCyber ? "rgba(10,15,36,0.75)" : "#FFFFFF",
            borderColor: isCyber ? "rgba(0,245,255,0.25)" : "#000000",
            borderWidth: isCyber ? "1px" : "2.5px",
            boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.08)" : "4px 4px 0 #000000",
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles size={18} className="text-cyan-400 animate-spin-slow shrink-0" />
            <span
              className="text-xs font-black uppercase tracking-widest truncate"
              style={{ color: isCyber ? "#00F5FF" : "#000000" }}
            >
              {headerTitle}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Theme Toggle */}
            {onThemeToggle && (
              <button
                onClick={onThemeToggle}
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider cursor-pointer border flex items-center gap-1.5 transition-all hover:scale-105"
                style={{
                  backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#FFE600",
                  borderColor: isCyber ? "rgba(0,245,255,0.4)" : "#000000",
                  color: isCyber ? "#00F5FF" : "#000000",
                  boxShadow: isCyber ? "0 0 10px rgba(0,245,255,0.2)" : "2px 2px 0 #000000",
                }}
              >
                {isCyber ? <Sun size={14} /> : <Moon size={14} />}
                <span className="hidden sm:inline">{isCyber ? "Cyber" : "Brutal"}</span>
              </button>
            )}

            {/* Quick Auth / Dashboard Link */}
            {isLoggedIn ? (
              <button
                onClick={onEnterDashboard}
                className="px-4 py-1.5 rounded-lg text-xs font-mono font-black uppercase tracking-wider cursor-pointer border transition-all hover:scale-105"
                style={{
                  backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
                  color: isCyber ? "#050816" : "#FFFFFF",
                  borderColor: isCyber ? "#00F5FF" : "#000000",
                  boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.3)" : "2px 2px 0 #000000",
                }}
              >
                Dashboard →
              </button>
            ) : isPreview ? (
              <span
                className="px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border opacity-70"
                style={{
                  borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
                  color: isCyber ? "#00F5FF" : "#000000",
                }}
              >
                Draft Preview
              </span>
            ) : (
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-lg text-xs font-mono font-black uppercase tracking-wider cursor-pointer border flex items-center gap-1.5 transition-all hover:scale-105"
                style={{
                  backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#FFE600",
                  borderColor: isCyber ? "#00F5FF" : "#000000",
                  color: isCyber ? "#00F5FF" : "#000000",
                  boxShadow: isCyber ? "0 0 12px rgba(0,245,255,0.2)" : "2px 2px 0 #000000",
                }}
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </header>

        {/* 1. Cinematic Hero */}
        <LandingHero
          profile={profile}
          isCyber={isCyber}
          isLoggedIn={isLoggedIn}
          displayName={displayName}
          heroStyle={profile.heroStyle || "cinematic"}
          onEnterDashboard={onEnterDashboard}
          onGuestLogin={onGuestLogin}
        />

        {/* 2. World Status Summary Bar */}
        <LandingWorldStatus
          isCyber={isCyber}
          showPublicStats={Boolean(profile.showPublicStats)}
          stats={stats}
          accentColor={accentColor}
        />

        {/* 3. Feature Showcase Allowlist Modules */}
        <LandingFeatures
          isCyber={isCyber}
          visibleFeatures={profile.visibleFeatures}
          accentColor={accentColor}
        />

        {/* 4. Optional About / Identity Bio */}
        <LandingAbout
          profile={profile}
          isCyber={isCyber}
          accentColor={accentColor}
        />

        {/* Footer */}
        <footer className="pt-4 pb-12 text-center font-mono text-xs opacity-50 select-none">
          <p>Nexus Xenon Personal Digital Sanctuary · Next.js & Framer Motion Engine</p>
        </footer>
      </div>

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            aria-label="Back to Top"
            className="fixed bottom-6 right-6 z-50 p-3 rounded-2xl border font-mono font-black shadow-2xl flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
            style={{
              backgroundColor: isCyber ? "rgba(10,15,36,0.9)" : "#FFE600",
              borderColor: isCyber ? "#00F5FF" : "#000000",
              color: isCyber ? "#00F5FF" : "#000000",
              borderWidth: isCyber ? "1.5px" : "2.5px",
              boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.4)" : "4px 4px 0 #000000",
            }}
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
