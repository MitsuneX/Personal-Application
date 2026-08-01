"use client";

import React from "react";
import { Placement } from "@floating-ui/react";
import { FloatingPopover, PopoverTriggerMode } from "@/components/ui/FloatingPopover";
import { ProfilePopoutCard } from "@/components/profile/ProfilePopoutCard";

export interface ProfilePopoutTriggerProps {
  children: React.ReactNode;
  placement?: Placement;
  triggerMode?: PopoverTriggerMode;
  onOpenAesthetics?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function ProfilePopoutTrigger({
  children,
  placement = "bottom-end",
  triggerMode = "hover-or-click",
  onOpenAesthetics,
  className = "",
  style = {},
}: ProfilePopoutTriggerProps) {
  return (
    <FloatingPopover
      placement={placement}
      triggerMode={triggerMode}
      offsetDistance={14}
      className={className}
      style={style}
      content={({ close }) => (
        <ProfilePopoutCard
          onOpenAesthetics={onOpenAesthetics}
          onClose={close}
        />
      )}
    >
      {children}
    </FloatingPopover>
  );
}
