import React from "react";

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode | string;
  shortcut?: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
  checked?: boolean;
}

export interface ContextMenuSection {
  title?: string;
  items: ContextMenuItem[];
}

export type ContextMenuOptions = ContextMenuItem[];
