"use client";

import React, { useEffect, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { OverlayPortal } from "./OverlayPortal";
import { useOverlay } from "./OverlayProvider";
import { Z_INDEX } from "./ViewportBoundary";

export interface ModalProps {
  /** Controls visibility */
  isOpen: boolean;
  /** Called when backdrop is clicked or ESC is pressed */
  onClose: () => void;
  /** Modal content */
  children: React.ReactNode;
  /** Extra Tailwind classes applied to the inner content card */
  className?: string;
  /** Max width of the content card. Defaults to "max-w-2xl" */
  maxWidth?: string;
  /** Whether clicking the backdrop closes the modal. Defaults to true */
  closeOnBackdrop?: boolean;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18, delay: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 340,
      damping: 28,
      delay: 0.03,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    y: 14,
    transition: { duration: 0.16 },
  },
};

export function Modal({
  isOpen,
  onClose,
  children,
  className = "",
  maxWidth = "max-w-2xl",
  closeOnBackdrop = true,
}: ModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const modalId = useId();
  const { registerOverlay, unregisterOverlay, isTopOverlay } = useOverlay();

  useEffect(() => {
    if (isOpen) {
      registerOverlay(modalId);
      return () => {
        unregisterOverlay(modalId);
      };
    }
  }, [isOpen, modalId, registerOverlay, unregisterOverlay]);

  // Handle Escape Key for Top Overlay
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isTopOverlay(modalId)) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, modalId, isTopOverlay, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && e.target === e.currentTarget && isTopOverlay(modalId)) {
      onClose();
    }
  };

  return (
    <OverlayPortal>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            // Outer overlay container: fixed inset-0 centered in viewport
            className="fixed inset-0 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
            style={{
              zIndex: Z_INDEX.MODAL,
              backgroundColor: "rgba(0, 0, 0, 0.65)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleBackdropClick}
          >
            {/* Inner modal content card */}
            <motion.div
              className={`w-full ${maxWidth} max-h-[calc(100vh-32px)] sm:max-h-[calc(100vh-48px)] flex flex-col rounded-2xl overflow-hidden ${className}`.trim()}
              style={{
                background: isCyber
                  ? "rgba(5, 8, 22, 0.97)"
                  : "#FFFBF5",
                border: isCyber
                  ? "1.5px solid rgba(0, 245, 255, 0.25)"
                  : "2.5px solid #000000",
                boxShadow: isCyber
                  ? "0 0 60px rgba(0, 245, 255, 0.15), 0 0 120px rgba(191, 95, 255, 0.08)"
                  : "8px 8px 0px 0px rgba(0, 0, 0, 1)",
              }}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </OverlayPortal>
  );
}
