"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  useFloating,
  useClick,
  useDismiss,
  useInteractions,
  FloatingPortal,
  offset,
  flip,
  shift,
  autoUpdate,
  Placement,
} from "@floating-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { ProfilePopoutCard } from "@/components/profile/ProfilePopoutCard";

export interface ProfilePopoutTriggerProps {
  children: React.ReactNode;
  placement?: Placement;
  onOpenAesthetics?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function ProfilePopoutTrigger({
  children,
  placement = "bottom-end",
  onOpenAesthetics,
  className = "",
  style = {},
}: ProfilePopoutTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    middleware: [
      offset(10),
      flip({
        fallbackPlacements: ["top-end", "bottom-start", "top-start"],
        padding: 12,
      }),
      shift({ padding: 12 }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context, { toggle: true });
  const dismiss = useDismiss(context, { escapeKey: true, outsidePress: true });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  // Determine if mobile (< 640px) for bottom-sheet layout
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  const springTransition = {
    type: "spring" as const,
    stiffness: 420,
    damping: 30,
    mass: 0.8,
  };

  return (
    <>
      {/* Trigger element */}
      <div
        ref={refs.setReference}
        className={`inline-block ${className}`}
        style={{ cursor: "pointer", ...style }}
        {...getReferenceProps()}
      >
        {children}
      </div>

      {/* Floating popout rendered into portal */}
      <FloatingPortal>
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Mobile backdrop */}
              {isMobile && (
                <motion.div
                  key="backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm sm:hidden"
                  style={{ zIndex: 1098 }}
                  onClick={() => setIsOpen(false)}
                />
              )}

              <motion.div
                key="popout"
                ref={refs.setFloating}
                style={
                  isMobile
                    ? {
                        position: "fixed",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1099,
                        maxHeight: "90vh",
                      }
                    : {
                        ...floatingStyles,
                        zIndex: 1099,
                        maxHeight: "calc(100vh - 32px)",
                      }
                }
                initial={
                  isMobile
                    ? { y: "100%", opacity: 0 }
                    : { opacity: 0, scale: 0.95, y: -6 }
                }
                animate={
                  isMobile
                    ? { y: 0, opacity: 1 }
                    : { opacity: 1, scale: 1, y: 0 }
                }
                exit={
                  isMobile
                    ? { y: "100%", opacity: 0 }
                    : { opacity: 0, scale: 0.95, y: -6 }
                }
                transition={springTransition}
                className={isMobile ? "rounded-t-3xl overflow-hidden" : ""}
                {...getFloatingProps()}
              >
                <ProfilePopoutCard
                  onOpenAesthetics={onOpenAesthetics}
                  onClose={() => setIsOpen(false)}
                  isMobile={isMobile}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </FloatingPortal>
    </>
  );
}
