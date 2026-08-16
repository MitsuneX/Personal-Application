"use client";

import React from "react";
import { motion } from "framer-motion";
import { ProfileData } from "@/lib/store/dashboardStore";
import { User, MapPin, Code, Link2, Globe } from "lucide-react";

interface LandingAboutProps {
  profile: ProfileData;
  isCyber: boolean;
  accentColor?: string;
}

export function LandingAbout({ profile, isCyber, accentColor = "#00F5FF" }: LandingAboutProps) {
  const hasAbout = Boolean(profile.showAboutSection);
  const hasSocials = Boolean(profile.showSocialLinks && profile.socials && profile.socials.length > 0);

  // If neither about nor socials are toggled ON, do NOT render anything (opt-in privacy default)
  if (!hasAbout && !hasSocials) return null;

  const aboutText = profile.aboutWorldText?.trim() || profile.bio?.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-6 sm:p-8 rounded-3xl border mb-12 space-y-6 select-none"
      style={{
        backgroundColor: isCyber ? "rgba(10,15,36,0.6)" : "#FFFFFF",
        borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000000",
        borderWidth: isCyber ? "1px" : "2.5px",
        boxShadow: isCyber ? "0 0 25px rgba(0,245,255,0.05)" : "5px 5px 0 #000000",
      }}
    >
      <div className="flex items-center gap-2 pb-3 border-b border-black/10 dark:border-white/10">
        <User size={20} style={{ color: isCyber ? accentColor : "#000000" }} />
        <h2
          className="text-lg font-black tracking-wide"
          style={{
            color: isCyber ? "#E0E8FF" : "#000000",
            fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
          }}
        >
          {hasAbout ? "About This Digital Sanctuary" : "Public Identity & Social Links"}
        </h2>
      </div>

      {hasAbout && aboutText && (
        <p className="text-sm font-mono leading-relaxed opacity-90">
          {aboutText}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 font-mono text-xs">
        {/* Skills & Tech (Rendered if About is enabled) */}
        {hasAbout && profile.skills && profile.skills.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-black uppercase tracking-wider flex items-center gap-1.5 opacity-70">
              <Code size={14} />
              <span>Core Tech & Interests</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-lg border font-bold uppercase"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "#FFF3E0",
                    borderColor: isCyber ? `${accentColor}40` : "#000000",
                    color: isCyber ? accentColor : "#000000",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Location & Social Links */}
        <div className="space-y-3">
          {hasAbout && profile.location && (
            <div className="flex items-center gap-2 font-bold">
              <MapPin size={14} className="text-emerald-400 shrink-0" />
              <span>{profile.location}</span>
            </div>
          )}

          {hasSocials && (
            <div className="space-y-2 pt-1">
              <h4 className="font-black uppercase tracking-wider flex items-center gap-1.5 opacity-70">
                <Link2 size={14} />
                <span>Public Identity Links</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {profile.socials.map((soc) => (
                  <a
                    key={soc.platform}
                    href={soc.url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl border font-bold hover:scale-105 transition-all inline-flex items-center gap-1.5 shadow-sm"
                    style={{
                      backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "#FFFFFF",
                      borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
                      color: isCyber ? "#E0E8FF" : "#000000",
                      boxShadow: isCyber ? "none" : "2px 2px 0 #000000",
                    }}
                  >
                    <Globe size={12} className="opacity-70" />
                    <span>{soc.platform}:</span>
                    <span className="text-cyan-400 font-mono font-black">{soc.handle}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
