"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";

export interface FilterOption {
  id: string;
  label: string;
  icon?: string | React.ReactNode;
  badge?: string;
  description?: string;
}

export interface FilterGroup {
  groupName?: string;
  options: FilterOption[];
}

interface FilterDropdownProps {
  label?: string;
  icon?: string | React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[] | FilterGroup[];
  className?: string;
  align?: "left" | "right";
  buttonVariant?: "default" | "compact" | "pill";
}

export function FilterDropdown({
  label = "Filter / Sort",
  icon = "⚡",
  value,
  onChange,
  options,
  className = "",
  align = "left",
  buttonVariant = "default",
}: FilterDropdownProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const [isOpen, setIsOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Normalize options into groups
  const groups: FilterGroup[] = Array.isArray(options) && options.length > 0 && "options" in options[0]
    ? (options as FilterGroup[])
    : [{ options: options as FilterOption[] }];

  // Find currently selected option label & icon
  const allOptions = groups.flatMap((g) => g.options);
  const activeOption = allOptions.find((opt) => opt.id === value);

  // Handle Viewport Space & Positioning
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.bottom;
      // If less than 240px below button, flip dropdown to open upwards
      setDropUp(spaceBelow < 240);
    }
  }, [isOpen]);

  // Handle click outside and Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Trigger button styles
  const triggerStyle: React.CSSProperties = isCyber
    ? {
        background: isOpen ? "rgba(0, 245, 255, 0.15)" : "rgba(255, 255, 255, 0.04)",
        borderColor: isOpen ? "#00F5FF" : "rgba(0, 245, 255, 0.25)",
        color: "#E0E8FF",
        fontFamily: "var(--font-jetbrains-mono)",
        boxShadow: isOpen ? "0 0 15px rgba(0, 245, 255, 0.25)" : "none",
      }
    : {
        background: isOpen ? "#FFD700" : "#FFFFFF",
        border: "2.5px solid #000000",
        color: "#000000",
        boxShadow: isOpen ? "2px 2px 0px #000000" : "3.5px 3.5px 0px #000000",
        transform: isOpen ? "translate(1.5px, 1.5px)" : "none",
      };

  // Dropdown panel styles
  const dropdownPanelStyle: React.CSSProperties = isCyber
    ? {
        background: "rgba(5, 8, 22, 0.96)",
        border: "1px solid rgba(0, 245, 255, 0.4)",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(0, 245, 255, 0.15)",
        backdropFilter: "blur(12px)",
        color: "#E0E8FF",
        fontFamily: "var(--font-jetbrains-mono)",
      }
    : {
        background: "#FFFCDE",
        border: "3.5px solid #000000",
        boxShadow: "6px 6px 0px #000000",
        color: "#000000",
      };

  return (
    <div ref={containerRef} className={`relative inline-block text-left select-none ${className}`}>
      {/* Trigger Button */}
      <motion.button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center gap-2 font-bold transition-all duration-150 cursor-pointer outline-none ${
          buttonVariant === "compact"
            ? "px-3 py-1.5 text-xs rounded-md"
            : buttonVariant === "pill"
            ? "px-4 py-2 text-xs rounded-full"
            : "px-4 py-2.5 text-xs sm:text-sm rounded-lg"
        }`}
        style={triggerStyle}
      >
        <span className="opacity-90">{activeOption?.icon || icon}</span>
        <span className="truncate max-w-[150px] sm:max-w-[200px]">
          {activeOption?.label || label}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-0.5 text-[10px] opacity-75"
        >
          ▼
        </motion.span>
      </motion.button>

      {/* Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: dropUp ? 8 : -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: dropUp ? 5 : -5 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              ...dropdownPanelStyle,
              position: "absolute",
              [dropUp ? "bottom" : "top"]: "calc(100% + 8px)",
              [align === "right" ? "right" : "left"]: 0,
            }}
            className="z-[999] min-w-[230px] max-w-[320px] rounded-xl overflow-hidden p-1.5 flex flex-col gap-1"
          >
            {groups.map((group, gIdx) => (
              <div key={gIdx} className="flex flex-col">
                {group.groupName && (
                  <div
                    className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border-b mb-1 flex items-center justify-between"
                    style={{
                      borderColor: isCyber ? "rgba(0, 245, 255, 0.15)" : "#000000",
                      color: isCyber ? "#00F5FF" : "#000000",
                    }}
                  >
                    <span>{group.groupName}</span>
                  </div>
                )}

                {group.options.map((opt) => {
                  const isSelected = opt.id === value;

                  const itemStyle: React.CSSProperties = isCyber
                    ? {
                        background: isSelected ? "rgba(0, 245, 255, 0.18)" : "transparent",
                        color: isSelected ? "#00F5FF" : "#94A3B8",
                      }
                    : {
                        background: isSelected ? "#FFD700" : "transparent",
                        color: "#000000",
                        fontWeight: isSelected ? "900" : "700",
                      };

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(opt.id);
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg text-left transition-all duration-100 cursor-pointer hover:bg-opacity-80"
                      style={itemStyle}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {opt.icon && <span className="text-sm">{opt.icon}</span>}
                        <div className="flex flex-col">
                          <span className="truncate">{opt.label}</span>
                          {opt.description && (
                            <span className="text-[10px] font-normal opacity-70 truncate max-w-[200px]">
                              {opt.description}
                            </span>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <span className="ml-2 text-xs font-black">
                          {isCyber ? "⚡" : "✓"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
