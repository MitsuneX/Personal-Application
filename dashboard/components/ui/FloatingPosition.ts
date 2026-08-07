"use client";

import { useState, useLayoutEffect, useEffect, useCallback, RefObject } from "react";
import { computeFloatingPosition, Placement, CollisionResult } from "./CollisionDetector";

interface UseFloatingPositionOptions {
  triggerRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
  placement?: Placement;
  offset?: number;
  safeMargin?: number;
  virtualPoint?: { x: number; y: number } | null;
}

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useFloatingPosition({
  triggerRef,
  isOpen,
  placement = "auto",
  offset = 8,
  safeMargin = 12,
  virtualPoint = null,
}: UseFloatingPositionOptions) {
  const [position, setPosition] = useState<CollisionResult>({
    top: -9999,
    left: -9999,
    maxHeight: 400,
    maxWidth: 320,
    actualPlacement: placement,
    transformOrigin: "top center",
  });
  const [isPositioned, setIsPositioned] = useState(false);

  const updatePosition = useCallback(
    (overlayElement?: HTMLElement | null) => {
      if (!isOpen) return;

      let triggerRect: { top: number; bottom: number; left: number; right: number; width: number; height: number };

      if (virtualPoint) {
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

      // If trigger is invisible or has no dimensions yet, wait
      if (!virtualPoint && triggerRect.width === 0 && triggerRect.height === 0 && triggerRect.top === 0 && triggerRect.left === 0) {
        return;
      }

      const overlaySize = overlayElement
        ? { width: overlayElement.offsetWidth, height: overlayElement.offsetHeight }
        : { width: Math.max(200, triggerRect.width), height: 260 };

      const computed = computeFloatingPosition(
        triggerRect,
        overlaySize,
        placement,
        offset,
        safeMargin
      );

      setPosition(computed);
      setIsPositioned(true);
    },
    [isOpen, virtualPoint, triggerRef, placement, offset, safeMargin]
  );

  // Synchronous layout calculation before browser paint
  useIsomorphicLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    } else {
      setIsPositioned(false);
    }
  }, [isOpen, updatePosition]);

  // Live scroll and resize event listeners with capture true
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

  return { position, updatePosition, isPositioned };
}
