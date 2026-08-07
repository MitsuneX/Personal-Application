"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OverlayPortal } from "./OverlayPortal";
import { useFloatingPosition } from "./FloatingPosition";
import { Placement } from "./CollisionDetector";
import { Z_INDEX, getViewportRect } from "./ViewportBoundary";

export interface FloatingLayerProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  placement?: Placement;
  offset?: number;
  virtualPoint?: { x: number; y: number } | null;
  zIndex?: number;
  className?: string;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  /** On small screens (<640px), render as a bottom action sheet */
  mobileAsSheet?: boolean;
}

export function FloatingLayer({
  isOpen,
  onClose,
  triggerRef,
  children,
  placement = "bottom-start",
  offset = 8,
  virtualPoint = null,
  zIndex = Z_INDEX.DROPDOWN,
  className = "",
  closeOnOutsideClick = true,
  closeOnEscape = true,
  mobileAsSheet = true,
}: FloatingLayerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const { position, updatePosition, isPositioned } = useFloatingPosition({
    triggerRef,
    isOpen,
    placement,
    offset,
    virtualPoint,
  });

  useEffect(() => {
    const vp = getViewportRect();
    setIsMobile(vp.isMobile);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update position after mount/render
  useEffect(() => {
    if (isOpen && overlayRef.current) {
      updatePosition(overlayRef.current);
    }
  }, [isOpen, updatePosition]);

  // Outside click & ESC listeners
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (!closeOnOutsideClick) return;
      const target = e.target as Node;
      if (
        overlayRef.current &&
        !overlayRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, triggerRef, closeOnOutsideClick, closeOnEscape]);

  const renderMobileSheet = isMobile && mobileAsSheet;

  return (
    <OverlayPortal>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile sheet or high-priority popover */}
            {renderMobileSheet && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
                style={{ zIndex: zIndex - 1 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs sm:hidden"
              />
            )}

            {/* Overlay Panel */}
            <motion.div
              ref={overlayRef}
              initial={
                renderMobileSheet
                  ? { y: "100%", opacity: 0 }
                  : { opacity: 0, scale: 0.95, y: position.actualPlacement.startsWith("top") ? 6 : -6 }
              }
              animate={
                renderMobileSheet
                  ? { y: 0, opacity: 1 }
                  : { opacity: 1, scale: 1, y: 0 }
              }
              exit={
                renderMobileSheet
                  ? { y: "100%", opacity: 0 }
                  : { opacity: 0, scale: 0.95, y: position.actualPlacement.startsWith("top") ? 4 : -4 }
              }
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={
                renderMobileSheet
                  ? {
                      position: "fixed",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      zIndex,
                      maxHeight: "85vh",
                    }
                  : {
                      position: "fixed",
                      top: position.top,
                      left: position.left,
                      maxHeight: position.maxHeight,
                      maxWidth: position.maxWidth,
                      transformOrigin: position.transformOrigin,
                      zIndex,
                      visibility: isPositioned ? "visible" : "hidden",
                    }
              }
              className={
                renderMobileSheet
                  ? `rounded-t-2xl p-4 overflow-y-auto ${className}`.trim()
                  : `overflow-y-auto scrollbar-thin ${className}`.trim()
              }
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </OverlayPortal>
  );
}
