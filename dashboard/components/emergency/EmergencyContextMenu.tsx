"use client";

import React, { useEffect, useRef } from "react";
import type { EmergencyContact } from "./EmergencyContactCard";

interface EmergencyContextMenuProps {
  contact: EmergencyContact | null;
  x: number;
  y: number;
  onClose: () => void;
  onEdit?: (contact: EmergencyContact) => void;
  onDuplicate?: (contact: EmergencyContact) => void;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string, current: boolean) => void;
  onOpenNotes?: (contact: EmergencyContact) => void;
  onAddContact?: () => void;
  onImportContacts?: () => void;
  onExportContacts?: () => void;
  onRefresh?: () => void;
  isCyber: boolean;
}

export function EmergencyContextMenu({
  contact,
  x,
  y,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
  onOpenNotes,
  onAddContact,
  onImportContacts,
  onExportContacts,
  onRefresh,
  isCyber,
}: EmergencyContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click or ESC key
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("mousedown", handleOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const border = isCyber ? "rgba(0, 245, 255, 0.4)" : "#000000";
  const bg = isCyber ? "rgba(5, 8, 22, 0.96)" : "#FFFFFF";
  const textPrimary = isCyber ? "#E0FFFF" : "#000000";

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[200px] p-1.5 rounded-xl border shadow-2xl backdrop-blur-xl text-xs select-none space-y-1"
      style={{
        top: typeof window !== "undefined" ? Math.min(y, window.innerHeight - 380) : y,
        left: typeof window !== "undefined" ? Math.min(x, window.innerWidth - 220) : x,
        backgroundColor: bg,
        borderColor: border,
        borderWidth: isCyber ? "1px" : "2.5px",
        boxShadow: isCyber ? "0 0 25px rgba(0,245,255,0.25)" : "4px 4px 0px #000000",
        color: textPrimary,
      }}
    >
      {contact ? (
        /* Target Contact Menu */
        <>
          <div className="px-2 py-1 border-b mb-1 font-bold text-[10px] uppercase tracking-wider opacity-60 truncate" style={{ borderColor: border }}>
            🚨 {contact.name}
          </div>

          {contact.phoneNumber && (
            <a
              href={`tel:${contact.phoneNumber}`}
              onClick={onClose}
              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 font-bold block"
            >
              <span>📞</span> Call ({contact.phoneNumber})
            </a>
          )}

          {(contact.whatsappNumber || contact.phoneNumber) && (
            <a
              href={`https://wa.me/${(contact.whatsappNumber || contact.phoneNumber || "").replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 font-bold block text-emerald-400"
            >
              <span>💬</span> Open WhatsApp
            </a>
          )}

          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              onClick={onClose}
              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 font-bold block"
            >
              <span>✉</span> Send Email
            </a>
          )}

          {contact.website && (
            <a
              href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 font-bold block"
            >
              <span>🌐</span> Visit Website
            </a>
          )}

          {contact.address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 font-bold block"
            >
              <span>📍</span> Open Maps
            </a>
          )}

          <div className="border-t my-1" style={{ borderColor: border }} />

          {onToggleFavorite && (
            <button
              onClick={() => {
                onToggleFavorite(contact.id, contact.favorite);
                onClose();
              }}
              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 font-bold"
            >
              <span>{contact.favorite ? "☆" : "⭐"}</span> {contact.favorite ? "Unfavorite" : "Favorite"}
            </button>
          )}

          {onOpenNotes && (
            <button
              onClick={() => {
                onOpenNotes(contact);
                onClose();
              }}
              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 font-bold"
            >
              <span>📝</span> View Notes
            </button>
          )}

          {onEdit && (
            <button
              onClick={() => {
                onEdit(contact);
                onClose();
              }}
              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 font-bold"
            >
              <span>✏️</span> Edit Contact
            </button>
          )}

          {onDuplicate && (
            <button
              onClick={() => {
                onDuplicate(contact);
                onClose();
              }}
              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 font-bold"
            >
              <span>📄</span> Duplicate
            </button>
          )}

          {contact.phoneNumber && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(contact.phoneNumber || "");
                onClose();
              }}
              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 font-bold"
            >
              <span>📋</span> Copy Number
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => {
                onDelete(contact.id);
                onClose();
              }}
              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 font-bold text-red-400"
            >
              <span>🗑️</span> Delete Contact
            </button>
          )}
        </>
      ) : (
        /* Empty Workspace Menu */
        <>
          <div className="px-2 py-1 border-b mb-1 font-bold text-[10px] uppercase tracking-wider opacity-60">
            🚨 Emergency Workspace
          </div>

          {onAddContact && (
            <button
              onClick={() => {
                onAddContact();
                onClose();
              }}
              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 font-bold"
            >
              <span>➕</span> Add New Contact
            </button>
          )}

          {onImportContacts && (
            <button
              onClick={() => {
                onImportContacts();
                onClose();
              }}
              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 font-bold"
            >
              <span>📥</span> Import (vCard / CSV / JSON)
            </button>
          )}

          {onExportContacts && (
            <button
              onClick={() => {
                onExportContacts();
                onClose();
              }}
              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 font-bold"
            >
              <span>📤</span> Export Contacts
            </button>
          )}

          {onRefresh && (
            <button
              onClick={() => {
                onRefresh();
                onClose();
              }}
              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2 font-bold"
            >
              <span>🔄</span> Refresh Contacts
            </button>
          )}
        </>
      )}
    </div>
  );
}
