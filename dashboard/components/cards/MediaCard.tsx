"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { usePathname, useRouter } from "next/navigation";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type MediaCategory = "japanese" | "korean" | "chinese" | "hollywood" | "anime";

export interface MediaCardProps {
  id: string;
  title: string;
  category: MediaCategory;
  status: string;
  episodesWatched: number;
  totalEpisodes: number;
  rating: number;
  genre?: string;
  year?: number;
  platform?: string;
  cast?: string[];
  synopsis?: string;
  posterUrl?: string;
  isEditable?: boolean;
  onStatusChange?: (id: string, status: string) => void;
  onEpisodeChange?: (id: string, watched: number, newStatus: string) => void;
  onDelete?: (id: string) => void;
  hofStars?: { id: string; name: string; tokusatsuFranchise?: string | null }[];
  index?: number;
}

// ─── Cultural Theme Map ─────────────────────────────────────────────────────────

const THEMES = {
  japanese: {
    cyber: {
      accent: "#FF69B4", accent2: "#BF5FFF",
      glow: "rgba(255,105,180,0.45)", border: "rgba(255,105,180,0.3)",
      text: "#FFD1E8", gradFrom: "rgba(13,6,22,0.96)",
    },
    brutal: {
      accent: "#C9184A", accent2: "#FF6B9D",
      border: "#2D1B24", surface: "#FFE4ED", text: "#2D1B24",
    },
  },
  korean: {
    cyber: {
      accent: "#22D3EE", accent2: "#F472B6",
      glow: "rgba(34,211,238,0.4)", border: "rgba(34,211,238,0.3)",
      text: "#E0F7FA", gradFrom: "rgba(2,13,24,0.96)",
    },
    brutal: {
      accent: "#2EC4B6", accent2: "#E84855",
      border: "#003366", surface: "#E8F7F7", text: "#003366",
    },
  },
  chinese: {
    cyber: {
      accent: "#FFD700", accent2: "#C8102E",
      glow: "rgba(255,215,0,0.35)", border: "rgba(212,175,55,0.3)",
      text: "#FFF8E7", gradFrom: "rgba(3,10,26,0.96)",
    },
    brutal: {
      accent: "#C8102E", accent2: "#D4AF37",
      border: "#7A0000", surface: "#FFF0E0", text: "#3D0000",
    },
  },
  hollywood: {
    cyber: {
      accent: "#A78BFA", accent2: "#FCD34D",
      glow: "rgba(167,139,250,0.4)", border: "rgba(167,139,250,0.3)",
      text: "#EDE9FE", gradFrom: "rgba(10,6,24,0.96)",
    },
    brutal: {
      accent: "#7C3AED", accent2: "#D97706",
      border: "#4C1D95", surface: "#EDE0FF", text: "#1E1B4B",
    },
  },
  anime: {
    cyber: {
      accent: "#BF5FFF", accent2: "#00F5FF",
      glow: "rgba(191,95,255,0.4)", border: "rgba(191,95,255,0.3)",
      text: "#E8D5FF", gradFrom: "rgba(5,8,22,0.96)",
    },
    brutal: {
      accent: "#FF6B35", accent2: "#06D6A0",
      border: "#1A1A1A", surface: "#FFF5EE", text: "#1A1A1A",
    },
  },
} as const;

// ─── Episode unit labels ─────────────────────────────────────────────────────────
const EP_LABELS: Record<MediaCategory, string> = {
  japanese: "話",
  korean:   "회",
  chinese:  "集",
  hollywood: "ep",
  anime:    "eps",
};

// ─── Status cycling ──────────────────────────────────────────────────────────────
const STATUS_CYCLE = ["Watching", "Completed", "On Hold", "Plan to Watch", "Dropped"];

const STATUS_COLORS: Record<string, { cyber: string; brutal: string }> = {
  "Watching":      { cyber: "#00F5FF", brutal: "#2563EB" },
  "Completed":     { cyber: "#39FF14", brutal: "#16A34A" },
  "On Hold":       { cyber: "#FFD700", brutal: "#D97706" },
  "Plan to Watch": { cyber: "#BF5FFF", brutal: "#7C3AED" },
  "Dropped":       { cyber: "#FF073A", brutal: "#DC2626" },
};

// ─── Cultural Overlay ────────────────────────────────────────────────────────────

