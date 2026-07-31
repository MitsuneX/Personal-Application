"use client";

import { useState, useEffect, useCallback, RefObject } from "react";
import { computeFloatingPosition, Placement, CollisionResult } from "./CollisionDetector";

interface UseFloatingPositionOptions {
  triggerRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
  placement?: Placement;
  offset?: number;
  safeMargin?: number;
  virtualPoint?: { x: number; y: number } | null;
}

export function useFloatingPosition({
  triggerRef,
  isOpen,
  placement = "auto",
  offset = 8,
  safeMargin = 12,
  virtualPoint = null,
}: UseFloatingPositionOptions) {
  const [position, setPosition] = useState<CollisionResult>({
    top: 0,
    left: 0,
    maxHeight: 400,
    maxWidth: 320,
    actualPlacement: placement,
    transformOrigin: "top center",
  });

  const updatePosition = useCallback(
    (overlayElement?: HTMLElement | null) => {
      if (!isOpen) return;

      let triggerRect: { top: number; bottom: number; left: number; right: number; width: number; height: number };

      if (virtualPoint) {
        // Virtual point for right click / context menu
        triggerRect = {
          top: virtualPoint.y,
          bottom: virtualPoint.y + 1,
          left: virtualPoint.x,
          right: virtualPoint.x + 1,
          width: 1,
          height: 1,
        };
      } else if (triggerRef.current) {
        triggerRect = triggerRef.current.getBoundingClientRect();
      } else {
        return;
      }

      const overlaySize = overlayElement
        ? { width: overlayElement.offsetWidth, height: overlayElement.offsetHeight }
        : { width: 260, height: 300 };

      const computed = computeFloatingPosition(
        triggerRect,
        overlaySize,
        placement,
        offset,
        safeMargin
      );

      setPosition(computed);
    },
    [isOpen, virtualPoint, triggerRef, placement, offset, safeMargin]
  );

  useEffect(() => {
    if (!isOpen) return;

    let rafId: number;
    const handleScrollOrResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        updatePosition();
      });
    };

    window.addEventListener("resize", handleScrollOrResize, { passive: true });
    window.addEventListener("scroll", handleScrollOrResize, { passive: true, capture: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, { capture: true });
    };
  }, [isOpen, updatePosition]);

  return { position, updatePosition };
}
