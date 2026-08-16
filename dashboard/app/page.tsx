"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { useTheme } from "@/lib/theme";
import { LandingView } from "@/components/landing/LandingView";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function RootLandingPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const isCyber = theme === "cyber";
  const { user } = useAuth();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { profile, games, animeList, dramas, dramaLog, hallOfFame } = useDashboardStore();

  const isLoggedIn = Boolean(user);
  const displayName = mounted
    ? (profile.name || (user?.user_metadata?.full_name as string) || (user?.user_metadata?.name as string) || "")
    : "";

  const totalDramas = dramas.length + dramaLog.length;
  const totalMedia = animeList.length + totalDramas;
  const stats = {
    gamesCount: games.length,
    charactersCount: games.filter((g) => Boolean(g.mainCharacter)).length,
    musicCount: 120,
    mediaCount: totalMedia,
    hallCount: hallOfFame.length,
  };

  const handleEnterDashboard = () => {
    router.push("/dashboard");
  };

  const handleGuestLogin = () => {
    if (typeof window !== "undefined") {
      document.cookie = "is_guest=true; path=/; max-age=86400; SameSite=Lax";
      localStorage.setItem("is_guest", "true");
    }
    router.push("/dashboard");
  };

  const handleThemeToggle = () => {
    setTheme(isCyber ? "brutal" : "cyber");
  };

  return (
    <LandingView
      profile={profile}
      isCyber={isCyber}
      isLoggedIn={isLoggedIn}
      displayName={displayName}
      stats={stats}
      onEnterDashboard={handleEnterDashboard}
      onGuestLogin={handleGuestLogin}
      onThemeToggle={handleThemeToggle}
    />
  );
}
