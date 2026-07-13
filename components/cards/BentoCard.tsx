"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { cardVariants, brutalHoverVariants, cyberHoverVariants } from "@/lib/theme/motionVariants";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  /** Disable the default hover interaction */
  noHover?: boolean;
  /** Extra motion props to pass through */
  layoutId?: string;
}

export function BentoCard({
  children,
  className = "",
  id,
  noHover = false,
  layoutId,
}: BentoCardProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const hoverVariants = isCyber ? cyberHoverVariants : brutalHoverVariants;

  return (
    <motion.div
      id={id}
      layoutId={layoutId}
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      {...(!noHover && {
        whileHover: "hover",
        whileTap: "tap",
      })}
      className={[
        "theme-card",
        "relative overflow-hidden",
        "flex flex-col",
        "p-5 md:p-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        // Applied via Framer Motion's animate object — allows smooth transitions
        ...(isCyber
          ? {
              background: "rgba(10, 15, 44, 0.75)",
              border: "1px solid rgba(0, 245, 255, 0.25)",
              boxShadow:
                "0 0 20px rgba(0, 245, 255, 0.15), 0 0 60px rgba(0, 245, 255, 0.05), inset 0 0 20px rgba(0, 245, 255, 0.02)",
              borderRadius: "12px",
              backdropFilter: "blur(20px)",
            }
          : {
              background: "#FFFFFF",
              border: "2px solid #000000",
              boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
              borderRadius: "6px",
            }),
      }}
    >
      {/* Cyber corner decorations */}
      {isCyber && (
        <>
          <motion.div
            className="absolute top-0 left-0 w-4 h-4 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              borderTop: "2px solid rgba(0,245,255,0.8)",
              borderLeft: "2px solid rgba(0,245,255,0.8)",
            }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-4 h-4 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              borderBottom: "2px solid rgba(191,95,255,0.8)",
              borderRight: "2px solid rgba(191,95,255,0.8)",
            }}
          />
        </>
      )}

      {/* Brutal accent stripe */}
      {!isCyber && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-1"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
          style={{
            background: "linear-gradient(90deg, #FF6B35, #FFD166, #06D6A0)",
            transformOrigin: "left",
          }}
        />
      )}

      {children}
    </motion.div>
  );
}
