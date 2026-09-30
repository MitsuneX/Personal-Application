"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { getProtectedScopeForPath } from "./ContentLockConstants";
import { ContentLockScreen } from "./ContentLockScreen";

interface ContentLockGuardProps {
  children: React.ReactNode;
}

export function ContentLockGuard({ children }: ContentLockGuardProps) {
  const pathname = usePathname();
  const { contentLock, isHydrated } = useDashboardStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if current path belongs to any locked scope
  const lockedScope = getProtectedScopeForPath(pathname, contentLock.protectedScopes);

  // If content lock is enabled, user has not unlocked, and current page is protected
  const isProtectedAndLocked = Boolean(
    mounted &&
    contentLock.enabled &&
    !contentLock.isUnlocked &&
    lockedScope
  );

  if (isProtectedAndLocked && lockedScope) {
    return <ContentLockScreen scope={lockedScope} />;
  }

  return <>{children}</>;
}
