"use client";

import React from "react";
import { motion } from "framer-motion";

interface LoadingGraphicProps {
  isCyber: boolean;
}

export function LoadingGraphic({ isCyber }: LoadingGraphicProps) {
  if (isCyber) {
    return <CyberLoadingGraphic />;
  }
  return <BrutalLoadingGraphic />;
}

// ─── Neo-Brutalism Graphic ───────────────────────────────────────────────────

function BrutalLoadingGraphic() {
  return (
    <div className="relative w-36 h-36 sm:w-48 sm:h-48 flex items-center justify-center mb-4">
      {/* Outer hard shadow backdrop square */}
      <motion.div
        className="absolute w-28 h-28 sm:w-36 sm:h-36 bg-[#FFD700] border-[3.5px] border-black"
        style={{ boxShadow: "6px 6px 0px #000000" }}
        animate={{
          rotate: [0, 90, 180, 270, 360],
          scale: [1, 1.05, 1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Inner offset contrast diamond */}
      <motion.div
        className="absolute w-20 h-20 sm:w-24 sm:h-24 bg-[#FF6B35] border-[3px] border-black"
        style={{ boxShadow: "4px 4px 0px #000000" }}
        animate={{
          rotate: [45, -45, 45],
          borderRadius: ["0%", "20%", "0%"],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Center sharp spinning block */}
      <motion.div
        className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white border-[3px] border-black flex items-center justify-center font-mono font-black text-black text-xs sm:text-sm"
        style={{ boxShadow: "3px 3px 0px #000000" }}
        animate={{
          scale: [0.9, 1.15, 0.9],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.div
          className="w-3 h-3 bg-black"
          animate={{
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>

      {/* Orbiting brutal corner blocks */}
      {[0, 90, 180, 270].map((angle, i) => (
        <motion.div
          key={i}
          className="absolute w-3.5 h-3.5 bg-black border border-white"
          animate={{
            x: [
              Math.cos((angle * Math.PI) / 180) * 48,
              Math.cos(((angle + 360) * Math.PI) / 180) * 48,
            ],
            y: [
              Math.sin((angle * Math.PI) / 180) * 48,
              Math.sin(((angle + 360) * Math.PI) / 180) * 48,
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

// ─── Cyberpunk Sci-Fi HUD Graphic ─────────────────────────────────────────────

function CyberLoadingGraphic() {
  return (
    <div className="relative w-40 h-40 sm:w-52 sm:h-52 flex items-center justify-center mb-4">
      {/* Outer cyan dashed HUD spinner */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-dashed border-[#00F5FF]/70"
        style={{
          boxShadow: "0 0 15px rgba(0, 245, 255, 0.3), inset 0 0 15px rgba(0, 245, 255, 0.2)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />

      {/* Middle magenta dotted HUD spinner */}
      <motion.div
        className="absolute inset-3 rounded-full border-2 border-dotted border-[#BF5FFF]/80"
        style={{
          boxShadow: "0 0 12px rgba(191, 95, 255, 0.4)",
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      {/* Inner cyan tech ring with notched accents */}
      <motion.div
        className="absolute inset-7 rounded-full border border-[#00F5FF]/50 flex items-center justify-center"
        animate={{
          scale: [0.95, 1.05, 0.95],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-full h-full rounded-full border-t-2 border-b-2 border-[#00F5FF]" />
      </motion.div>

      {/* Center glowing Sci-Fi Core */}
      <motion.div
        className="relative z-10 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#00F5FF] via-[#BF5FFF] to-[#00F5FF] flex items-center justify-center"
        style={{
          boxShadow: "0 0 25px rgba(0, 245, 255, 0.8), 0 0 45px rgba(191, 95, 255, 0.6)",
        }}
        animate={{
          scale: [0.85, 1.1, 0.85],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-[#050816] border border-[#00F5FF] flex items-center justify-center">
          <motion.div
            className="w-2 h-2 rounded-full bg-[#00F5FF]"
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.8, 1.4, 0.8],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </motion.div>

      {/* Radar sweep beam */}
      <motion.div
        className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-1/2 h-1/2 bg-gradient-to-br from-[#00F5FF]/40 to-transparent origin-bottom-right" />
      </motion.div>

      {/* Corner HUD crosshair brackets */}
      <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[#00F5FF]" />
      <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-[#00F5FF]" />
      <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-[#00F5FF]" />
      <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[#00F5FF]" />
    </div>
  );
}
