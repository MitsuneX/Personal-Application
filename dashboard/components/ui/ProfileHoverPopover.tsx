"use client";

import React from "react";
import { Placement } from "@floating-ui/react";
import { ProfilePopoutTrigger } from "@/components/profile/ProfilePopoutTrigger";

export interface ProfileHoverPopoverProps {
  children: React.ReactNode;
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
