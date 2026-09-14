import { useEffect, useMemo } from "react";
import { create } from "zustand";
import { useDashboardStore } from "@/lib/store/dashboardStore";

export const CREATURE_ROTATION_INTERVAL_MS = 9000;

// Deterministic fast integer hash for reproducible slot-based random selection
function getSlotHash(slot: number): number {
  let h = (slot ^ 0x9e3779b9) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

function getNonRepeatingSlotIndex(slot: number, count: number): number {
  if (count <= 1) return 0;
  const prev = getSlotHash(slot - 1) % count;
  let curr = getSlotHash(slot) % count;
  if (curr === prev) {
    curr = (curr + 1) % count;
  }
  return curr;
}

interface CreatureHighlightStoreState {
  currentSlot: number;
  manualOffset: number;
  historyIds: string[];
  isPaused: boolean;
  rotationKey: number;
  tickSlot: (slot: number) => void;
  pickNext: () => void;
  pickPrev: () => void;
  setIsPaused: (paused: boolean) => void;
  pushHistory: (id: string) => void;
}

export const useCreatureHighlightStore = create<CreatureHighlightStoreState>((set) => ({
  currentSlot: typeof window !== "undefined" ? Math.floor(Date.now() / CREATURE_ROTATION_INTERVAL_MS) : 0,
  manualOffset: 0,
  historyIds: [],
  isPaused: false,
  rotationKey: 0,

  tickSlot: (newSlot) => {
    set((state) => {
      if (state.currentSlot === newSlot) return state;
      return {
        currentSlot: newSlot,
        rotationKey: state.rotationKey + 1,
      };
    });
  },

  pickNext: () => {
    set((state) => ({
      manualOffset: state.manualOffset + 1,
      rotationKey: state.rotationKey + 1,
    }));
  },

  pickPrev: () => {
    set((state) => ({
      manualOffset: state.manualOffset - 1,
      rotationKey: state.rotationKey + 1,
    }));
  },

  setIsPaused: (paused) => set({ isPaused: paused }),

  pushHistory: (id) =>
    set((state) => {
      const existing = state.historyIds.filter((h) => h !== id);
      return {
        historyIds: [...existing.slice(-4), id],
      };
    }),
}));

/**
 * Canonical hook for live Creature Highlight synchronization.
 * Both the Dashboard Creature Spotlight and the Creatures Bestiary Spotlight
 * consume this exact same hook to guarantee identical live rotation states.
 */
export function useLiveCreatureHighlight() {
  const creatures = useDashboardStore((s) => s.creatures || []);
  const currentSlot = useCreatureHighlightStore((s) => s.currentSlot);
  const manualOffset = useCreatureHighlightStore((s) => s.manualOffset);
  const isPaused = useCreatureHighlightStore((s) => s.isPaused);
  const rotationKey = useCreatureHighlightStore((s) => s.rotationKey);
  const tickSlot = useCreatureHighlightStore((s) => s.tickSlot);
  const pickNextStore = useCreatureHighlightStore((s) => s.pickNext);
  const pickPrevStore = useCreatureHighlightStore((s) => s.pickPrev);
  const setIsPaused = useCreatureHighlightStore((s) => s.setIsPaused);
  const pushHistory = useCreatureHighlightStore((s) => s.pushHistory);

  // Global synchronized wall-clock timer
  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeoutId: NodeJS.Timeout;

    const scheduleNextTick = () => {
      const now = Date.now();
      const nextTick = Math.ceil(now / CREATURE_ROTATION_INTERVAL_MS) * CREATURE_ROTATION_INTERVAL_MS;
      const delay = Math.max(50, nextTick - now);

      timeoutId = setTimeout(() => {
        const slot = Math.floor(Date.now() / CREATURE_ROTATION_INTERVAL_MS);
        if (!useCreatureHighlightStore.getState().isPaused) {
          tickSlot(slot);
        }
        scheduleNextTick();
      }, delay);
    };

    scheduleNextTick();
    return () => clearTimeout(timeoutId);
  }, [tickSlot]);

  // Compute canonical active creature
  const activeCreature = useMemo(() => {
    if (!creatures || creatures.length === 0) return null;
    if (creatures.length === 1) return creatures[0];

    const effectiveSlot = currentSlot + manualOffset;
    const index = getNonRepeatingSlotIndex(effectiveSlot, creatures.length);
    return creatures[index] || creatures[0];
  }, [creatures, currentSlot, manualOffset]);

  // Track history for anti-repeat auditing
  useEffect(() => {
    if (activeCreature) {
      pushHistory(activeCreature.id);
    }
  }, [activeCreature, pushHistory]);

  const pickNextRandom = () => {
    pickNextStore();
  };

  const pickPrev = () => {
    pickPrevStore();
  };

  return {
    activeCreature,
    activeId: activeCreature ? activeCreature.id : null,
    pickNextRandom,
    pickPrev,
    isPaused,
    setIsPaused,
    rotationKey,
  };
}
