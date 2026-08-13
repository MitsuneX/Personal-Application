"use client";

import React, { useState, useEffect, useRef } from "react";
import { VideoFraming } from "@/lib/utils/mediaResolver";

interface LazyCardVideoProps {
  videoUrl: string;
  posterUrl?: string | null;
  framing?: VideoFraming;
  alt?: string;
  className?: string;
  onError?: () => void;
}

export function LazyCardVideo({
  videoUrl,
  posterUrl,
  framing = { x: 0, y: 0, zoom: 1, aspect: 0.75 },
  alt = "Character video preview",
  className = "w-full h-full object-cover object-top",
  onError,
}: LazyCardVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  // ── IntersectionObserver for viewport lazy loading ──────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
        } else {
          setIsInView(false);
          setIsVideoReady(false); // Pause/unload playback state when out of view
        }
      },
      { rootMargin: "150px 0px", threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Transform calculations for non-destructive framing ─────────────────────
  const transformStyle: React.CSSProperties = {
    transform: `translate(${framing.x}%, ${framing.y}%) scale(${framing.zoom})`,
    transformOrigin: "center center",
  };

  const handleVideoError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-black/40">
      {/* ── Poster Image (Initial load & fallback) ────────────────────────── */}
      {posterUrl && !hasError && (
        <img
          src={posterUrl}
          alt={alt}
          style={transformStyle}
          className={`absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-opacity duration-300 ${
            isVideoReady ? "opacity-0" : "opacity-100"
          }`}
          draggable={false}
        />
      )}

      {/* ── Lazy Video Player (Active only when in viewport) ──────────────── */}
      {isInView && !hasError && (
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          onCanPlay={() => setIsVideoReady(true)}
          onLoadedData={() => setIsVideoReady(true)}
          onError={handleVideoError}
          style={transformStyle}
          className={`w-full h-full object-cover object-center pointer-events-none transition-opacity duration-300 ${
            isVideoReady ? "opacity-100" : "opacity-0"
          } ${className}`}
          draggable={false}
        />
      )}
    </div>
  );
}
