"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { AlertTriangle, Check, X, Film, Search } from "lucide-react";

export interface CandidateItem {
  id: string;
  title: string;
  originalTitle?: string;
  year?: number;
  mediaType: string;
  posterUrl?: string;
  synopsis?: string;
  confidenceScore: number;
  imdbId?: string;
  tvmazeId?: string;
  malId?: number;
}

export interface MetadataConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  queryTitle: string;
  candidates: CandidateItem[];
  onSelectCandidate: (candidate: CandidateItem) => void;
}

export function MetadataConfirmationModal({
  isOpen,
  onClose,
  queryTitle,
  candidates,
  onSelectCandidate,
}: MetadataConfirmationModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="p-6 rounded-2xl max-w-xl w-full border relative overflow-hidden flex flex-col gap-5 max-h-[85vh]"
          style={{
            backgroundColor: isCyber ? "#050816" : "#FFFFFF",
            borderColor: isCyber ? "rgba(245,158,11,0.5)" : "#000000",
            boxShadow: isCyber ? "0 0 35px rgba(245,158,11,0.25)" : "8px 8px 0 #000",
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full border cursor-pointer opacity-70 hover:opacity-100"
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 className="font-black text-lg" style={{ color: isCyber ? "#E0E8FF" : "#1A1A1A" }}>
                Confirm Metadata Match
              </h3>
              <p className="text-xs opacity-70 mt-0.5">
                Multiple candidates found for <span className="font-mono font-bold text-amber-400">&apos;{queryTitle}&apos;</span>. Please select the correct title to permanently save its external ID.
              </p>
            </div>
          </div>

          {/* Candidate List */}
          <div className="flex flex-col gap-3 overflow-y-auto pr-1">
            {candidates.map((c) => (
              <motion.div
                key={c.id}
                whileHover={{ scale: 1.01, x: 2 }}
                onClick={() => onSelectCandidate(c)}
                className="p-3.5 rounded-xl border flex items-center gap-4 cursor-pointer relative overflow-hidden transition-all group"
                style={{
                  backgroundColor: isCyber ? "rgba(10,15,44,0.8)" : "#FFF5E4",
                  borderColor: isCyber ? "rgba(255,255,255,0.12)" : "#000000",
                }}
              >
                {/* Poster / Thumbnail */}
                <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 border bg-slate-800 flex items-center justify-center">
                  {c.posterUrl ? (
                    <img src={c.posterUrl} alt={c.title} className="w-full h-full object-cover" />
                  ) : (
                    <Film size={20} className="opacity-40" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm truncate" style={{ color: isCyber ? "#E0E8FF" : "#1A1A1A" }}>
                      {c.title}
                    </h4>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                      Match: {c.confidenceScore}%
                    </span>
                  </div>

                  {c.originalTitle && c.originalTitle !== c.title && (
                    <p className="text-[11px] font-mono opacity-60 truncate">{c.originalTitle}</p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] opacity-70 mt-1 font-mono">
                    {c.year && <span>Year: {c.year}</span>}
                    <span className="uppercase text-[10px] px-1.5 py-0.2 rounded border border-white/10">
                      {c.mediaType}
                    </span>
                    {c.imdbId && <span>IMDb: {c.imdbId}</span>}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Check size={16} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
