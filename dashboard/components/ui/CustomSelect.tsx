"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";

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
  const containerRef = useRef<HTMLDivElement>(null);

  // Map options to unified shape
  const normalizedOptions: CustomSelectOption[] = options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

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

  return (
    <div ref={containerRef} className={`relative w-full select-none ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold rounded-lg border outline-none cursor-pointer transition-all duration-150"
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
      </button>

      {/* Options Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 mt-1.5 rounded-lg z-50 overflow-hidden max-h-60 overflow-y-auto"
            style={dropdownStyle}
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
                    className={`px-3 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors duration-100 ${
                      isSelected
                        ? isCyber
                          ? "bg-[#00f5ff]/20 text-[#00f5ff]"
                          : "bg-[#FFD700] text-black"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
