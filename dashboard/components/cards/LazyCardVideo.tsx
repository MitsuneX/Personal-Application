"use client";

import React, { useState, useEffect, useRef } from "react";
import { VideoFraming, getVideoFramingStyle, VIDEO_FRAMING_MEDIA_CLASS } from "@/lib/utils/mediaResolver";

interface LazyCardVideoProps {
  videoUrl: string;
  posterUrl?: string | null;
  framing?: VideoFraming;
  posterFraming?: VideoFraming | null;
  alt?: string;
  className?: string;
  onError?: () => void;
}

export function LazyCardVideo({
  videoUrl,
  posterUrl,
  framing = { x: 0, y: 0, zoom: 1, aspect: 0.75 },
  posterFraming,
  alt = "Character video preview",
  className = "",
  onError,
}: LazyCardVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isNearView, setIsNearView] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  // ── 1. Preload & Retention Buffer Observer (300px preload / 600px retention) ───
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsNearView(true);
      setIsInViewport(true);
      return;
    }

    // Wide margin: keeps video mounted in DOM before entering and prevents thrashing on scroll
    const preloadObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsNearView(true);
        } else {
          // Only unmount if it's far outside the retention zone
          setIsNearView(false);
          setIsVideoReady(false);
        }
      },
      { rootMargin: "400px 0px", threshold: 0 }
    );

    // Tight margin: controls actual autoplay/pause state to conserve GPU
    const playbackObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsInViewport(entry.isIntersecting);

        if (videoRef.current) {
          if (entry.isIntersecting) {
            videoRef.current.play().catch(() => {
              // Ignore autoplay restrictions
            });
          } else {
            videoRef.current.pause();
          }
        }
      },
      { rootMargin: "50px 0px", threshold: 0.05 }
    );

    preloadObserver.observe(el);
    playbackObserver.observe(el);

    return () => {
      preloadObserver.disconnect();
      playbackObserver.disconnect();
    };
  }, []);

  // ── Unified Transform Calculation (Shared with VideoCropModal & Game Characters) ──
  const videoTransformStyle = getVideoFramingStyle(framing);
  const posterTransformStyle = getVideoFramingStyle(posterFraming || framing);

  const handleVideoError = () => {
    setHasError(true);
    onError?.();
  };

  const handleVideoReady = () => {
    setIsVideoReady(true);
    if (isInViewport && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-black select-none pointer-events-none">
      {/* ── Layer 0: Poster Image (Always visible fallback & initial placeholder) ── */}
      {posterUrl && (
        <img
          src={posterUrl}
          alt={alt}
          style={posterTransformStyle}
          className={`absolute inset-0 ${VIDEO_FRAMING_MEDIA_CLASS} transition-opacity duration-500 ease-in-out ${
            isVideoReady && !hasError ? "opacity-0" : "opacity-100"
          }`}
          draggable={false}
          loading="lazy"
        />
      )}

      {/* ── Layer 1: Lazy Video Player (Preloaded when near, active when in view) ── */}
      {isNearView && !hasError && (
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onCanPlay={handleVideoReady}
          onLoadedData={handleVideoReady}
          onPlaying={() => setIsVideoReady(true)}
          onError={handleVideoError}
          style={videoTransformStyle}
          className={`absolute inset-0 ${VIDEO_FRAMING_MEDIA_CLASS} transition-opacity duration-500 ease-in-out ${
            isVideoReady ? "opacity-100" : "opacity-0"
          } ${className}`}
          draggable={false}
        />
      )}
    </div>
  );
}
