"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { TRAINING_QUOTES, TrainingQuote } from "@/lib/data/trainingQuotes";

export function TrainingQuoteCard() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const lastIndexRef = useRef(0);

  // Check for prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Rotate quotes every ~3.5 seconds without immediately repeating
  useEffect(() => {
    if (!TRAINING_QUOTES || TRAINING_QUOTES.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        let next: number;
        do {
          next = Math.floor(Math.random() * TRAINING_QUOTES.length);
        } while (next === prev && TRAINING_QUOTES.length > 1);
        lastIndexRef.current = next;
        return next;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const quote: TrainingQuote = TRAINING_QUOTES[currentIndex] || TRAINING_QUOTES[0];

  return (
    <div
      className={`relative overflow-hidden rounded-xl p-4 transition-all duration-300 flex flex-col justify-between min-h-[110px] ${
        isCyber
          ? "bg-[rgba(10,16,32,0.85)] border border-cyan-500/30 shadow-[0_0_20px_rgba(0,245,255,0.08)] backdrop-blur-md"
          : "bg-[#FFFBF0] border-2 border-black shadow-[4px_4px_0px_#000]"
      }`}
    >
      {/* Decorative Cyber Grid / Brutalist Accent */}
      {isCyber ? (
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
      ) : (
        <div className="absolute top-2 right-2 text-xs font-black uppercase px-1.5 py-0.5 bg-black text-[#FFE600] rounded">
          FOCUS
        </div>
      )}

      {/* Quote Header Pill */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-base">🥊</span>
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              isCyber ? "text-cyan-400 font-mono" : "text-black"
            }`}
          >
            Mindset & Discipline
          </span>
        </div>
        {quote.category && (
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
              isCyber
                ? "bg-cyan-950/60 text-cyan-300 border border-cyan-500/30"
                : "bg-black text-white"
            }`}
          >
            {quote.category}
          </span>
        )}
      </div>

      {/* Quote Body with animated transitions */}
      <div className="relative flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={quote.id}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.3 }}
            className="flex flex-col gap-1.5"
          >
            <p
              className={`text-sm italic font-medium leading-snug ${
                isCyber ? "text-slate-100" : "text-black font-serif"
              }`}
            >
              “{quote.text}”
            </p>
            {quote.author && (
              <p
                className={`text-xs font-bold text-right tracking-wide ${
                  isCyber ? "text-cyan-400/90 font-mono" : "text-[#D9381E]"
                }`}
              >
                — {quote.author}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
