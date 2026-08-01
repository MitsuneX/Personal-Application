"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { OverlayPortal } from "./OverlayPortal";
import { Z_INDEX, getViewportRect } from "./ViewportBoundary";
import { ContextMenuItem } from "@/lib/context-menu/menuDefinitions";
import { Check } from "lucide-react";

export type { ContextMenuItem };

export interface ContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  onClose: () => void;
  items: ContextMenuItem[];
  title?: string;
  isMobile?: boolean;
}

export function ContextMenu({
  isOpen,
  x,
  y,
  onClose,
  items,
  title,
  isMobile: isMobileProp,
}: ContextMenuProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const menuRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [pos, setPos] = useState({ left: x, top: y });

  // Auto detect mobile (< 640px)
  const [isMobile, setIsMobile] = useState(isMobileProp ?? false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  // Compute position inside safe viewport
  useEffect(() => {
    if (!isOpen || isMobile) return;

    const vp = getViewportRect(12);
    const menuWidth = 230;
    const menuHeight = items.length * 36 + (title ? 32 : 12);

    let left = x;
    let top = y;

    if (left + menuWidth > vp.width - vp.safeMargin) {
      left = Math.max(vp.safeMargin, vp.width - menuWidth - vp.safeMargin);
    }
    if (top + menuHeight > vp.height - vp.safeMargin) {
      top = Math.max(vp.safeMargin, vp.height - menuHeight - vp.safeMargin);
    }

    setPos({ left, top });
    setActiveIndex(-1);
  }, [isOpen, x, y, items.length, title, isMobile]);

  // Keyboard navigation & dismissal
  useEffect(() => {
    if (!isOpen) return;

    const validIndices = items
      .map((item, idx) => (!item.disabled && !item.isHeader ? idx : -1))
      .filter((idx) => idx !== -1);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => {
          const currentPos = validIndices.indexOf(prev);
          const nextPos = currentPos < validIndices.length - 1 ? currentPos + 1 : 0;
          return validIndices[nextPos] ?? -1;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => {
          const currentPos = validIndices.indexOf(prev);
          const prevPos = currentPos > 0 ? currentPos - 1 : validIndices.length - 1;
          return validIndices[prevPos] ?? -1;
        });
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        const selected = items[activeIndex];
        if (selected && !selected.disabled) {
          selected.onClick();
          onClose();
        }
      }
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
  }, [isOpen, onClose, items, activeIndex]);

  if (!isOpen) return null;

  const content = (
    <OverlayPortal>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile backdrop */}
            {isMobile && (
              <motion.div
                key="ctx-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                style={{ zIndex: Z_INDEX.CONTEXT_MENU - 1 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm sm:hidden"
                onClick={onClose}
              />
            )}

            <motion.div
              key="ctx-menu"
              ref={menuRef}
              role="menu"
              aria-label={title || "Context Menu"}
              initial={
                isMobile
                  ? { y: "100%", opacity: 0 }
                  : { opacity: 0, scale: 0.94, y: -4 }
              }
              animate={
                isMobile
                  ? { y: 0, opacity: 1 }
                  : { opacity: 1, scale: 1, y: 0 }
              }
              exit={
                isMobile
                  ? { y: "100%", opacity: 0 }
                  : { opacity: 0, scale: 0.94, y: -4 }
              }
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
              style={
                isMobile
                  ? {
                      position: "fixed",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      zIndex: Z_INDEX.CONTEXT_MENU,
                      maxHeight: "80vh",
                      backgroundColor: isCyber ? "rgba(5, 8, 22, 0.98)" : "#FFFFFF",
                      borderColor: isCyber ? "rgba(0, 245, 255, 0.4)" : "#000000",
                      borderWidth: isCyber ? "1px 0 0 0" : "3px 0 0 0",
                      boxShadow: isCyber ? "0 -10px 40px rgba(0,245,255,0.2)" : "0 -8px 24px rgba(0,0,0,0.2)",
                    }
                  : {
                      position: "fixed",
                      left: `${pos.left}px`,
                      top: `${pos.top}px`,
                      zIndex: Z_INDEX.CONTEXT_MENU,
                      minWidth: "210px",
                      maxWidth: "280px",
                      backgroundColor: isCyber ? "rgba(8, 12, 28, 0.96)" : "#FFFFFF",
                      borderColor: isCyber ? "rgba(0, 245, 255, 0.35)" : "#000000",
                      borderWidth: isCyber ? "1px" : "2.5px",
                      boxShadow: isCyber
                        ? "0 12px 36px rgba(0,0,0,0.7), 0 0 25px rgba(0,245,255,0.25)"
                        : "5px 5px 0 #000000",
                      backdropFilter: "blur(14px)",
                    }
              }
              className={`select-none overflow-hidden ${
                isMobile ? "rounded-t-3xl p-3 pb-6" : "rounded-xl py-1.5"
              }`}
            >
              {/* Header Title */}
              {title && (
                <div
                  className="px-3.5 py-2 text-[10px] font-mono font-black uppercase tracking-wider border-b flex items-center justify-between"
                  style={{
                    borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#000000",
                    color: isCyber ? "rgba(0,245,255,0.7)" : "#64748B",
                  }}
                >
                  <span>{title}</span>
                  {isMobile && <span className="text-xs opacity-50">✕</span>}
                </div>
              )}

              <div className="py-1 space-y-0.5 max-h-[60vh] overflow-y-auto">
                {items.map((item, idx) => {
                  const isHighlighted = activeIndex === idx;

                  if (item.isHeader) {
                    return (
                      <React.Fragment key={item.id}>
                        {item.divider && (
                          <div
                            className="my-1.5 border-t"
                            style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}
                          />
                        )}
                        <div
                          className="px-3.5 pt-2 pb-0.5 text-[10px] font-mono font-black uppercase tracking-wider select-none pointer-events-none"
                          style={{ color: isCyber ? "rgba(0,245,255,0.6)" : "#64748B" }}
                        >
                          {item.label}
                        </div>
                      </React.Fragment>
                    );
                  }

                  return (
                    <React.Fragment key={item.id}>
                      {item.divider && (
                        <div
                          className="my-1 border-t"
                          style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}
                        />
                      )}
                      <button
                        type="button"
                        role="menuitem"
                        disabled={item.disabled}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!item.disabled) {
                            item.onClick();
                            onClose();
                          }
                        }}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`w-full px-3.5 py-2 text-xs font-bold flex items-center justify-between gap-3 transition-colors cursor-pointer text-left rounded-lg ${
                          item.disabled ? "opacity-40 cursor-not-allowed" : ""
                        }`}
                        style={{
                          backgroundColor: isHighlighted && !item.disabled
                            ? item.danger
                              ? isCyber
                                ? "rgba(239,68,68,0.22)"
                                : "#FEE2E2"
                              : isCyber
                              ? "rgba(0,245,255,0.15)"
                              : "#F1F5F9"
                            : "transparent",
                          color: item.danger
                            ? "#EF4444"
                            : isCyber
                            ? isHighlighted
                              ? "#00F5FF"
                              : "#E0E8FF"
                            : "#1A1A1A",
                        }}
                      >
                        <span className="flex items-center gap-2.5 truncate">
                          {item.checked !== undefined && (
                            <span className="w-4 h-4 flex items-center justify-center shrink-0">
                              {item.checked && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                            </span>
                          )}
                          {item.icon && (
                            <span className="w-4 h-4 flex items-center justify-center shrink-0 text-sm">
                              {item.icon}
                            </span>
                          )}
                          <span className="truncate">{item.label}</span>
                        </span>

                        {item.shortcut && (
                          <span
                            className="text-[10px] font-mono opacity-50 shrink-0 uppercase px-1 py-0.5 rounded border"
                            style={{
                              borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#D1D5DB",
                              backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F3F4F6",
                            }}
                          >
                            {item.shortcut}
                          </span>
                        )}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </OverlayPortal>
  );

  return content;
}
