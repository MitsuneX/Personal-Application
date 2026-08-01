"use client";

import React, { createContext, useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ContextMenu, ContextMenuItem } from "@/components/ui/ContextMenu";

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
  title?: string;
}

export interface ContextMenuContextType {
  openContextMenu: (
    e: React.MouseEvent | MouseEvent | { clientX: number; clientY: number; preventDefault?: () => void },
    items: ContextMenuItem[],
    title?: string
  ) => void;
  closeContextMenu: () => void;
  isOpen: boolean;
}

export const ContextMenuContext = createContext<ContextMenuContextType | null>(null);

export function ContextMenuProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    items: [],
    title: undefined,
  });

  const closeContextMenu = useCallback(() => {
    setState((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
  }, []);

  const openContextMenu = useCallback(
    (
      e: React.MouseEvent | MouseEvent | { clientX: number; clientY: number; preventDefault?: () => void },
      items: ContextMenuItem[],
      title?: string
    ) => {
      if ("preventDefault" in e && typeof e.preventDefault === "function") {
        e.preventDefault();
      }
      setState({
        isOpen: true,
        x: e.clientX,
        y: e.clientY,
        items,
        title,
      });
    },
    []
  );

  // Auto-close on route change
  useEffect(() => {
    closeContextMenu();
  }, [pathname, closeContextMenu]);

  return (
    <ContextMenuContext.Provider value={{ openContextMenu, closeContextMenu, isOpen: state.isOpen }}>
      {children}
      <ContextMenu
        isOpen={state.isOpen}
        x={state.x}
        y={state.y}
        items={state.items}
        title={state.title}
        onClose={closeContextMenu}
      />
    </ContextMenuContext.Provider>
  );
}
