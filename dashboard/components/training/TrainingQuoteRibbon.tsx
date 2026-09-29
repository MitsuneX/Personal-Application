"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { TRAINING_QUOTES, TrainingQuote } from "@/lib/data/trainingQuotes";

export function TrainingQuoteRibbon() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const lastIndexRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

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
      className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all flex flex-col justify-center min-h-[88px] ${
        isCyber
          ? "bg-[linear-gradient(135deg,rgba(10,18,38,0.7),rgba(6,12,28,0.85))] border border-cyan-500/20 text-slate-100"
          : "bg-[#FFFBF0] border-2 border-black/80 text-black shadow-[3px_3px_0px_#000]"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span
          className={`text-[10px] font-black uppercase tracking-wider ${
            isCyber ? "text-cyan-400 font-mono" : "text-black"
          }`}
        >
          🥋 Training Mantra
        </span>
        {quote.category && (
          <span
            className={`text-[9px] font-bold px-2 py-0.2 rounded uppercase tracking-wider ${
              isCyber
                ? "bg-slate-800 text-cyan-300 font-mono border border-cyan-500/30"
                : "bg-black text-white"
            }`}
          >
            {quote.category}
          </span>
        )}
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={quote.id}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.25 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs sm:text-sm"
          >
            <p className="italic font-medium leading-snug">
              “{quote.text}”
            </p>
            {quote.author && (
              <span
                className={`shrink-0 font-bold text-right text-[11px] ${
                  isCyber ? "text-cyan-400 font-mono" : "text-[#D9381E]"
                }`}
              >
                — {quote.author}
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
