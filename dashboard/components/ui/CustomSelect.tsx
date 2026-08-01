"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { FloatingLayer } from "./FloatingLayer";
import { Z_INDEX } from "./ViewportBoundary";

export interface CustomSelectOption {
  value: string;
  label: string;
  icon?: string | React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (CustomSelectOption | string)[];
  placeholder?: string;
  className?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select option...",
  className = "",
}: CustomSelectProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Map options to unified shape
  const normalizedOptions: CustomSelectOption[] = options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Styles
  const buttonStyle: React.CSSProperties = isCyber
    ? {
        background: "rgba(255, 255, 255, 0.03)",
        borderColor: "rgba(0, 245, 255, 0.25)",
        color: "#E0E8FF",
        fontFamily: "var(--font-jetbrains-mono)",
      }
    : {
        background: "#FFFFFF",
        borderColor: "#000000",
        borderWidth: "2.5px",
        color: "#1A1A1A",
        boxShadow: isOpen ? "1px 1px 0px #000" : "3px 3px 0px #000",
        transform: isOpen ? "translate(2px, 2px)" : "none",
      };

  const dropdownStyle: React.CSSProperties = isCyber
    ? {
        background: "rgba(5, 8, 22, 0.95)",
        border: "1px solid rgba(0, 245, 255, 0.35)",
        boxShadow: "0 10px 30px rgba(0, 245, 255, 0.15)",
        color: "#E0E8FF",
        fontFamily: "var(--font-jetbrains-mono)",
      }
    : {
        background: "#FFFCDE",
        border: "3.5px solid #000",
        boxShadow: "5px 5px 0px #000",
        color: "#1A1A1A",
      };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  return (
    <div className={`relative w-full select-none ${className}`}>
      {/* Trigger Button */}
      <motion.button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (process.env.NODE_ENV === "development") {
            console.log("[CustomSelect] Trigger Clicked", {
              placeholder,
              selectedValue: value,
              nextIsOpen: !isOpen,
              buttonZIndex: getComputedStyle(buttonRef.current || document.body).zIndex,
              layerZIndex: Z_INDEX.DROPDOWN,
            });
          }
          setIsOpen(!isOpen);
        }}
        onKeyDown={handleKeyDown}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        suppressHydrationWarning
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold rounded-lg border outline-none cursor-pointer"
        style={buttonStyle}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption ? (
            <>
              {selectedOption.icon && <span>{selectedOption.icon}</span>}
              <span className="truncate">{selectedOption.label}</span>
            </>
          ) : (
            <span className="opacity-50">{placeholder}</span>
          )}
        </span>
        <span className={`text-[10px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </motion.button>

      {/* Floating Layer Options Panel */}
      <FloatingLayer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={buttonRef}
        placement="bottom-start"
        zIndex={Z_INDEX.DROPDOWN}
      >
        <div
          style={dropdownStyle}
          className="rounded-lg overflow-hidden max-h-60 overflow-y-auto min-w-[200px]"
        >
          <div className="py-1">
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors duration-100 ${
                    isSelected
                      ? isCyber
                        ? "bg-[#00f5ff]/20 text-[#00f5ff]"
                        : "bg-[#FFD700] text-black font-bold"
                      : isCyber
                      ? "hover:bg-[#00f5ff]/10 hover:text-white"
                      : "hover:bg-black/5"
                  }`}
                >
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <span className="truncate">{opt.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </FloatingLayer>
    </div>
  );
}
