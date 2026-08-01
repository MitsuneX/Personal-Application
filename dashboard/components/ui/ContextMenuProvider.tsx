"use client";

import React, { createContext, useState, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ContextMenu, ContextMenuItem } from "@/components/ui/ContextMenu";
import { useTheme } from "@/lib/theme";
import { buildGlobalNavigationMenu } from "@/lib/context-menu/builders";
import { useDashboardStore } from "@/lib/store/dashboardStore";

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
  const router = useRouter();
  const { theme, setTheme } = useTheme();

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

  // Layer 2: Global Navigation Context Menu Fallback
  useEffect(() => {
    const handleGlobalContextMenu = (e: MouseEvent) => {
      // 1. If an object-specific context menu already handled the event (Layer 1 claimed it), skip!
      if (e.defaultPrevented) {
        return;
      }

      // 2. Do NOT override native browser menu for editable elements
      const target = e.target as HTMLElement | null;
      if (target) {
        const isEditable =
          target.closest(
            'input, textarea, select, [contenteditable="true"], .monaco-editor, .CodeMirror, .cm-editor, .rich-text-editor'
          ) !== null || target.isContentEditable;

        if (isEditable) {
          return; // Allow native browser context menu
        }
      }

      // 3. Trigger Global Navigation Context Menu on empty background / whitespace
      e.preventDefault();

      const globalMenuItems = buildGlobalNavigationMenu({
        pathname: pathname || "/",
        theme,
        setTheme,
        router,
        logout: () => {
          try {
            useDashboardStore.getState().resetUserStore();
            document.cookie = "is_guest=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            localStorage.removeItem("is_guest");
          } catch (err) {}
          window.location.href = "/login";
        },
        openCommandPalette: () => {
          window.dispatchEvent(new CustomEvent("open-command-palette"));
        },
      });

      openContextMenu(e, globalMenuItems, "Global Navigation");
    };

    window.addEventListener("contextmenu", handleGlobalContextMenu);
    return () => {
      window.removeEventListener("contextmenu", handleGlobalContextMenu);
    };
  }, [pathname, theme, setTheme, router, openContextMenu]);

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
