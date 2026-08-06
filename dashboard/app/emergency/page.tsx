"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useTheme } from "@/lib/theme";
import { useToast } from "@/components/ui/ToastProvider";
import {
  EmergencyContactCard,
  type EmergencyContact,
  CATEGORY_ICONS,
} from "@/components/emergency/EmergencyContactCard";
import {
  EmergencyContactModal,
  EMERGENCY_CATEGORIES,
} from "@/components/emergency/EmergencyContactModal";
import { EmergencyContextMenu } from "@/components/emergency/EmergencyContextMenu";
import { EmergencyNotesModal } from "@/components/emergency/EmergencyNotesModal";
import {
  generateVCardString,
  generateCSVString,
  parseVCardString,
  downloadFile,
  type EmergencyContactInput,
} from "@/lib/utils/emergencyImportExport";

import { AppShell } from "@/components/layout/AppShell";

function EmergencyHubContent() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const toast = useToast();

  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedPriority, setSelectedPriority] = useState("ALL");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "priority" | "recent" | "created">("priority");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modals & Context Menu State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Partial<EmergencyContact> | null>(null);
  const [notesContact, setNotesContact] = useState<EmergencyContact | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    contact: EmergencyContact | null;
    x: number;
    y: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch Contacts from DB ────────────────────────────────────────────────
  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/emergency/contacts");
      const data = await res.json();
      if (data.contacts) {
        setContacts(data.contacts);
      }
    } catch {
      toast.error("Failed to load emergency contacts.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // ── Action Triggers (Call, WA, Mail) & Interaction Logging ────────────────
  const handleActionClick = async (id: string, actionType: "CALL" | "WHATSAPP" | "EMAIL") => {
    try {
      await fetch("/api/emergency/contacts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, actionType }),
      });
      // Optimistic update local timestamp
      setContacts((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, lastContactedAt: new Date().toISOString(), lastContactType: actionType }
            : c
        )
      );
    } catch {}
  };

  // ── Toggle Favorite ────────────────────────────────────────────────────────
  const handleToggleFavorite = async (id: string, current: boolean) => {
    const updatedFav = !current;
    // Optimistic UI update
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, favorite: updatedFav } : c))
    );

    try {
      await fetch("/api/emergency/contacts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, favorite: updatedFav }),
      });
      toast.success(updatedFav ? "Added to Favorites ⭐" : "Removed from Favorites");
    } catch {
      fetchContacts();
    }
  };

  // ── Save Contact (Create or Edit) ─────────────────────────────────────────
  const handleSaveContact = async (contactData: Partial<EmergencyContact>) => {
    const isEdit = Boolean(contactData.id);
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch("/api/emergency/contacts", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "Failed to save contact.");
        return;
      }

      toast.success(isEdit ? "Contact updated ✓" : "Emergency Contact added!");
      fetchContacts();
    } catch {
      toast.error("Error connecting to server.");
    }
  };

  // ── Delete Contact ────────────────────────────────────────────────────────
  const handleDeleteContact = async (id: string) => {
    if (!confirm("Are you sure you want to delete this emergency contact?")) return;

    setContacts((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch(`/api/emergency/contacts?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      toast.info("Deleted contact.");
    } catch {
      fetchContacts();
    }
  };

  // ── Duplicate Contact ──────────────────────────────────────────────────────
  const handleDuplicateContact = (contact: EmergencyContact) => {
    const { id, createdAt, updatedAt, ...rest } = contact;
    setEditingContact({
      ...rest,
      name: `${rest.name} (Copy)`,
    });
    setModalOpen(true);
  };

  // ── Import / Export Handlers ──────────────────────────────────────────────
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(contacts, null, 2);
    downloadFile(jsonStr, "emergency_contacts.json", "application/json");
    toast.success("Exported JSON contacts!");
  };

  const handleExportCSV = () => {
    const csvStr = generateCSVString(contacts);
    downloadFile(csvStr, "emergency_contacts.csv", "text/csv");
    toast.success("Exported CSV contacts!");
  };

  const handleExportVCard = () => {
    const vcfStr = generateVCardString(contacts);
    downloadFile(vcfStr, "emergency_contacts.vcf", "text/vcard");
    toast.success("Exported vCard (.vcf) contacts!");
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    let importedItems: EmergencyContactInput[] = [];

    if (file.name.endsWith(".json")) {
      try {
        importedItems = JSON.parse(text);
      } catch {
        toast.error("Invalid JSON file.");
        return;
      }
    } else if (file.name.endsWith(".vcf")) {
      importedItems = parseVCardString(text);
    } else if (file.name.endsWith(".csv")) {
      // Basic CSV parser lines
      const lines = text.split("\n").filter(Boolean);
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(",").map((p) => p.replace(/^"|"$/g, "").trim());
        if (parts[0]) {
          importedItems.push({
            name: parts[0],
            nickname: parts[1],
            relationship: parts[2],
            company: parts[3],
            category: parts[4] || "Other",
            phoneNumber: parts[5],
            whatsappNumber: parts[6],
            email: parts[7],
            website: parts[8],
            address: parts[9],
            priority: parts[10] as any || "MEDIUM",
            available24Hours: parts[11] === "Yes",
            favorite: parts[12] === "Yes",
            notes: parts[13],
          });
        }
      }
    }

    if (importedItems.length === 0) {
      toast.error("No valid contacts found in file.");
      return;
    }

    let count = 0;
    for (const item of importedItems) {
      if (item.name) {
        await fetch("/api/emergency/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
        count++;
      }
    }

    toast.success(`Imported ${count} contacts!`);
    fetchContacts();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Filtered & Sorted Contacts ───────────────────────────────────────────
  const filteredContacts = useMemo(() => {
    return contacts
      .filter((c) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matches =
            c.name.toLowerCase().includes(q) ||
            (c.nickname && c.nickname.toLowerCase().includes(q)) ||
            (c.relationship && c.relationship.toLowerCase().includes(q)) ||
            (c.company && c.company.toLowerCase().includes(q)) ||
            c.category.toLowerCase().includes(q) ||
            (c.phoneNumber && c.phoneNumber.includes(q)) ||
            (c.notes && c.notes.toLowerCase().includes(q));

          if (!matches) return false;
        }

        // Category
        if (selectedCategory !== "ALL" && c.category !== selectedCategory) {
          return false;
        }

        // Priority
        if (selectedPriority !== "ALL" && c.priority !== selectedPriority) {
          return false;
        }

        // Favorites
        if (favoritesOnly && !c.favorite) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "priority") {
          const pOrder: { [key: string]: number } = { HIGH: 1, MEDIUM: 2, LOW: 3 };
          const pDiff = (pOrder[a.priority] || 2) - (pOrder[b.priority] || 2);
          if (pDiff !== 0) return pDiff;
          return a.name.localeCompare(b.name);
        }
        if (sortBy === "recent") {
          const tA = a.lastContactedAt ? new Date(a.lastContactedAt).getTime() : 0;
          const tB = b.lastContactedAt ? new Date(b.lastContactedAt).getTime() : 0;
          return tB - tA;
        }
        if (sortBy === "created") {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        return a.name.localeCompare(b.name);
      });
  }, [contacts, searchQuery, selectedCategory, selectedPriority, favoritesOnly, sortBy]);

  // Summary Metrics
  const totalCount = contacts.length;
  const favoriteCount = contacts.filter((c) => c.favorite).length;
  const hours24Count = contacts.filter((c) => c.available24Hours).length;
  const familyCount = contacts.filter((c) => c.category === "Family" || c.category === "Partner").length;
  const emergencyServicesCount = contacts.filter((c) =>
    ["Hospital", "Police", "Fire Department", "Ambulance"].includes(c.category)
  ).length;
  const recentlyContactedCount = contacts.filter((c) => c.lastContactedAt).length;

  const border = isCyber ? "rgba(0, 245, 255, 0.3)" : "#000000";
  const bgCard = isCyber ? "rgba(5, 8, 22, 0.85)" : "#FFFFFF";
  const textPrimary = isCyber ? "#00F5FF" : "#000000";

  return (
    <div
      onContextMenu={(e) => {
        // Workspace Right Click Handler
        if ((e.target as HTMLElement).closest(".rounded-2xl")) return; // Let card handle its own menu
        e.preventDefault();
        setContextMenu({ contact: null, x: e.clientX, y: e.clientY });
      }}
      className="space-y-6 select-none"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        accept=".vcf,.json,.csv"
        className="hidden"
      />

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">🚨</span>
            <h1
              className="text-2xl md:text-3xl font-black uppercase tracking-wider"
              style={{
                fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
                color: textPrimary,
              }}
            >
              Emergency Hub
            </h1>
          </div>
          <p className="text-xs font-semibold opacity-70 mt-1">
            Priority Quick-Access Emergency Center & Immediate Communication Hub
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 font-black text-xs rounded-xl border transition-transform active:scale-95 flex items-center gap-1.5"
            style={{
              backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#E5E7EB",
              borderColor: border,
            }}
          >
            📥 Import
          </button>

          <div className="relative group">
            <button
              className="px-3.5 py-2 font-black text-xs rounded-xl border transition-transform active:scale-95 flex items-center gap-1.5"
              style={{
                backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#E5E7EB",
                borderColor: border,
              }}
            >
              📤 Export ▾
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-black/90 border border-white/20 rounded-xl p-1 z-30 shadow-xl text-xs w-32">
              <button onClick={handleExportVCard} className="px-3 py-1.5 text-left hover:bg-white/10 rounded font-bold">
                📇 vCard (.vcf)
              </button>
              <button onClick={handleExportCSV} className="px-3 py-1.5 text-left hover:bg-white/10 rounded font-bold">
                📊 CSV File
              </button>
              <button onClick={handleExportJSON} className="px-3 py-1.5 text-left hover:bg-white/10 rounded font-bold">
                📄 JSON File
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingContact(null);
              setModalOpen(true);
            }}
            className="px-4 py-2 font-black text-xs rounded-xl border transition-transform active:scale-95 flex items-center gap-1.5 shadow-lg"
            style={{
              backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
              borderColor: isCyber ? "#00F5FF" : "#000000",
              color: isCyber ? "#050816" : "#FFFFFF",
            }}
          >
            + Add Contact
          </button>
        </div>
      </div>

      {/* ── Summary Cards Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl border bg-black/20" style={{ borderColor: border }}>
          <p className="text-[10px] font-black uppercase opacity-60">Total Contacts</p>
          <p className="text-xl font-black mt-1" style={{ color: textPrimary }}>{totalCount}</p>
        </div>

        <div className="p-3.5 rounded-xl border bg-black/20" style={{ borderColor: border }}>
          <p className="text-[10px] font-black uppercase opacity-60">Favorites</p>
          <p className="text-xl font-black mt-1 text-amber-400">⭐ {favoriteCount}</p>
        </div>

        <div className="p-3.5 rounded-xl border bg-black/20" style={{ borderColor: border }}>
          <p className="text-[10px] font-black uppercase opacity-60">24/7 Available</p>
          <p className="text-xl font-black mt-1 text-emerald-400">⚡ {hours24Count}</p>
        </div>

        <div className="p-3.5 rounded-xl border bg-black/20" style={{ borderColor: border }}>
          <p className="text-[10px] font-black uppercase opacity-60">Family & Partner</p>
          <p className="text-xl font-black mt-1 text-pink-400">❤️ {familyCount}</p>
        </div>

        <div className="p-3.5 rounded-xl border bg-black/20" style={{ borderColor: border }}>
          <p className="text-[10px] font-black uppercase opacity-60">Emergency Services</p>
          <p className="text-xl font-black mt-1 text-red-400">🚨 {emergencyServicesCount}</p>
        </div>

        <div className="p-3.5 rounded-xl border bg-black/20" style={{ borderColor: border }}>
          <p className="text-[10px] font-black uppercase opacity-60">Recent Calls</p>
          <p className="text-xl font-black mt-1 text-cyan-400">📞 {recentlyContactedCount}</p>
        </div>
      </div>

      {/* ── Controls, Search & Filter Bar ── */}
      <div
        className="p-4 rounded-2xl border flex flex-col md:flex-row gap-3 items-center justify-between"
        style={{ backgroundColor: bgCard, borderColor: border }}
      >
        {/* Search input */}
        <div className="w-full md:w-72 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, phone, notes, relationship…"
            className="w-full pl-8 pr-3 py-2 rounded-xl border text-xs outline-none"
            style={{
              backgroundColor: isCyber ? "rgba(0,0,0,0.6)" : "#F9FAFB",
              borderColor: border,
              color: isCyber ? "#E0FFFF" : "#000000",
            }}
          />
          <span className="absolute left-2.5 top-2.5 text-xs opacity-50">🔍</span>
        </div>

        {/* Category & Priority Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap text-xs">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 rounded-xl border font-bold outline-none"
            style={{ backgroundColor: isCyber ? "rgba(0,0,0,0.6)" : "#F9FAFB", borderColor: border }}
          >
            <option value="ALL">All Categories ({contacts.length})</option>
            {EMERGENCY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_ICONS[cat] || "🏷️"} {cat}
              </option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="p-2 rounded-xl border font-bold outline-none"
            style={{ backgroundColor: isCyber ? "rgba(0,0,0,0.6)" : "#F9FAFB", borderColor: border }}
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">🚨 High Priority Only</option>
            <option value="MEDIUM">⚡ Medium Priority</option>
            <option value="LOW">🔵 Low Priority</option>
          </select>

          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`px-3 py-2 font-bold rounded-xl border transition-all ${
              favoritesOnly ? "bg-amber-500/20 text-amber-400 border-amber-400" : "opacity-75"
            }`}
          >
            ⭐ Favorites
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="p-2 rounded-xl border font-bold outline-none"
            style={{ backgroundColor: isCyber ? "rgba(0,0,0,0.6)" : "#F9FAFB", borderColor: border }}
          >
            <option value="priority">Sort: Priority</option>
            <option value="name">Sort: Name A-Z</option>
            <option value="recent">Sort: Recently Contacted</option>
            <option value="created">Sort: Recently Added</option>
          </select>
        </div>
      </div>

      {/* ── Main Contacts Display ── */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 mx-auto border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono font-bold tracking-wider opacity-70 animate-pulse" style={{ color: textPrimary }}>
            Loading Emergency Contacts Database...
          </p>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed rounded-2xl space-y-3" style={{ borderColor: border }}>
          <div className="text-4xl">🚨</div>
          <h3 className="font-black text-sm" style={{ color: textPrimary }}>
            No Emergency Contacts Found
          </h3>
          <p className="text-xs opacity-60 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== "ALL"
              ? "No contacts match your current search and filter criteria."
              : "Your Emergency Hub is empty. Add key contacts or import your contact list to get started."}
          </p>
          <button
            onClick={() => {
              setEditingContact(null);
              setModalOpen(true);
            }}
            className="px-4 py-2 font-black text-xs rounded-xl bg-cyan-400 text-black hover:scale-105 transition-transform"
          >
            + Create First Contact
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <EmergencyContactCard
              key={contact.id}
              contact={contact}
              isCyber={isCyber}
              onToggleFavorite={handleToggleFavorite}
              onActionClick={handleActionClick}
              onOpenNotes={setNotesContact}
              onEdit={(c) => {
                setEditingContact(c);
                setModalOpen(true);
              }}
              onContextMenu={(e, c) => {
                e.preventDefault();
                setContextMenu({ contact: c, x: e.clientX, y: e.clientY });
              }}
            />
          ))}
        </div>
      )}

      {/* ── Modals & Context Menu ── */}
      <EmergencyContactModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingContact(null);
        }}
        contact={editingContact}
        onSave={handleSaveContact}
        isCyber={isCyber}
      />

      <EmergencyNotesModal
        isOpen={!!notesContact}
        onClose={() => setNotesContact(null)}
        contact={notesContact}
        isCyber={isCyber}
      />

      {contextMenu && (
        <EmergencyContextMenu
          contact={contextMenu.contact}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onEdit={(c) => {
            setEditingContact(c);
            setModalOpen(true);
          }}
          onDuplicate={handleDuplicateContact}
          onDelete={handleDeleteContact}
          onToggleFavorite={handleToggleFavorite}
          onOpenNotes={setNotesContact}
          onAddContact={() => {
            setEditingContact(null);
            setModalOpen(true);
          }}
          onImportContacts={() => fileInputRef.current?.click()}
          onExportContacts={handleExportVCard}
          onRefresh={fetchContacts}
          isCyber={isCyber}
        />
      )}
    </div>
  );
}

export default function EmergencyHubPage() {
  return (
    <AppShell>
      <EmergencyHubContent />
    </AppShell>
  );
}
