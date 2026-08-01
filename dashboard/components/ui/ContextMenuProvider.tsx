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

  // Helper to open Global Navigation Context Menu
  const triggerGlobalNavMenu = useCallback(
    (coords: { clientX: number; clientY: number }) => {
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

      openContextMenu(
        { clientX: coords.clientX, clientY: coords.clientY, preventDefault: () => {} },
        globalMenuItems,
        "Global Navigation"
      );
    },
    [pathname, theme, setTheme, router, openContextMenu]
  );

  // Desktop Layer 2: Right-Click Fallback Listener
  useEffect(() => {
    const handleGlobalContextMenu = (e: MouseEvent) => {
      // 1. Layer 1 check: If an object card context menu already handled the event, skip!
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
      triggerGlobalNavMenu({ clientX: e.clientX, clientY: e.clientY });
    };

    window.addEventListener("contextmenu", handleGlobalContextMenu);
    return () => {
      window.removeEventListener("contextmenu", handleGlobalContextMenu);
    };
  }, [triggerGlobalNavMenu]);

  // Touch Long-Press Engine for Mobile & Tablet (450ms - 600ms)
  useEffect(() => {
    let touchTimer: NodeJS.Timeout | null = null;
    let startX = 0;
    let startY = 0;

    const cancelTouch = () => {
      if (touchTimer) {
        clearTimeout(touchTimer);
        touchTimer = null;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        cancelTouch();
        return;
      }

      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check if target is editable -> preserve native text selection
      const isEditable =
        target.closest(
          'input, textarea, select, [contenteditable="true"], .monaco-editor, .CodeMirror, .cm-editor, .rich-text-editor'
        ) !== null || target.isContentEditable;

      if (isEditable) {
        return;
      }

      // Check if target is inside an interactive card or action element
      const isInteractiveObject =
        target.closest(
          'a, button, [role="button"], [data-context-menu], input, textarea, select, [data-card="true"]'
        ) !== null;

      // Start 500ms touch long-press timer for mobile & tablet context menus
      cancelTouch();
      touchTimer = setTimeout(() => {
        if (isInteractiveObject) {
          // Dispatch contextmenu event on the target element for card/entity context menu!
          const contextEvent = new MouseEvent("contextmenu", {
            bubbles: true,
            cancelable: true,
            clientX: startX,
            clientY: startY,
          });
          target.dispatchEvent(contextEvent);
        } else {
          // Trigger Page-Level Context Menu on whitespace
          triggerGlobalNavMenu({ clientX: startX, clientY: startY });
        }
      }, 500); // 500ms long-press duration
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchTimer || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const dist = Math.hypot(touch.clientX - startX, touch.clientY - startY);

      // Cancel if finger moves more than ~10px or user starts scrolling/swiping
      if (dist > 10) {
        cancelTouch();
      }
    };

    const handleTouchEnd = () => {
      cancelTouch();
    };

    const handleScroll = () => {
      cancelTouch();
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelTouch();
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [triggerGlobalNavMenu]);

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
