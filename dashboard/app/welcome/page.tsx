"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { useTheme } from "@/lib/theme";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingWorldStatus } from "@/components/landing/LandingWorldStatus";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingAbout } from "@/components/landing/LandingAbout";
import { Sun, Moon, LogIn, Compass, Sparkles } from "lucide-react";
import Link from "next/link";

export default function WelcomePage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const isCyber = theme === "cyber";

  const { profile, games, animeList, dramas, dramaLog, hallOfFame } = useDashboardStore();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const isGuest = document.cookie.includes("is_guest=true");
    const hasAuthCookie = document.cookie.includes("auth-token");
    setIsLoggedIn(isGuest || hasAuthCookie);
  }, []);

  const totalDramas = dramas.length + dramaLog.length;
  const totalMedia = animeList.length + totalDramas;
  const stats = {
    gamesCount: games.length,
    charactersCount: games.filter((g) => Boolean(g.mainCharacter)).length,
    musicCount: 120, // Sample count for public stats if enabled
    mediaCount: totalMedia,
    hallCount: hallOfFame.length,
  };

  const handleEnterDashboard = () => {
    router.push("/");
  };

  return (
    <div
      className="min-h-screen w-full transition-colors duration-300 font-sans p-4 sm:p-6 md:p-10 select-none overflow-x-hidden"
      style={{
        backgroundColor: isCyber ? "#050816" : "#FFFDF0",
        color: isCyber ? "#E0E8FF" : "#1A1A1A",
      }}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header Bar */}
        <header
          className="w-full p-4 rounded-2xl border flex items-center justify-between gap-4 font-mono shadow-lg backdrop-blur-xl"
          style={{
            backgroundColor: isCyber ? "rgba(10,15,36,0.7)" : "#FFFFFF",
            borderColor: isCyber ? "rgba(0,245,255,0.25)" : "#000000",
            borderWidth: isCyber ? "1px" : "2.5px",
            boxShadow: isCyber ? "0 0 20px rgba(0,245,255,0.08)" : "4px 4px 0 #000000",
          }}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-cyan-400 animate-spin-slow" />
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: isCyber ? "#00F5FF" : "#000000" }}>
              {profile.dashboardName || `${profile.name || "Personal"}'s World`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(isCyber ? "brutal" : "cyber")}
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

            {/* Quick Auth Link */}
            {isLoggedIn ? (
              <button
                onClick={handleEnterDashboard}
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
            ) : (
              <Link href="/login">
                <button
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
                </button>
              </Link>
            )}
          </div>
        </header>

        {/* 1. Cinematic Hero */}
        <LandingHero
          profile={profile}
          isCyber={isCyber}
          isLoggedIn={isLoggedIn}
          heroStyle={profile.heroStyle || "cinematic"}
          onEnterDashboard={handleEnterDashboard}
        />

        {/* 2. World Status Summary Bar */}
        <LandingWorldStatus
          isCyber={isCyber}
          showPublicStats={Boolean(profile.showPublicStats)}
          stats={stats}
          accentColor={profile.landingAccentColor}
        />

        {/* 3. Feature Modules Showcase */}
        <LandingFeatures
          isCyber={isCyber}
          visibleFeatures={profile.visibleFeatures}
          accentColor={profile.landingAccentColor}
        />

        {/* 4. About This World (Opt-in only!) */}
        <LandingAbout
          profile={profile}
          isCyber={isCyber}
          accentColor={profile.landingAccentColor}
        />

        {/* Footer */}
        <footer className="pt-8 pb-12 border-t text-center font-mono text-xs opacity-60 flex flex-col items-center gap-2"
          style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#000000" }}
        >
          <p>© {new Date().getFullYear()} {profile.dashboardName || `${profile.name || "Personal"}'s World`}. All rights reserved.</p>
          <p className="text-[10px]">Powered by Nexus Xenon Personal Dashboard Engine · Dual-Theme Cyber/Brutal System</p>
        </footer>
      </div>
    </div>
  );
}
