"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

export interface ContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  onClose: () => void;
  items: ContextMenuItem[];
  title?: string;
}

export function ContextMenu({ isOpen, x, y, onClose, items, title }: ContextMenuProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const menuRef = useRef<HTMLDivElement>(null);

  // Position adjustment to prevent overflow off screen
  const [adjustedPos, setAdjustedPos] = React.useState({ left: x, top: y });

  useEffect(() => {
    if (!isOpen) return;

    const menuWidth = 220;
    const menuHeight = items.length * 36 + 40;

    let posX = x;
    let posY = y;

    if (posX + menuWidth > window.innerWidth - 12) {
      posX = Math.max(12, window.innerWidth - menuWidth - 12);
    }
    if (posY + menuHeight > window.innerHeight - 12) {
      posY = Math.max(12, window.innerHeight - menuHeight - 12);
    }

    setAdjustedPos({ left: posX, top: posY });
  }, [isOpen, x, y, items.length]);

  // Click outside and Escape key handlers
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleScroll = () => {
      onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.92, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -4 }}
          transition={{ type: "spring", stiffness: 450, damping: 30 }}
          style={{
            position: "fixed",
            left: `${adjustedPos.left}px`,
            top: `${adjustedPos.top}px`,
            zIndex: 9999,
            minWidth: "200px",
            backgroundColor: isCyber ? "rgba(10, 15, 30, 0.95)" : "#FFFFFF",
            borderColor: isCyber ? "rgba(0, 245, 255, 0.35)" : "#000000",
            borderWidth: isCyber ? "1px" : "2.5px",
            boxShadow: isCyber
              ? "0 12px 36px rgba(0,0,0,0.6), 0 0 25px rgba(0,245,255,0.25)"
              : "5px 5px 0 #000000",
            backdropFilter: "blur(12px)",
          }}
          className="rounded-xl py-1.5 overflow-hidden select-none"
        >
          {title && (
            <div
              className="px-3.5 py-1.5 text-[10px] font-mono font-black uppercase tracking-wider border-b"
              style={{
                borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#000000",
                color: isCyber ? "rgba(0,245,255,0.7)" : "#64748B",
              }}
            >
              {title}
            </div>
          )}

          <div className="py-1">
            {items.map((item) => (
              <React.Fragment key={item.id}>
                {item.divider && (
                  <div
                    className="my-1 border-t"
                    style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}
                  />
                )}
                <button
                  disabled={item.disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!item.disabled) {
                      item.onClick();
                      onClose();
                    }
                  }}
                  className={`w-full px-3.5 py-1.5 text-xs font-bold flex items-center justify-between gap-3 transition-colors cursor-pointer text-left ${
                    item.disabled ? "opacity-40 cursor-not-allowed" : ""
                  }`}
                  style={{
                    color: item.danger
                      ? "#EF4444"
                      : isCyber
                      ? "#F8FAFC"
                      : "#1E293B",
                  }}
                  onMouseEnter={(e) => {
                    if (!item.disabled) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = item.danger
                        ? isCyber ? "rgba(239,68,68,0.2)" : "#FEE2E2"
                        : isCyber ? "rgba(0,245,255,0.12)" : "#F1F5F9";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  }}
                >
                  <span className="flex items-center gap-2 truncate">
                    {item.icon && <span className="text-sm shrink-0">{item.icon}</span>}
                    <span className="truncate">{item.label}</span>
                  </span>
                </button>
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
