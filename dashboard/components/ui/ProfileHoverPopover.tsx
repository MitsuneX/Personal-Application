"use client";

/**
 * ProfileHoverPopover — Backward-compatible adapter.
 *
 * Previously powered by a custom FloatingLayer + mouse-hover system.
 * Now delegates to ProfilePopoutTrigger (Floating UI, click-only).
 *
 * Kept so existing import paths in Sidebar and Header don't need changing.
 */

import React from "react";
import { Placement } from "@floating-ui/react";
import { ProfilePopoutTrigger } from "@/components/profile/ProfilePopoutTrigger";

export interface ProfileHoverPopoverProps {
  children: React.ReactNode;
  /**
   * Legacy placement tokens → Floating UI placement mapping.
   * "up"        → "top-start"   (Sidebar expanded)
   * "right"     → "right-start" (Sidebar collapsed)
   * "down-left" → "bottom-end"  (Header)
   */
  placement?: "up" | "right" | "down-left";
  onOpenAesthetics?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const PLACEMENT_MAP: Record<string, Placement> = {
  up: "top-start",
  right: "right-start",
  "down-left": "bottom-end",
};

export function ProfileHoverPopover({
  children,
  placement = "right",
  onOpenAesthetics,
  className = "",
  style = {},
}: ProfileHoverPopoverProps) {
  const floatingPlacement = PLACEMENT_MAP[placement] ?? "bottom-end";

  return (
    <ProfilePopoutTrigger
      placement={floatingPlacement}
      onOpenAesthetics={onOpenAesthetics}
      className={className}
      style={style}
    >
      {children}
    </ProfilePopoutTrigger>
  );
}

export default ProfileHoverPopover;
