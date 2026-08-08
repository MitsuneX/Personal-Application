"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function MobileIntroHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect mobile viewport bounds (320px - 768px)
    const isMobile = window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasSeenIntro = sessionStorage.getItem("mobile_intro_passed") === "true";

    // Direct mobile app startup at root "/" to cinematic intro page "/welcome"
    if (isMobile && !hasSeenIntro && pathname === "/") {
      router.replace("/welcome");
    }
  }, [pathname, router]);

  return null;
}
