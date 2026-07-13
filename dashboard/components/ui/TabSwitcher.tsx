"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";

interface Tab {
  id: string;
  label: string;
  icon?: string;
  count?: number;
}

interface TabSwitcherProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export function TabSwitcher({ tabs, activeTab, onTabChange, className = "" }: TabSwitcherProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  return (
    <div
      className={`inline-flex p-1 rounded-xl gap-1 ${className}`}
      style={{
        backgroundColor: isCyber ? "rgba(5, 8, 22, 0.8)" : "rgba(0,0,0,0.06)",
        border: isCyber ? "1px solid rgba(0,245,255,0.15)" : "2px solid rgba(0,0,0,0.12)",
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className="relative px-4 py-2 rounded-lg text-sm font-bold tracking-wide outline-none transition-colors flex items-center gap-1.5"
            style={{
              color: isActive
                ? isCyber ? "#050816" : "#FFFFFF"
                : isCyber ? "#94A3B8" : "#6B7280",
              zIndex: 1,
            }}
          >
            {/* Animated active background */}
            {isActive && (
              <motion.div
                layoutId="tab-bg"
                className="absolute inset-0 rounded-lg"
                style={{
                  backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
                  boxShadow: isCyber
                    ? "0 0 16px rgba(0,245,255,0.6), 0 0 40px rgba(0,245,255,0.2)"
                    : "3px 3px 0px 0px rgba(0,0,0,1)",
                }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}

            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon && <span>{tab.icon}</span>}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className="text-xs rounded-full px-1.5 py-0.5 font-mono"
                  style={{
                    backgroundColor: isActive
                      ? "rgba(0,0,0,0.2)"
                      : isCyber ? "rgba(0,245,255,0.1)" : "rgba(0,0,0,0.1)",
                    color: isActive ? "inherit" : isCyber ? "#00F5FF" : "#FF6B35",
                  }}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
