/**
 * Standardized Application-Wide Z-Index Hierarchy
 */
export const Z_INDEX = {
  BASE: 0,
  SIDEBAR: 40,
  HEADER: 45,
  DROPDOWN: 1000,
  POPOVER: 1100,
  DRAWER: 1200,
  MODAL: 1300,
  TOAST: 1400,
  TOOLTIP: 1500,
  SYSTEM_OVERLAY: 9999,
} as const;

export interface ViewportRect {
  width: number;
  height: number;
  scrollTop: number;
  scrollLeft: number;
  sidebarWidth: number;
  safeMargin: number;
  isMobile: boolean;
}

/**
 * Get current viewport boundaries and device dimensions
 */
export function getViewportRect(safeMargin = 12): ViewportRect {
  if (typeof window === "undefined") {
    return {
      width: 1280,
      height: 800,
      scrollTop: 0,
      scrollLeft: 0,
      sidebarWidth: 0,
      safeMargin,
      isMobile: false,
    };
  }

  // Check custom sidebar CSS variable if available
  const sidebarVar = getComputedStyle(document.documentElement)
    .getPropertyValue("--sidebar-width")
    .trim();
  const sidebarWidth = sidebarVar ? parseFloat(sidebarVar) || 0 : 0;

  const width = window.innerWidth || document.documentElement.clientWidth || 0;
  const height = window.innerHeight || document.documentElement.clientHeight || 0;

  return {
    width,
    height,
    scrollTop: window.scrollY || document.documentElement.scrollTop || 0,
    scrollLeft: window.scrollX || document.documentElement.scrollLeft || 0,
    sidebarWidth,
    safeMargin,
    isMobile: width < 640,
  };
}
