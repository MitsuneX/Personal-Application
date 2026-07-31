"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface OverlayPortalProps {
  children: React.ReactNode;
  containerId?: string;
}

export function OverlayPortal({ children, containerId = "overlay-root" }: OverlayPortalProps) {
  const [mounted, setMounted] = useState(false);
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    let elem = document.getElementById(containerId);
    if (!elem) {
      elem = document.createElement("div");
      elem.id = containerId;
      document.body.appendChild(elem);
    }
    setPortalNode(elem);
  }, [containerId]);

  if (!mounted || !portalNode) {
    return null;
  }

  return createPortal(children, portalNode);
}
