"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";

/**
 * TopLoader component.
 * Displays a minimal database loader at the very top edge of the screen:
 * - Brutal Mode: thick, 4px solid neon hot pink loader sliding across the screen.
 * - Cyber Mode: ultra-thin, elegant 2px neon cyan glowing line with shadow breath effect.
 */
export function TopLoader() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const isLoading = useDashboardStore((s) => s.isLoading);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[100] pointer-events-none overflow-hidden"
          style={{ height: isCyber ? "2px" : "4px" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {isCyber ? (
            /* Cyber Mode: Glowing thin cyan line breathing */
            <motion.div
              className="h-full w-full bg-[#00F5FF]"
              style={{
                boxShadow: "0 0 8px #00F5FF, 0 0 16px #BF5FFF",
              }}
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ) : (
            /* Brutal Mode: Hot pink thick bar sliding */
            <motion.div
              className="h-full w-full bg-[#FF6B35]"
              style={{
                background: "linear-gradient(90deg, #FF6B35, #EF476F, #FFD166)",
              }}
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
