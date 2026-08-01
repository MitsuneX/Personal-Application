"use client";

import { useContext } from "react";
import { ContextMenuContext } from "@/components/ui/ContextMenuProvider";

export function useContextMenu() {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error("useContextMenu must be used within a ContextMenuProvider");
  }
  return context;
}
