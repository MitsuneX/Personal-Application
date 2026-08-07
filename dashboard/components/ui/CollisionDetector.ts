import { getViewportRect, ViewportRect } from "./ViewportBoundary";

export type Placement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end"
  | "center"
  | "auto";

export interface CollisionResult {
  top: number;
  left: number;
  maxHeight: number;
  maxWidth: number;
  actualPlacement: Placement;
  transformOrigin: string;
}

export function computeFloatingPosition(
  triggerRect: { top: number; bottom: number; left: number; right: number; width: number; height: number },
  overlaySize: { width: number; height: number },
  preferredPlacement: Placement = "auto",
  offset = 8,
  safeMargin = 12,
  customViewport?: ViewportRect
): CollisionResult {
  const viewport = customViewport || getViewportRect(safeMargin);
  const { width: vw, height: vh } = viewport;

  // Viewport-relative coordinates for position: fixed
  const triggerTop = triggerRect.top;
  const triggerBottom = triggerRect.bottom;
  const triggerLeft = triggerRect.left;
  const triggerRight = triggerRect.right;

  let placement = preferredPlacement;

  // Auto-detect optimal direction if auto
  if (placement === "auto") {
    const spaceBelow = vh - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    if (spaceBelow < overlaySize.height + offset && spaceAbove > spaceBelow) {
      placement = "top-start";
    } else {
      placement = "bottom-start";
    }
  }

  // Attempt initial placement
  let { top, left } = calculateRawCoords(
    placement,
    triggerTop,
    triggerBottom,
    triggerLeft,
    triggerRight,
    triggerRect,
    overlaySize,
    offset
  );

  // Check collision flip conditions
  const overlayRight = left + overlaySize.width;
  const overlayBottom = top + overlaySize.height;

  const minLeft = safeMargin;
  const maxRight = vw - safeMargin;
  const minTop = safeMargin;
  const maxBottom = vh - safeMargin;

  // Flip vertical if overflowing bottom/top
  if (placement.startsWith("bottom") && overlayBottom > maxBottom) {
    const spaceAbove = triggerRect.top - safeMargin;
    if (spaceAbove >= Math.min(overlaySize.height, 120)) {
      placement = placement.replace("bottom", "top") as Placement;
      ({ top, left } = calculateRawCoords(
        placement,
        triggerTop,
        triggerBottom,
        triggerLeft,
        triggerRight,
        triggerRect,
        overlaySize,
        offset
      ));
    }
  } else if (placement.startsWith("top") && top < minTop) {
    const spaceBelow = vh - triggerRect.bottom - safeMargin;
    if (spaceBelow >= Math.min(overlaySize.height, 120)) {
      placement = placement.replace("top", "bottom") as Placement;
      ({ top, left } = calculateRawCoords(
        placement,
        triggerTop,
        triggerBottom,
        triggerLeft,
        triggerRight,
        triggerRect,
        overlaySize,
        offset
      ));
    }
  }

  // Flip horizontal if overflowing right/left
  if (placement.startsWith("right") && overlayRight > maxRight) {
    placement = placement.replace("right", "left") as Placement;
    ({ top, left } = calculateRawCoords(
      placement,
      triggerTop,
      triggerBottom,
      triggerLeft,
      triggerRight,
      triggerRect,
      overlaySize,
      offset
    ));
  } else if (placement.startsWith("left") && left < minLeft) {
    placement = placement.replace("left", "right") as Placement;
    ({ top, left } = calculateRawCoords(
      placement,
      triggerTop,
      triggerBottom,
      triggerLeft,
      triggerRight,
      triggerRect,
      overlaySize,
      offset
    ));
  }

  // Clamp within viewport safe boundaries
  const clampedLeft = Math.max(minLeft, Math.min(left, maxRight - overlaySize.width));
  const clampedTop = Math.max(minTop, Math.min(top, maxBottom - overlaySize.height));

  const availableHeight = maxBottom - clampedTop;
  const availableWidth = maxRight - clampedLeft;

  const maxHeight = Math.max(120, Math.min(overlaySize.height, availableHeight));
  const maxWidth = Math.max(160, Math.min(overlaySize.width, availableWidth));

  const transformOrigin = getTransformOrigin(placement);

  return {
    top: clampedTop,
    left: clampedLeft,
    maxHeight,
    maxWidth,
    actualPlacement: placement,
    transformOrigin,
  };
}

function calculateRawCoords(
  placement: Placement,
  tTop: number,
  tBottom: number,
  tLeft: number,
  tRight: number,
  tRect: { width: number; height: number },
  oSize: { width: number; height: number },
  offset: number
) {
  let top = tBottom + offset;
  let left = tLeft;

  switch (placement) {
    case "top":
      top = tTop - oSize.height - offset;
      left = tLeft + (tRect.width - oSize.width) / 2;
      break;
    case "top-start":
      top = tTop - oSize.height - offset;
      left = tLeft;
      break;
    case "top-end":
      top = tTop - oSize.height - offset;
      left = tRight - oSize.width;
      break;
    case "bottom":
      top = tBottom + offset;
      left = tLeft + (tRect.width - oSize.width) / 2;
      break;
    case "bottom-start":
      top = tBottom + offset;
      left = tLeft;
      break;
    case "bottom-end":
      top = tBottom + offset;
      left = tRight - oSize.width;
      break;
    case "left":
      top = tTop + (tRect.height - oSize.height) / 2;
      left = tLeft - oSize.width - offset;
      break;
    case "left-start":
      top = tTop;
      left = tLeft - oSize.width - offset;
      break;
    case "left-end":
      top = tBottom - oSize.height;
      left = tLeft - oSize.width - offset;
      break;
    case "right":
      top = tTop + (tRect.height - oSize.height) / 2;
      left = tRight + offset;
      break;
    case "right-start":
      top = tTop;
      left = tRight + offset;
      break;
    case "right-end":
      top = tBottom - oSize.height;
      left = tRight + offset;
      break;
    case "center":
      top = tTop + (tRect.height - oSize.height) / 2;
      left = tLeft + (tRect.width - oSize.width) / 2;
      break;
  }

  return { top, left };
}

function getTransformOrigin(placement: Placement): string {
  if (placement.startsWith("top")) return "bottom center";
  if (placement.startsWith("bottom")) return "top center";
  if (placement.startsWith("left")) return "right center";
  if (placement.startsWith("right")) return "left center";
  return "center center";
}