function CulturalOverlay({ category, isCyber }: { category: MediaCategory; isCyber: boolean }) {
  if (category === "japanese") {
    const petals = ["🌸","🌸","🌸","🌸","🌸"];
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: isCyber ? 0.06 : 0.08 }}>
        {petals.map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl select-none"
            style={{ left: `${10 + i * 18}%`, top: `${-5 + (i % 2) * 45}%` }}
            animate={{ y: [0, 8, 0], rotate: [0, 20, 0], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 3 + i * 0.6, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
          >🌸</motion.div>
        ))}
      </div>
    );
  }
  if (category === "korean" && isCyber) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ background: "linear-gradient(45deg, transparent 20%, rgba(34,211,238,0.05) 50%, rgba(244,114,182,0.04) 80%, transparent)" }}
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }
  if (category === "chinese") {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.05 }}>
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${i * 22}%`, top: `${(i % 2) * 60}%`,
              width: "50px", height: "25px",
              backgroundColor: isCyber ? "#FFD700" : "#C8102E",
              filter: "blur(8px)",
            }}
            animate={{ x: [0, 12, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
        {/* Lattice grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${isCyber ? "rgba(212,175,55,0.08)" : "rgba(122,0,0,0.06)"} 1px, transparent 1px),
                              linear-gradient(90deg, ${isCyber ? "rgba(212,175,55,0.08)" : "rgba(122,0,0,0.06)"} 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />
      </div>
    );
  }
  if (category === "hollywood") {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Film grain */}
        <div
          className="absolute inset-0"
          style={{
            opacity: isCyber ? 0.04 : 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "180px",
          }}
        />
        {/* Spotlight sweep */}
        {isCyber && (
          <motion.div
            className="absolute inset-0"
            style={{ background: "conic-gradient(from 0deg at 20% 50%, transparent 340deg, rgba(167,139,250,0.06) 355deg, transparent 360deg)" }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>
    );
  }
  if (category === "anime" && isCyber) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.05 }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(191,95,255,1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(191,95,255,1) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>
    );
  }
  return null;
}

// ─── Episode Stepper ─────────────────────────────────────────────────────────────

function EpisodeStepper({
  watched, total, category, isCyber, accent, onChange,
}: {
  watched: number; total: number; category: MediaCategory;
  isCyber: boolean; accent: string;
  onChange: (v: number) => void;
}) {
  const [local, setLocal] = useState(watched);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => { setLocal(watched); }, [watched]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const commit = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(total, v));
    setLocal(clamped);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(clamped), 500);
  }, [total, onChange]);

  const btnStyle = {
    background: `${accent}22`,
    color: accent,
    border: `1.5px solid ${accent}55`,
  };

  return (
    <div className="flex items-center gap-1.5">
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={(e) => { e.stopPropagation(); commit(local - 1); }}
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black leading-none"
        style={btnStyle}
      >−</motion.button>
      <span className="font-mono font-black text-xs tabular-nums" style={{ color: accent }}>
        {local}/{total}&nbsp;{EP_LABELS[category]}
      </span>
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={(e) => { e.stopPropagation(); commit(local + 1); }}
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black leading-none"
        style={btnStyle}
      >+</motion.button>
    </div>
  );
}

// ─── Main MediaCard Component ─────────────────────────────────────────────────────

export function MediaCard({
  id, title, category, status, episodesWatched, totalEpisodes, rating,
  genre, year, platform, cast, synopsis, posterUrl,
  isEditable = false,
  onStatusChange, onEpisodeChange, onDelete,
  hofStars, index = 0,
}: MediaCardProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const t = isCyber ? THEMES[category].cyber : THEMES[category].brutal;
  const accent = t.accent;
  const accent2 = t.accent2;
  const cardText = isCyber ? t.text : (THEMES[category].brutal as typeof THEMES["japanese"]["brutal"]).text;

  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [localStatus, setLocalStatus] = useState(status);
  const [localEps, setLocalEps] = useState(episodesWatched);
  const [imgError, setImgError] = useState(false);
  const [popSide, setPopSide] = useState<"left" | "right">("right");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const handleViewDetails = useCallback(() => {
    const targetUrl = category === "anime" ? `/anime?id=${id}` : `/drama/${category}?id=${id}`;
    if (pathname === (category === "anime" ? "/anime" : `/drama/${category}`)) {
      const el = document.getElementById(`media-card-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.style.outline = isCyber ? `3px solid ${accent}` : `3px solid ${accent2}`;
        el.style.outlineOffset = "4px";
        setTimeout(() => {
          el.style.outline = "none";
        }, 3000);
      }
    } else {
      router.push(targetUrl);
    }
  }, [id, category, pathname, router, accent, accent2, isCyber]);

  useEffect(() => { setLocalStatus(status); }, [status]);
  useEffect(() => { setLocalEps(episodesWatched); }, [episodesWatched]);

  const hasPoster = !!posterUrl && !imgError;
  const pct = Math.min(100, Math.round((localEps / Math.max(1, totalEpisodes)) * 100));

  const statusColorKey = localStatus as keyof typeof STATUS_COLORS;
  const sc = STATUS_COLORS[statusColorKey] ?? { cyber: "#94A3B8", brutal: "#6B7280" };
  const statusColor = isCyber ? sc.cyber : sc.brutal;

  // 3D tilt on mouse move + horizontal popout side detector
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 7;
    const y = ((e.clientY - r.top) / r.height - 0.5) * -6;
    setTilt({ x, y });

    // Dynamically choose left or right depending on coordinates
    if (typeof window !== "undefined") {
      if (e.clientX > window.innerWidth * 0.55) {
        setPopSide("left");
      } else {
        setPopSide("right");
      }
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
    setDropdownOpen(false);
  }, []);

  const handleStatusCycle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = STATUS_CYCLE.indexOf(localStatus);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    setLocalStatus(next);
    onStatusChange?.(id, next);
  }, [id, localStatus, onStatusChange]);

  const handleEpisodeChange = useCallback((v: number) => {
    setLocalEps(v);
    const newStatus = v >= totalEpisodes ? "Completed" : (v > 0 && localStatus === "Plan to Watch" ? "Watching" : localStatus);
    if (newStatus !== localStatus) setLocalStatus(newStatus);
    onEpisodeChange?.(id, v, newStatus);
  }, [id, totalEpisodes, localStatus, onEpisodeChange]);

  // ── Card base style ────────────────────────────────────────────────────────
  const baseStyle: React.CSSProperties = isCyber
    ? {
        background: hasPoster
          ? "transparent"
          : `radial-gradient(ellipse at top left, ${accent}15, ${(THEMES[category].cyber as typeof THEMES["japanese"]["cyber"]).gradFrom})`,
        border: `1px solid ${t.border}`,
        boxShadow: hovered
          ? `0 0 40px ${(THEMES[category].cyber as typeof THEMES["japanese"]["cyber"]).glow}, 0 12px 40px rgba(0,0,0,0.6)`
          : `0 0 16px ${(THEMES[category].cyber as typeof THEMES["japanese"]["cyber"]).glow}50`,
        transform: `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        transition: "box-shadow 0.3s ease, transform 0.15s ease",
      }
    : {
        background: hasPoster
          ? "transparent"
          : (THEMES[category].brutal as typeof THEMES["japanese"]["brutal"]).surface,
        border: `2.5px solid ${(THEMES[category].brutal as typeof THEMES["japanese"]["brutal"]).border}`,
        boxShadow: hovered ? "8px 8px 0 #000" : "4px 4px 0 #000",
        transition: "box-shadow 0.15s ease",
      };

  return (
    <div
      id={`media-card-${id}`}
      className="relative w-full h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Base Card (rounded, overflow-hidden) ── */}
      <div
        ref={cardRef}
        className="relative rounded-xl overflow-hidden w-full h-full"
        style={{ ...baseStyle, minHeight: "230px" }}
        onMouseMove={handleMouseMove}
      >
        {/* ── Poster layer ── */}
        {hasPoster && (
          <>
            <img
              src={posterUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: "center 20%" }}
              onError={() => setImgError(true)}
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: isCyber
                  ? `linear-gradient(to top, ${(THEMES[category].cyber as typeof THEMES["japanese"]["cyber"]).gradFrom} 0%, rgba(0,0,0,0.78) 45%, rgba(0,0,0,0.15) 100%)`
                  : `linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0.08) 100%)`,
              }}
            />
          </>
        )}

        {/* ── Cultural decorative overlay ── */}
        <CulturalOverlay category={category} isCyber={isCyber} />

        {/* ── Top accent strip ── */}
        {isCyber ? (
          <motion.div
            className="absolute top-0 left-0 right-0 z-10"
            style={{ height: "1.5px", background: `linear-gradient(90deg, transparent, ${accent}, ${accent2}, transparent)` }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          />
        ) : (
          <div
            className="absolute top-0 left-0 right-0 z-10"
            style={{ height: "3px", background: `linear-gradient(90deg, ${accent} 0%, ${accent2} 100%)` }}
          />
        )}

        {/* ── Content ── */}
        <div className="relative z-20 p-4 flex flex-col gap-2 h-full" style={{ minHeight: "230px" }}>

          {/* Title + status badge */}
          <div className="flex items-start justify-between gap-2">
            <h3
              className="font-black text-sm leading-snug flex-1"
              style={{ color: hasPoster ? "#fff" : cardText }}
            >
              {title}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
              {/* Clickable status badge */}
              <motion.button
                onClick={handleStatusCycle}
                whileTap={{ scale: 0.9 }}
                title="Click to cycle status"
                className="text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap select-none cursor-pointer"
                style={{
                  backgroundColor: `${statusColor}22`,
                  color: statusColor,
                  border: `1.5px solid ${statusColor}55`,
                }}
              >
                {localStatus}
              </motion.button>
              {/* Lock icon for read-only */}
              {!isEditable && (
                <span className="text-[9px] opacity-35 select-none" title="OMDb import — read only">🔒</span>
              )}
              {/* Delete button */}
              {onDelete && (
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                  className="text-[10px] opacity-25 hover:opacity-90 transition-opacity"
                  title="Remove"
                >🗑️</motion.button>
              )}
            </div>
          </div>

          {/* Genre / year / platform tags */}
          <div className="flex flex-wrap gap-1">
            {[genre, year ? String(year) : null, platform]
              .filter(Boolean)
              .map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] px-1.5 py-0.5 rounded-md"
                  style={{
                    background: hasPoster ? "rgba(255,255,255,0.12)" : (isCyber ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"),
                    color: hasPoster ? "rgba(255,255,255,0.75)" : (isCyber ? "#94A3B8" : "#6B7280"),
                  }}
                >{tag}</span>
              ))}
          </div>

          {/* HOF Stars tags */}
          {hofStars && hofStars.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hofStars.slice(0, 3).map((star) => (
                <span
                  key={star.id}
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded border"
                  style={{
                    borderColor: `${accent}50`,
                    color: hasPoster ? "#fff" : accent,
                    background: `${accent}10`,
                  }}
                  title={star.tokusatsuFranchise ? `${star.name} · ${star.tokusatsuFranchise}` : star.name}
                >
                  {star.tokusatsuFranchise === "Ultraman" ? "🔴 "
                    : star.tokusatsuFranchise === "Kamen Rider" ? "🟢 "
                    : star.tokusatsuFranchise ? "⚡ " : ""}
                  {star.name}
                </span>
              ))}
            </div>
          )}

          {/* Star rating */}
          <div className="flex gap-0.5 items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                style={{
                  color: i < Math.round(rating / 2) ? accent : "rgba(128,128,128,0.25)",
                  fontSize: "10px",
                }}
              >★</span>
            ))}
            <span
              className="font-mono text-[10px] ml-1"
              style={{ color: hasPoster ? "rgba(255,255,255,0.6)" : accent, opacity: 0.9 }}
            >{rating}/10</span>
          </div>

          {/* Spacer */}
          <div className="flex-1 min-h-0" />

          {/* ── Progress bar + episode tracker ── */}
          <div className="mt-1">
            <div
              className="h-1.5 rounded-full overflow-hidden mb-1.5"
              style={{
                background: hasPoster
                  ? "rgba(255,255,255,0.15)"
                  : (isCyber ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.1)"),
              }}
            >
              <motion.div
                className="h-full rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: pct / 100 }}
                transition={{ type: "spring", stiffness: 65, damping: 18, delay: 0.2 + index * 0.04 }}
                style={{
                  transformOrigin: "left",
                  background: `linear-gradient(90deg, ${accent}, ${accent2})`,
                  boxShadow: isCyber ? `0 0 8px ${accent}` : "none",
                }}
              />
            </div>

            {/* Episode counter / stepper */}
            <div className="flex items-center justify-between min-h-[22px]">
              <span
                className="text-[10px] font-mono"
                style={{
                  color: hasPoster
                    ? "rgba(255,255,255,0.45)"
                    : (isCyber ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)"),
                }}
              >
                {localEps}/{totalEpisodes}&nbsp;{EP_LABELS[category]}
              </span>
              <span
                className="text-[10px] font-mono font-black tabular-nums"
                style={{ color: hasPoster ? "rgba(255,255,255,0.9)" : accent }}
              >{pct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Horizontal Pop-out Details Overlay ── */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
              x: popSide === "right" ? -25 : 25,
              rotateY: popSide === "right" ? -15 : 15,
            }}
            animate={{ opacity: 1, scale: 1, x: 0, rotateY: 0 }}
            exit={{
              opacity: 0,
              scale: 0.9,
              x: popSide === "right" ? -15 : 15,
              rotateY: popSide === "right" ? -10 : 10,
            }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className={`absolute z-50 p-4 flex flex-col gap-2 rounded-xl backdrop-blur-md overflow-visible
                       top-0 bottom-0 left-0 right-0 md:bottom-auto md:min-h-full md:w-[280px]
                       ${
                         popSide === "right"
                           ? "md:left-[103%] md:right-auto"
                           : "md:right-[103%] md:left-auto"
                       }`}
            style={{
              transformOrigin: popSide === "right" ? "left center" : "right center",
              perspective: 1200,
              background: isCyber
                ? `rgba(${(THEMES[category].cyber as any).gradFrom === "rgba(5,8,22,0.96)" ? "5,8,22" : "13,6,22"}, 0.96)`
                : "rgba(255, 255, 255, 0.99)",
              border: isCyber ? `1px solid ${accent}70` : `2.5px solid ${accent}`,
              boxShadow: isCyber
                ? `0 0 35px ${accent}45, 0 12px 30px rgba(0,0,0,0.5)`
                : "6px 6px 0 #000",
            }}
          >
            {/* Pop-down select status dropdown */}
            <div className="flex justify-between items-center shrink-0">
              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); }}
                  className="text-[9px] font-black px-2.5 py-1 rounded-lg select-none cursor-pointer flex items-center gap-1 uppercase tracking-wider"
                  style={{
                    backgroundColor: `${statusColor}22`,
                    color: statusColor,
                    border: `1.5px solid ${statusColor}55`,
                  }}
                  title="Change status category"
                >
                  <span>{localStatus}</span>
                  <span className="text-[7px]">▼</span>
                </motion.button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 mt-1.5 z-[60] w-36 rounded-lg py-1 shadow-2xl text-[10px]"
                      style={{
                        background: isCyber ? "#0D111A" : "#FFF",
                        border: isCyber ? `1px solid ${accent}50` : "2px solid #000",
                        boxShadow: isCyber ? `0 0 15px ${accent}30` : "3px 3px 0 #000",
                      }}
                    >
                      {STATUS_CYCLE.map((st) => {
                        const sCol = (STATUS_COLORS[st as keyof typeof STATUS_COLORS] || { cyber: "#94a3b8", brutal: "#6B7280" });
                        const bulletColor = isCyber ? sCol.cyber : sCol.brutal;
                        return (
                          <button
                            key={st}
                            onClick={(e) => {
                              e.stopPropagation();
                              setLocalStatus(st);
                              onStatusChange?.(id, st);
                              setDropdownOpen(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-white/5 transition-all text-xs font-bold"
                            style={{
                              color: isCyber ? "#CBD5E1" : "#222",
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: bulletColor }} />
                            <span>{st}</span>
                            {localStatus === st && (
                              <span className="ml-auto text-[8px]" style={{ color: accent }}>✓</span>
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <span className="text-[10px] font-mono font-black" style={{ color: accent }}>
                ★ {rating}/10
              </span>
            </div>

            <div className="min-w-0 shrink-0">
              <h4 className="font-black text-sm leading-tight truncate" style={{ color: isCyber ? "#fff" : "#1A1A1A" }}>
                {title}
              </h4>
              <p className="text-[9px] opacity-60 font-mono mt-0.5" style={{ color: isCyber ? "#94A3B8" : "#555" }}>
                {year ? `${year} · ` : ""}{genre || ""}
              </p>
            </div>

            <div className="h-px w-full shrink-0" style={{ background: isCyber ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }} />

            {/* Synopsis / Cast */}
            <div className="flex-1 text-[10px] leading-relaxed overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-rounded" style={{ color: isCyber ? "#CBD5E1" : "#333" }}>
              {synopsis || (cast && cast.length > 0 ? `Cast: ${cast.join(" · ")}` : "No synopsis loaded for this title.")}
            </div>

            {/* Stepper + Progress */}
            <div className="my-1 shrink-0">
              <div className="flex items-center justify-between mb-1">
                {isEditable ? (
                  <EpisodeStepper
                    watched={localEps}
                    total={totalEpisodes}
                    category={category}
                    isCyber={isCyber}
                    accent={accent}
                    onChange={handleEpisodeChange}
                  />
                ) : (
                  <span className="text-[10px] font-mono opacity-50">
                    {localEps}/{totalEpisodes} {EP_LABELS[category]}
                  </span>
                )}
                <span className="text-[10px] font-mono font-black" style={{ color: accent }}>{pct}%</span>
              </div>
            </div>

            {/* View details action button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails();
              }}
              className="w-full py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer mt-auto"
              style={{
                background: isCyber ? `linear-gradient(135deg, ${accent}, ${accent2})` : accent,
                color: "#fff",
                border: isCyber ? "none" : "2px solid #000",
                boxShadow: isCyber ? `0 0 10px ${accent}40` : "2px 2px 0 #000",
              }}
            >
              <span>View Details</span>
              <span>➔</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
