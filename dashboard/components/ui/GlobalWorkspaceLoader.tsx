"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { RefreshCw, AlertTriangle } from "lucide-react";

export function GlobalWorkspaceLoader({ forceShow }: { forceShow?: boolean } = {}) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const { isHydrated, isLoading, fetchError, fetchDashboard } = useDashboardStore();

  // Reveal dashboard ONLY when workspace data is completely hydrated and not fetching initial load
  const isVisible = forceShow || !isHydrated || (isLoading && !isHydrated);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="global-workspace-loader"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center p-4 select-none overflow-hidden"
          style={{
            backgroundColor: isCyber ? "#050816" : "#FFFDF0",
            color: isCyber ? "#E0E8FF" : "#000000",
          }}
        >
          {/* Cyber background effects */}
          {isCyber ? (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div
                className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[100px] opacity-30 animate-pulse"
                style={{ backgroundColor: "#00F5FF" }}
              />
              <div
                className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[120px] opacity-25"
                style={{ backgroundColor: "#BF5FFF" }}
              />
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(0,245,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.4) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
            </div>
          ) : (
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
          )}

          {/* Loader Card Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative z-10 w-full max-w-sm p-6 sm:p-8 rounded-3xl flex flex-col items-center text-center backdrop-blur-xl"
            style={{
              backgroundColor: isCyber ? "rgba(10,15,36,0.85)" : "#FFFFFF",
              borderColor: isCyber ? "rgba(0,245,255,0.35)" : "#000000",
              borderWidth: isCyber ? "1px" : "3px",
              boxShadow: isCyber
                ? "0 0 40px rgba(0,245,255,0.15), inset 0 0 30px rgba(0,245,255,0.05)"
                : "6px 6px 0 #000000",
            }}
          >
            {/* Theme Logo Asset */}
            <div className="relative mb-5 group">
              <motion.div
                animate={{
                  boxShadow: isCyber
                    ? [
                        "0 0 20px rgba(0,245,255,0.3)",
                        "0 0 35px rgba(0,245,255,0.6)",
                        "0 0 20px rgba(0,245,255,0.3)",
                      ]
                    : "4px 4px 0 #000000",
                  scale: isCyber ? [1, 1.03, 1] : [1, 1.02, 1],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden p-1 relative border flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: isCyber ? "#050816" : "#FFFDF0",
                  borderColor: isCyber ? "#00F5FF" : "#000000",
                  borderWidth: isCyber ? "1.5px" : "3px",
                }}
              >
                <img
                  src={isCyber ? "/branding/cyber-logo.jpg" : "/branding/brutal-logo.jpg"}
                  alt={isCyber ? "N Nexus (Cyberpunk)" : "X Xenon (Neo-Brutalism)"}
                  className="w-full h-full object-cover rounded-xl"
                />
              </motion.div>
            </div>

            {fetchError ? (
              /* Error / Retry State */
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-rose-500 font-bold text-xs font-mono">
                  <AlertTriangle size={16} />
                  <span>WORKSPACE_FETCH_ERROR</span>
                </div>
                <p className="text-xs opacity-75 font-mono">
                  {fetchError || "Failed to load workspace data."}
                </p>
                <button
                  onClick={() => fetchDashboard()}
                  className="mt-2 px-5 py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 border"
                  style={{
                    backgroundColor: isCyber ? "#00F5FF" : "#FFE600",
                    color: isCyber ? "#050816" : "#000000",
                    borderColor: isCyber ? "#00F5FF" : "#000000",
                    borderWidth: isCyber ? "1px" : "2.5px",
                    boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.4)" : "3px 3px 0 #000000",
                  }}
                >
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Retry Initialization</span>
                </button>
              </div>
            ) : (
              /* Loading State */
              <div className="flex flex-col items-center gap-3 w-full">
                <motion.h2
                  className="font-black text-sm sm:text-base tracking-tight"
                  style={{
                    fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                    color: isCyber ? "#00F5FF" : "#000000",
                  }}
                >
                  Loading your workspace data...
                </motion.h2>

                {/* Animated Progress Bar / Loader */}
                <div className="w-full h-2 rounded-full overflow-hidden relative border"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#E2E8F0",
                    borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
                    borderWidth: isCyber ? "1px" : "1.5px",
                  }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      width: "60%",
                      backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
                      boxShadow: isCyber ? "0 0 10px #00F5FF" : "none",
                    }}
                  />
                </div>

                <p className="text-[10px] font-mono tracking-widest uppercase opacity-60 mt-1">
                  {isCyber ? "SYS::INITIALIZING_AUTHENTICATED_WORKSPACE" : "SYSTEM // SYNCHRONIZING REALM DATA"}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
