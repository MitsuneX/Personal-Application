"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface ConfirmPreview {
  title?: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  badge?: string;
  category?: string;
  tags?: string[];
}

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "success" | "neutral";
  actionType?: "delete" | "archive" | "reset" | "logout" | "restore" | "custom";
  itemPreview?: ConfirmPreview;
  onConfirm: () => Promise<void> | void;
  successToast?: string;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => void;
  closeConfirm: () => void;
  activeConfirm: ConfirmOptions | null;
  isOpen: boolean;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

const ConfirmContext = createContext<ConfirmContextValue | undefined>(undefined);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [activeConfirm, setActiveConfirm] = useState<ConfirmOptions | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const confirm = useCallback((options: ConfirmOptions) => {
    setActiveConfirm(options);
    setIsOpen(true);
    setIsLoading(false);
  }, []);

  const closeConfirm = useCallback(() => {
    setIsOpen(false);
    setIsLoading(false);
    setTimeout(() => {
      setActiveConfirm(null);
    }, 200);
  }, []);

  return (
    <ConfirmContext.Provider
      value={{
        confirm,
        closeConfirm,
        activeConfirm,
        isOpen,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}
