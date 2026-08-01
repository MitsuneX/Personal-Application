"use client";

import React, { useState, useEffect } from "react";
import {
  useFloating,
  useHover,
  useClick,
  useDismiss,
  useInteractions,
  FloatingPortal,
  offset as floatingOffset,
  flip,
  shift,
  size,
  autoUpdate,
  safePolygon,
  Placement,
  Strategy,
} from "@floating-ui/react";
import { AnimatePresence, motion } from "framer-motion";

export type PopoverTriggerMode = "hover" | "click" | "hover-or-click" | "manual";

export interface FloatingPopoverProps {
  children: React.ReactNode;
  content: React.ReactNode | ((props: { close: () => void }) => React.ReactNode);
  placement?: Placement;
  triggerMode?: PopoverTriggerMode;
  offsetDistance?: number;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  hoverDelayOpen?: number;
  hoverDelayClose?: number;
  mobileAsSheet?: boolean;
  className?: string;
  style?: React.CSSProperties;
  zIndex?: number;
  closeOnOutsideClick?: boolean;
  closeOnEsc?: boolean;
}

export function FloatingPopover({
  children,
  content,
  placement = "bottom-end",
  triggerMode = "hover-or-click",
  offsetDistance = 14,
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
  hoverDelayOpen = 120,
  hoverDelayClose = 250,
  mobileAsSheet = true,
  className = "",
  style = {},
  zIndex = 1099,
  closeOnOutsideClick = true,
  closeOnEsc = true,
}: FloatingPopoverProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen;

  const setIsOpen = (open: boolean) => {
    if (!isControlled) {
      setUncontrolledIsOpen(open);
    }
    controlledOnOpenChange?.(open);
  };

  // Determine if mobile (< 640px)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  const { refs, floatingStyles, context, x, y, middlewareData, isPositioned } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    strategy: "fixed" as Strategy,
    middleware: [
      floatingOffset(offsetDistance),
      flip({
        fallbackPlacements: ["bottom-end", "bottom-start", "top-end", "top-start", "right-start", "left-start"],
        padding: 16,
      }),
      shift({ padding: 16 }),
      size({
        padding: 16,
        apply({ availableWidth, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            maxWidth: `${Math.min(availableWidth, 420)}px`,
            maxHeight: `${Math.min(availableHeight, window.innerHeight - 32)}px`,
          });
        },
      }),
    ],
    whileElementsMounted: (reference, floating, update) => {
      // DIAGNOSTIC 1: track autoUpdate lifecycle
      console.log("[DIAG-1] autoUpdate STARTED", {
        referenceTagName: (reference as HTMLElement).tagName,
        floatingTagName: (floating as HTMLElement).tagName,
      });
      const cleanup = autoUpdate(reference, floating, update, {
        ancestorScroll: true,
        ancestorResize: true,
        elementResize: true,
        layoutShift: true,
        animationFrame: true,
      });
      return () => {
        console.log("[DIAG-1] autoUpdate STOPPED");
        cleanup();
      };
    },
  });

  // DIAGNOSTIC: log isPositioned / x / y whenever they change.
  // Safe: depends only on primitive values — no unstable object refs in deps.
  useEffect(() => {
    console.log("[DIAG-4] isPositioned / x / y changed", {
      isOpen,
      isPositioned,
      x,
      y,
      placement,
      middlewareData,
    });
  }, [isOpen, isPositioned, x, y, placement, middlewareData]);

  // DIAGNOSTIC: on open, snapshot bounding rects once the DOM has settled.
  // Safe: isOpen is a boolean dep, refs.reference/floating are stable callback refs.
  useEffect(() => {
    if (!isOpen) return;
    // Defer one tick so the floating element has been inserted by the portal
    const id = requestAnimationFrame(() => {
      const refRect = refs.reference.current?.getBoundingClientRect();
      const floatRect = refs.floating.current?.getBoundingClientRect();
      console.log("[DIAG-2] referenceRef.getBoundingClientRect()", {
        node: refs.reference.current,
        rect: refRect
          ? { top: refRect.top, left: refRect.left, width: refRect.width, height: refRect.height }
          : null,
        isValid: refRect ? refRect.width > 0 && refRect.height > 0 : false,
      });
      console.log("[DIAG-3] floatingRef.getBoundingClientRect()", {
        node: refs.floating.current,
        rect: floatRect
          ? { top: floatRect.top, left: floatRect.left, width: floatRect.width, height: floatRect.height }
          : null,
      });
    });
    return () => cancelAnimationFrame(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const isHoverEnabled = triggerMode === "hover" || triggerMode === "hover-or-click";
  const isClickEnabled = triggerMode === "click" || triggerMode === "hover-or-click";

  const hover = useHover(context, {
    enabled: isHoverEnabled && !isMobile,
    move: false,
    delay: { open: hoverDelayOpen, close: hoverDelayClose },
    handleClose: safePolygon({ buffer: 2, blockPointerEvents: true }),
  });

  const click = useClick(context, {
    enabled: isClickEnabled || isMobile,
    toggle: true,
  });

  const dismiss = useDismiss(context, {
    escapeKey: closeOnEsc,
    outsidePress: closeOnOutsideClick,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, click, dismiss]);

  const springTransition = {
    type: "spring" as const,
    stiffness: 420,
    damping: 30,
    mass: 0.8,
  };

  const isSheet = isMobile && mobileAsSheet;

  // ── TEST A: AnimatePresence ENABLED ──────────────────────────────────────────
  return (
    <>
      {/* Trigger reference element */}
      <div
        ref={refs.setReference}
        className={`inline-block ${className}`}
        style={{ cursor: "pointer", ...style }}
        {...getReferenceProps()}
      >
        {children}
      </div>

      {/* Floating portal */}
      <FloatingPortal>
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Mobile backdrop */}
              {isSheet && (
                <motion.div
                  key="backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm sm:hidden"
                  style={{ zIndex: zIndex - 1 }}
                  onClick={() => setIsOpen(false)}
                />
              )}

              {/* Outer plain div: owned by Floating UI.
                  Must NOT be a motion.div — Framer Motion would overwrite the transform. */}
              <div
                key="popover-content"
                ref={refs.setFloating}
                style={
                  isSheet
                    ? {
                        position: "fixed",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex,
                        maxHeight: "90vh",
                      }
                    : {
                        ...floatingStyles,
                        zIndex,
                      }
                }
                {...getFloatingProps()}
              >
                {/* Inner motion.div: only handles opacity/scale animation — no x/y/transform */}
                <motion.div
                  initial={
                    isSheet
                      ? { y: "100%", opacity: 0 }
                      : { opacity: 0, scale: 0.95 }
                  }
                  animate={
                    isSheet
                      ? { y: 0, opacity: 1 }
                      : { opacity: 1, scale: 1 }
                  }
                  exit={
                    isSheet
                      ? { y: "100%", opacity: 0 }
                      : { opacity: 0, scale: 0.95 }
                  }
                  transition={springTransition}
                  className={isSheet ? "rounded-t-3xl overflow-hidden" : ""}
                >
                  {typeof content === "function" ? content({ close: () => setIsOpen(false) }) : content}
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </FloatingPortal>
    </>
  );
}
