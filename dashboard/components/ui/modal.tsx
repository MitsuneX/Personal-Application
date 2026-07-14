"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ModalProps {
  /** Controls visibility */
  isOpen: boolean;
  /** Called when backdrop is clicked */
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

// ─── Animation Variants ────────────────────────────────────────────────────────

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18, delay: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 340,
      damping: 28,
      delay: 0.04,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    y: 16,
    transition: { duration: 0.16 },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Global reusable Modal wrapper.
 *
 * - Always centered in the viewport via `fixed inset-0 flex items-center justify-center`
 * - Blurred backdrop with `bg-black/50 backdrop-blur-sm`
 * - Body scroll-lock while open
 * - Smooth Framer Motion enter/exit
 * - Dual-theme aware (brutal / cyber) via data-theme attribute on document root
 */
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

  // ── Body scroll-lock ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  // ── Backdrop click handler ──────────────────────────────────────────────────
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          // ── Outer overlay: fixed, full viewport, centered ──
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleBackdropClick}
          // Prevent scroll-through on iOS
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {/* ── Inner content card ── */}
          <motion.div
            className={`
              w-full ${maxWidth} max-h-[90vh] overflow-y-auto
              rounded-2xl
              ${className}
            `.trim()}
            style={{
              // Dual-theme card background
              background: isCyber
                ? "rgba(5, 8, 22, 0.97)"
                : "#FFFBF5",
              border: isCyber
                ? "1.5px solid rgba(0, 245, 255, 0.2)"
                : "2px solid rgba(0, 0, 0, 0.12)",
              boxShadow: isCyber
                ? "0 0 60px rgba(0, 245, 255, 0.12), 0 0 120px rgba(191, 95, 255, 0.06)"
                : "8px 8px 0px 0px rgba(0, 0, 0, 1)",
            }}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            // Prevent backdrop click from firing when clicking the card
            onClick={(e) => e.stopPropagation()}
            // Accessible dialog semantics
            role="dialog"
            aria-modal="true"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
