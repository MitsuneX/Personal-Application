"use client";

import React, { useRef, useState } from "react";
import { FloatingLayer } from "./FloatingLayer";
import { Z_INDEX } from "./ViewportBoundary";
import { ProfilePopoutCard } from "@/components/profile/ProfilePopoutCard";

export interface ProfileHoverPopoverProps {
  children: React.ReactNode;
  placement?: "up" | "right" | "down-left";
  onOpenAesthetics?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function ProfileHoverPopover({
  children,
  placement = "right",
  onOpenAesthetics,
  className = "",
  style = {},
}: ProfileHoverPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setIsOpen(false), 200);
  };

  const targetPlacement =
    placement === "up" ? "top-start" : placement === "down-left" ? "bottom-end" : "right-start";

  return (
    <div
      ref={triggerRef}
      className={`inline-block ${className}`}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      <FloatingLayer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
        placement={targetPlacement}
        zIndex={Z_INDEX.POPOVER}
      >
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <ProfilePopoutCard
            isPopover={true}
            onOpenAesthetics={onOpenAesthetics}
            onClose={() => setIsOpen(false)}
          />
        </div>
      </FloatingLayer>
    </div>
  );
}
