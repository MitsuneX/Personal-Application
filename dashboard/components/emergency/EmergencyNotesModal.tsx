"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import type { EmergencyContact } from "./EmergencyContactCard";

interface EmergencyNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: EmergencyContact | null;
  isCyber: boolean;
}

export function EmergencyNotesModal({
  isOpen,
  onClose,
  contact,
  isCyber,
}: EmergencyNotesModalProps) {
  if (!contact) return null;

  const border = isCyber ? "rgba(0, 245, 255, 0.3)" : "#000000";
  const textPrimary = isCyber ? "#00F5FF" : "#000000";
  const boxBg = isCyber ? "rgba(0, 0, 0, 0.5)" : "#F9FAFB";

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="p-5 space-y-4 select-none text-xs" style={{ color: isCyber ? "#E0FFFF" : "#000" }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: border }}>
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <div>
              <h3 className="font-black text-sm uppercase tracking-wide truncate" style={{ color: textPrimary }}>
                Emergency Notes
              </h3>
              <p className="text-[10px] opacity-70 truncate font-semibold">
                {contact.name} ({contact.relationship || contact.category})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-sm opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>

        {/* Notes Content Box */}
        <div className="p-4 rounded-xl border space-y-2 whitespace-pre-wrap font-mono leading-relaxed bg-black/10" style={{ backgroundColor: boxBg, borderColor: border }}>
          {contact.notes ? (
            contact.notes
          ) : (
            <span className="opacity-40 italic">No private emergency notes recorded for this contact.</span>
          )}
        </div>

        {/* Quick Contact Snippet */}
        <div className="flex items-center justify-between text-[10px] opacity-75 font-semibold pt-1 border-t" style={{ borderColor: border }}>
          {contact.phoneNumber && <span>📞 {contact.phoneNumber}</span>}
          {contact.address && <span>📍 {contact.address}</span>}
        </div>
      </div>
    </Modal>
  );
}
