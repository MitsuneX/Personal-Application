"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface OverlayContextType {
  activeOverlays: string[];
  registerOverlay: (id: string) => void;
  unregisterOverlay: (id: string) => void;
  isTopOverlay: (id: string) => boolean;
}

const OverlayContext = createContext<OverlayContextType>({
  activeOverlays: [],
  registerOverlay: () => {},
  unregisterOverlay: () => {},
  isTopOverlay: () => false,
});

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const [activeOverlays, setActiveOverlays] = useState<string[]>([]);

  const registerOverlay = useCallback((id: string) => {
    setActiveOverlays((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const unregisterOverlay = useCallback((id: string) => {
    setActiveOverlays((prev) => prev.filter((item) => item !== id));
  }, []);

  const isTopOverlay = useCallback(
    (id: string) => {
      if (activeOverlays.length === 0) return false;
      return activeOverlays[activeOverlays.length - 1] === id;
    },
    [activeOverlays]
  );

  // Manage body overflow when modals/dialogs are open
  useEffect(() => {
    if (activeOverlays.length > 0) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [activeOverlays.length]);

  return (
    <OverlayContext.Provider
      value={{
        activeOverlays,
        registerOverlay,
        unregisterOverlay,
        isTopOverlay,
      }}
    >
      {children}
    </OverlayContext.Provider>
  );
}

export function useOverlay() {
  return useContext(OverlayContext);
}
