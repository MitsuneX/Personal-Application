"use client";

import React from "react";
import { motion } from "framer-motion";
import { ProfileData } from "@/lib/store/dashboardStore";
import { Sparkles, Terminal, Compass, UserCheck } from "lucide-react";
import Link from "next/link";

interface LandingHeroProps {
  profile: ProfileData;
  isCyber: boolean;
  isLoggedIn?: boolean;
  displayName?: string;
  heroStyle?: "cinematic" | "minimal" | "ambient" | "custom";
  onEnterDashboard?: () => void;
  onGuestLogin?: () => void;
}

export function LandingHero({
  profile,
  isCyber,
  isLoggedIn = false,
  displayName,
  heroStyle = "cinematic",
  onEnterDashboard,
  onGuestLogin,
}: LandingHeroProps) {
  // Personalized or Universal World Title
  const defaultTitle = isLoggedIn
    ? (displayName ? `Welcome, ${displayName}` : "Welcome to Your Personal World")
    : "Welcome to Your Personal World";
  const worldName = profile.dashboardName?.trim() || defaultTitle;
  const accentColor = profile.landingAccentColor || (isCyber ? "#00F5FF" : "#FF6B35");

  const handleExploreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window === "undefined") return;
    const el = document.getElementById("explore");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl p-6 sm:p-10 md:p-14 mb-8">
      {/* Background Atmosphere */}
      {heroStyle === "cinematic" && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {isCyber ? (
            <>
              {/* Matrix Neon Ambient Glow */}
              <div
                className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[100px] opacity-40 animate-pulse"
                style={{ backgroundColor: accentColor }}
              />
              <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[100px] opacity-30 bg-purple-600" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950/80 to-slate-950" />
              {/* Grid Lines */}
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage: `linear-gradient(${accentColor} 1px, transparent 1px), linear-gradient(90deg, ${accentColor} 1px, transparent 1px)`,
                  backgroundSize: "40px 40px",
                }}
              />
            </>
          ) : (
            <div className="absolute inset-0 bg-[#FFFDF5] border-4 border-black" />
          )}
        </div>
      )}

      {heroStyle === "ambient" && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <div
            className="w-full h-full opacity-20"
            style={{
              background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
            }}
          />
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
        {/* Text & Identity Section */}
        <div className="flex-1 text-center md:text-left space-y-4 max-w-2xl">
          {/* Official Master Application Logo */}
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-12 h-12 rounded-2xl overflow-hidden border shadow-lg relative shrink-0"
              style={{
                borderColor: isCyber ? accentColor : "#000000",
                borderWidth: isCyber ? "1.5px" : "2.5px",
                boxShadow: isCyber ? `0 0 20px ${accentColor}40` : "3px 3px 0 #000000",
              }}
            >
              <img
                src="/branding/master-logo.jpg"
                alt="NX Nexus Xenon Master Logo"
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest uppercase border backdrop-blur-md"
              style={{
                backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "#FFE600",
                borderColor: isCyber ? `${accentColor}40` : "#000000",
                color: isCyber ? accentColor : "#000000",
                boxShadow: isCyber ? `0 0 15px ${accentColor}20` : "2px 2px 0 #000000",
              }}
            >
              <Sparkles size={13} className="animate-spin-slow" />
              <span>PERSONAL DIGITAL SANCTUARY</span>
            </div>
          </div>

          {/* World Name Title */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight"
            style={{
              color: isCyber ? "#E0E8FF" : "#000000",
              fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
              textShadow: isCyber ? `0 0 30px ${accentColor}40` : "none",
            }}
          >
            {worldName}
          </h1>

          {/* Tagline */}
          <p
            className="text-base sm:text-lg font-semibold leading-relaxed opacity-90 font-mono"
            style={{ color: isCyber ? "#94A3B8" : "#334155" }}
          >
            {profile.tagline || "Building next-gen web experiences, tracking media, gaming & personal archives."}
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-wrap items-center justify-center md:justify-start gap-4">
            {isLoggedIn ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onEnterDashboard}
                className="px-6 py-3.5 rounded-2xl text-sm font-black uppercase tracking-wider font-mono flex items-center gap-2.5 cursor-pointer border shadow-xl"
                style={{
                  backgroundColor: isCyber ? accentColor : "#FF6B35",
                  color: isCyber ? "#050816" : "#FFFFFF",
                  borderColor: isCyber ? accentColor : "#000000",
                  borderWidth: isCyber ? "1px" : "3px",
                  boxShadow: isCyber ? `0 0 25px ${accentColor}50` : "4px 4px 0 #000000",
                }}
              >
                <UserCheck size={18} />
                <span>Continue to Dashboard →</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onGuestLogin}
                className="px-6 py-3.5 rounded-2xl text-sm font-black uppercase tracking-wider font-mono flex items-center gap-2.5 cursor-pointer border shadow-xl"
                style={{
                  backgroundColor: isCyber ? accentColor : "#FFE600",
                  color: isCyber ? "#050816" : "#000000",
                  borderColor: isCyber ? accentColor : "#000000",
                  borderWidth: isCyber ? "1px" : "3px",
                  boxShadow: isCyber ? `0 0 25px ${accentColor}50` : "4px 4px 0 #000000",
                }}
              >
                <Terminal size={18} />
                <span>Continue as Guest →</span>
              </motion.button>
            )}

            <button
              onClick={handleExploreClick}
              className="px-5 py-3.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer border backdrop-blur-md opacity-80 hover:opacity-100 transition-opacity"
              style={{
                backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#FFFFFF",
                borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000000",
                color: isCyber ? "#E0E8FF" : "#000000",
                borderWidth: isCyber ? "1px" : "2px",
                boxShadow: isCyber ? "none" : "3px 3px 0 #000000",
              }}
            >
              <Compass size={15} />
              <span>Explore the Archive ↓</span>
            </button>
          </div>
        </div>

        {/* Avatar & Profile Card Presentation */}
        <div className="shrink-0 relative group">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden relative border-2 p-1.5 shadow-2xl"
            style={{
              backgroundColor: isCyber ? "rgba(10,15,36,0.8)" : "#FFFFFF",
              borderColor: isCyber ? accentColor : "#000000",
              boxShadow: isCyber ? `0 0 35px ${accentColor}40` : "6px 6px 0 #000000",
            }}
          >
            <img
              src={profile.avatar || "/avatar.png"}
              alt={profile.name}
              className="w-full h-full object-cover rounded-2xl"
            />
            {/* Status indicator */}
            <div
              className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider border flex items-center gap-1.5 backdrop-blur-md"
              style={{
                backgroundColor: isCyber ? "rgba(5,8,22,0.9)" : "#FFFDF0",
                borderColor: isCyber ? accentColor : "#000000",
                color: isCyber ? accentColor : "#000000",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{(profile.status || "online").toUpperCase()}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
