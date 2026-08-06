"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import type { EmergencyContact } from "./EmergencyContactCard";

interface EmergencyContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Partial<EmergencyContact> | null;
  onSave: (contactData: Partial<EmergencyContact>) => Promise<void>;
  isCyber: boolean;
}

export const EMERGENCY_CATEGORIES = [
  "Family",
  "Friends",
  "Partner",
  "Hospital",
  "Police",
  "Fire Department",
  "Ambulance",
  "Doctor",
  "Clinic",
  "Mental Health",
  "Roadside Assistance",
  "Insurance",
  "Work",
  "School",
  "Security",
  "Utilities",
  "Other",
];

export function EmergencyContactModal({
  isOpen,
  onClose,
  contact,
  onSave,
  isCyber,
}: EmergencyContactModalProps) {
  const [formData, setFormData] = useState<Partial<EmergencyContact>>({
    name: "",
    nickname: "",
    relationship: "",
    company: "",
    category: "Other",
    phoneNumber: "",
    whatsappNumber: "",
    telegramUsername: "",
    email: "",
    website: "",
    address: "",
    avatar: "",
    notes: "",
    priority: "MEDIUM",
    favorite: false,
    available24Hours: false,
    country: "",
    colorLabel: "",
    birthday: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (contact) {
      setFormData({
        ...contact,
        category: contact.category || "Other",
        priority: contact.priority || "MEDIUM",
      });
    } else {
      setFormData({
        name: "",
        nickname: "",
        relationship: "",
        company: "",
        category: "Other",
        phoneNumber: "",
        whatsappNumber: "",
        telegramUsername: "",
        email: "",
        website: "",
        address: "",
        avatar: "",
        notes: "",
        priority: "MEDIUM",
        favorite: false,
        available24Hours: false,
        country: "",
        colorLabel: "",
        birthday: "",
      });
    }
  }, [contact, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const border = isCyber ? "rgba(0, 245, 255, 0.3)" : "#000000";
  const inputBg = isCyber ? "rgba(0, 0, 0, 0.6)" : "#F9FAFB";
  const textPrimary = isCyber ? "#00F5FF" : "#000000";
  const accent = isCyber ? "#00F5FF" : "#FF6B35";

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-4 select-none text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: border }}>
          <div className="flex items-center gap-2">
            <span className="text-xl">🚨</span>
            <h2 className="font-black text-sm uppercase tracking-wide" style={{ color: textPrimary }}>
              {contact?.id ? "Edit Emergency Contact" : "Add Emergency Contact"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-sm opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold mb-1">Name *</label>
            <input
              type="text"
              required
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Alexander Vance / Mom"
              className="w-full p-2 rounded-lg border text-xs outline-none"
              style={{ backgroundColor: inputBg, borderColor: border, color: isCyber ? "#E0FFFF" : "#000" }}
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Nickname / Alias</label>
            <input
              type="text"
              value={formData.nickname || ""}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              placeholder="e.g. Family Doctor"
              className="w-full p-2 rounded-lg border text-xs outline-none"
              style={{ backgroundColor: inputBg, borderColor: border, color: isCyber ? "#E0FFFF" : "#000" }}
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Category *</label>
            <select
              value={formData.category || "Other"}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 rounded-lg border text-xs outline-none"
              style={{ backgroundColor: inputBg, borderColor: border, color: isCyber ? "#E0FFFF" : "#000" }}
            >
              {EMERGENCY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} style={{ backgroundColor: isCyber ? "#050816" : "#FFF" }}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold mb-1">Relationship / Role</label>
            <input
              type="text"
              value={formData.relationship || ""}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              placeholder="e.g. Primary Physician / Sister"
              className="w-full p-2 rounded-lg border text-xs outline-none"
              style={{ backgroundColor: inputBg, borderColor: border, color: isCyber ? "#E0FFFF" : "#000" }}
            />
          </div>
        </div>

        {/* Contact Numbers & Channels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block font-bold mb-1">📞 Phone Number</label>
            <input
              type="tel"
              value={formData.phoneNumber || ""}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="e.g. +1 555-0199"
              className="w-full p-2 rounded-lg border text-xs outline-none"
              style={{ backgroundColor: inputBg, borderColor: border, color: isCyber ? "#E0FFFF" : "#000" }}
            />
          </div>

          <div>
            <label className="block font-bold mb-1">💬 WhatsApp Number</label>
            <input
              type="tel"
              value={formData.whatsappNumber || ""}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              placeholder="e.g. +1 555-0199"
              className="w-full p-2 rounded-lg border text-xs outline-none"
              style={{ backgroundColor: inputBg, borderColor: border, color: isCyber ? "#E0FFFF" : "#000" }}
            />
          </div>

          <div>
            <label className="block font-bold mb-1">✉ Email</label>
            <input
              type="email"
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. vance@cityclinic.org"
              className="w-full p-2 rounded-lg border text-xs outline-none"
              style={{ backgroundColor: inputBg, borderColor: border, color: isCyber ? "#E0FFFF" : "#000" }}
            />
          </div>

          <div>
            <label className="block font-bold mb-1">🌐 Website URL</label>
            <input
              type="text"
              value={formData.website || ""}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="e.g. https://cityhospital.org"
              className="w-full p-2 rounded-lg border text-xs outline-none"
              style={{ backgroundColor: inputBg, borderColor: border, color: isCyber ? "#E0FFFF" : "#000" }}
            />
          </div>
        </div>

        {/* Priority & Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block font-bold mb-1">Priority Level</label>
            <select
              value={formData.priority || "MEDIUM"}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full p-2 rounded-lg border text-xs outline-none font-bold"
              style={{ backgroundColor: inputBg, borderColor: border, color: isCyber ? "#E0FFFF" : "#000" }}
            >
              <option value="HIGH">🚨 HIGH (Emergency First Response)</option>
              <option value="MEDIUM">⚡ MEDIUM (Standard Priority)</option>
              <option value="LOW">🔵 LOW (General Contact)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="favoriteToggle"
              checked={Boolean(formData.favorite)}
              onChange={(e) => setFormData({ ...formData, favorite: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="favoriteToggle" className="font-bold cursor-pointer">
              ⭐ Favorite / Pinned
            </label>
          </div>

          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="24hoursToggle"
              checked={Boolean(formData.available24Hours)}
              onChange={(e) => setFormData({ ...formData, available24Hours: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="24hoursToggle" className="font-bold cursor-pointer">
              ⚡ Available 24/7
            </label>
          </div>
        </div>

        {/* Address & Avatar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block font-bold mb-1">📍 Address / Location</label>
            <input
              type="text"
              value={formData.address || ""}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 742 Evergreen Terrace, Sector 4"
              className="w-full p-2 rounded-lg border text-xs outline-none"
              style={{ backgroundColor: inputBg, borderColor: border, color: isCyber ? "#E0FFFF" : "#000" }}
            />
          </div>

          <div>
            <label className="block font-bold mb-1">🖼️ Avatar Image URL</label>
            <input
              type="url"
              value={formData.avatar || ""}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-2 rounded-lg border text-xs outline-none"
              style={{ backgroundColor: inputBg, borderColor: border, color: isCyber ? "#E0FFFF" : "#000" }}
            />
          </div>
        </div>

        {/* Notes Field */}
        <div>
          <label className="block font-bold mb-1">
            📝 Emergency Notes & Instructions (Allergies, Gate Password, etc.)
          </label>
          <textarea
            rows={3}
            value={formData.notes || ""}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g. Penicillin allergy. Apartment 4B. Gate code: #9941. Preferred ER: St. Jude Hospital."
            className="w-full p-2.5 rounded-lg border text-xs outline-none resize-none"
            style={{ backgroundColor: inputBg, borderColor: border, color: isCyber ? "#E0FFFF" : "#000" }}
          />
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: border }}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-bold text-xs rounded-lg border opacity-80 hover:opacity-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.name?.trim()}
            className="px-5 py-2 font-black text-xs rounded-lg transition-transform active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: accent, color: isCyber ? "#050816" : "#FFF" }}
          >
            {isSubmitting ? "Saving…" : contact?.id ? "Update Contact ✓" : "Create Contact +"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
