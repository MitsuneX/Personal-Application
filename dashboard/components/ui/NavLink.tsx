"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";

interface NavLinkProps {
  href: string;
  icon: string;
  label: string;
  /** If true, only exact pathname match activates */
  exact?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

export function NavLink({ href, icon, label, exact = false, collapsed = false, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link href={href} onClick={onClick} className="block outline-none">
      <motion.div
        className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer group"
        animate={{
          backgroundColor: isActive
            ? isCyber ? "rgba(0,245,255,0.1)" : "rgba(255,107,53,0.12)"
            : "rgba(0,0,0,0)",
          color: isActive
            ? isCyber ? "#00F5FF" : "#FF6B35"
            : isCyber ? "#94A3B8" : "#4A4A4A",
        }}
        whileHover={{
          backgroundColor: isActive
            ? isCyber ? "rgba(0,245,255,0.15)" : "rgba(255,107,53,0.18)"
            : isCyber ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
          color: isCyber ? "#E0E8FF" : "#1A1A1A",
        }}
        transition={{ duration: 0.15 }}
      >
        {/* Active indicator bar */}
        {isActive && (
          <motion.div
            layoutId="nav-active-bar"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
            style={{ backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
              boxShadow: isCyber ? "0 0 8px rgba(0,245,255,0.9)" : "none" }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}

        {/* Icon */}
        <motion.span
          className="text-lg shrink-0 w-6 text-center"
          animate={{
            filter: isActive && isCyber ? "drop-shadow(0 0 6px rgba(0,245,255,0.8))" : "none",
            scale: isActive ? 1.1 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.span>

        {/* Label */}
        {!collapsed && (
          <motion.span
            className="font-semibold text-sm tracking-wide truncate"
            animate={{ fontFamily: isCyber && isActive ? "var(--font-orbitron)" : "inherit" }}
            transition={{ duration: 0.3 }}
          >
            {label}
          </motion.span>
        )}

        {/* Cyber glow bg on active */}
        {isActive && isCyber && (
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ boxShadow: "inset 0 0 20px rgba(0,245,255,0.05)", border: "1px solid rgba(0,245,255,0.15)" }}
          />
        )}
      </motion.div>
    </Link>
  );
}
