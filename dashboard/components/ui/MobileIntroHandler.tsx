"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";

export function MobileIntroHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined" || isLoading) return;

    const isMobile =
      window.innerWidth < 768 ||
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.matchMedia("(display-mode: standalone)").matches;

    // Authenticated mobile users on /welcome automatically enter Dashboard "/"
    if (isAuthenticated && isMobile && pathname === "/welcome") {
      router.replace("/");
      return;
    }

    // Unauthenticated mobile users on root "/" are directed to public intro "/welcome"
    if (!isAuthenticated && isMobile && pathname === "/") {
      router.replace("/welcome");
    }
  }, [pathname, router, isAuthenticated, isLoading]);

  return null;
}
