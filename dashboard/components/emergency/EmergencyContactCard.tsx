"use client";

import React from "react";
import { motion } from "framer-motion";

export interface EmergencyContact {
  id: string;
  name: string;
  nickname?: string | null;
  relationship?: string | null;
  company?: string | null;
  category: string;
  phoneNumber?: string | null;
  whatsappNumber?: string | null;
  telegramUsername?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  avatar?: string | null;
  notes?: string | null;
  priority: string; // "HIGH" | "MEDIUM" | "LOW"
  favorite: boolean;
  available24Hours: boolean;
  country?: string | null;
  colorLabel?: string | null;
  lastContactedAt?: string | null;
  lastContactType?: string | null;
  birthday?: string | null;
  reminders?: any;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface EmergencyContactCardProps {
  contact: EmergencyContact;
  isCyber: boolean;
  onToggleFavorite: (id: string, current: boolean) => void;
  onActionClick: (id: string, actionType: "CALL" | "WHATSAPP" | "EMAIL") => void;
  onOpenNotes: (contact: EmergencyContact) => void;
  onEdit: (contact: EmergencyContact) => void;
  onContextMenu: (e: React.MouseEvent, contact: EmergencyContact) => void;
}

export const CATEGORY_ICONS: { [key: string]: string } = {
  Family: "👨‍👩‍👧‍👦",
  Friends: "🤝",
  Partner: "❤️",
  Hospital: "🏥",
  Police: "👮‍♂️",
  "Fire Department": "🚒",
  Ambulance: "🚑",
  Doctor: "🩺",
  Clinic: "💊",
  "Mental Health": "🧠",
  "Roadside Assistance": "🛞",
  Insurance: "🛡️",
  Work: "💼",
  School: "🎓",
  Security: "🚨",
  Utilities: "⚡",
  Other: "🏷️",
};

export function EmergencyContactCard({
  contact,
  isCyber,
  onToggleFavorite,
  onActionClick,
  onOpenNotes,
  onEdit,
  onContextMenu,
}: EmergencyContactCardProps) {
  const border = isCyber ? "rgba(0, 245, 255, 0.3)" : "#000000";
  const cardBg = isCyber ? "rgba(5, 8, 22, 0.85)" : "#FFFFFF";
  const textPrimary = isCyber ? "#E0FFFF" : "#000000";
  const textMuted = isCyber ? "#94A3B8" : "#666666";

  const isHighPriority = contact.priority === "HIGH";

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      onContextMenu={(e) => onContextMenu(e, contact)}
      className="p-4 rounded-2xl border transition-all relative flex flex-col justify-between gap-3 select-none"
      style={{
        backgroundColor: cardBg,
        borderColor: contact.colorLabel || (isHighPriority ? "#EF4444" : border),
        borderWidth: isCyber ? "1px" : "2.5px",
        boxShadow: isHighPriority
          ? (isCyber ? "0 0 20px rgba(239, 68, 68, 0.3)" : "4px 4px 0px #EF4444")
          : (isCyber ? "0 0 15px rgba(0,245,255,0.15)" : "4px 4px 0px #000000"),
      }}
    >
      {/* Card Header Info */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border flex items-center justify-center font-black text-lg bg-black/20"
              style={{ borderColor: border }}
            >
              {contact.avatar ? (
                <img src={contact.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{CATEGORY_ICONS[contact.category] || "👤"}</span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-black text-sm truncate" style={{ color: textPrimary }}>
                  {contact.name}
                </h3>
                {contact.nickname && (
                  <span className="text-[10px] font-semibold opacity-70 truncate">
                    ("{contact.nickname}")
                  </span>
                )}
              </div>
              <p className="text-[10px] font-semibold opacity-80 truncate" style={{ color: textMuted }}>
                {contact.relationship || contact.company || contact.category}
              </p>
            </div>
          </div>

          {/* Favorite Star */}
          <button
            onClick={() => onToggleFavorite(contact.id, contact.favorite)}
            className="text-base hover:scale-125 transition-transform cursor-pointer shrink-0"
            title={contact.favorite ? "Unfavorite" : "Mark as Favorite"}
          >
            {contact.favorite ? "⭐" : "☆"}
          </button>
        </div>

        {/* Badges Row */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span
            className="text-[9px] font-black uppercase px-2 py-0.5 rounded border"
            style={{
              backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#F3F4F6",
              borderColor: border,
              color: textPrimary,
            }}
          >
            {CATEGORY_ICONS[contact.category] || "🏷️"} {contact.category}
          </span>

          {contact.priority === "HIGH" && (
            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
              🚨 HIGH PRIORITY
            </span>
          )}

          {contact.available24Hours && (
            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              ⚡ 24/7 ACTIVE
            </span>
          )}
        </div>
      </div>

      {/* Details snippet */}
      <div className="space-y-1 text-[11px] font-mono opacity-85 py-1">
        {contact.phoneNumber && (
          <p className="truncate">📞 {contact.phoneNumber}</p>
        )}
        {contact.whatsappNumber && contact.whatsappNumber !== contact.phoneNumber && (
          <p className="truncate text-emerald-400">💬 WA: {contact.whatsappNumber}</p>
        )}
        {contact.email && <p className="truncate opacity-75">✉ {contact.email}</p>}
        {contact.lastContactedAt && (
          <p className="text-[9px] opacity-60 italic pt-1">
            Last: {contact.lastContactType || "Contacted"} on{" "}
            {new Date(contact.lastContactedAt).toISOString().split("T")[0]}
          </p>
        )}
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#EEEEEE" }}>
        {contact.phoneNumber ? (
          <a
            href={`tel:${contact.phoneNumber}`}
            onClick={() => onActionClick(contact.id, "CALL")}
            className="py-1.5 text-[10px] font-black rounded-lg border text-center transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1"
            style={{
              backgroundColor: isCyber ? "rgba(34, 197, 94, 0.2)" : "#DCFCE7",
              borderColor: isCyber ? "#22C55E" : "#16A34A",
              color: isCyber ? "#4ADE80" : "#15803D",
            }}
          >
            📞 Call
          </a>
        ) : (
          <div className="py-1.5 text-[10px] opacity-30 text-center font-bold">No Phone</div>
        )}

        {contact.whatsappNumber || contact.phoneNumber ? (
          <a
            href={`https://wa.me/${(contact.whatsappNumber || contact.phoneNumber || "").replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onActionClick(contact.id, "WHATSAPP")}
            className="py-1.5 text-[10px] font-black rounded-lg border text-center transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1"
            style={{
              backgroundColor: isCyber ? "rgba(16, 185, 129, 0.2)" : "#D1FAE5",
              borderColor: isCyber ? "#10B981" : "#059669",
              color: isCyber ? "#34D399" : "#047857",
            }}
          >
            💬 WA
          </a>
        ) : (
          <div className="py-1.5 text-[10px] opacity-30 text-center font-bold">No WA</div>
        )}

        {contact.email ? (
          <a
            href={`mailto:${contact.email}`}
            onClick={() => onActionClick(contact.id, "EMAIL")}
            className="py-1.5 text-[10px] font-black rounded-lg border text-center transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1"
            style={{
              backgroundColor: isCyber ? "rgba(59, 130, 246, 0.2)" : "#DBEAFE",
              borderColor: isCyber ? "#3B82F6" : "#2563EB",
              color: isCyber ? "#60A5FA" : "#1D4ED8",
            }}
          >
            ✉ Email
          </a>
        ) : (
          <div className="py-1.5 text-[10px] opacity-30 text-center font-bold">No Mail</div>
        )}

        {contact.website && (
          <a
            href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-1 text-[9px] font-bold rounded border text-center hover:opacity-100 opacity-80"
          >
            🌐 Web
          </a>
        )}

        {contact.address && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-1 text-[9px] font-bold rounded border text-center hover:opacity-100 opacity-80"
          >
            📍 Maps
          </a>
        )}

        {contact.notes && (
          <button
            onClick={() => onOpenNotes(contact)}
            className="py-1 text-[9px] font-bold rounded border text-center hover:opacity-100 opacity-80"
          >
            📝 Notes
          </button>
        )}
      </div>
    </motion.div>
  );
}
