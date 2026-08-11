"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { HallOfFameEntry } from "@/lib/store/dashboardStore";
import {
  normalizeTokusatsuProfile,
} from "@/lib/data/tokusatsuDataHelper";
import {
  TokusatsuProfile,
  TokusatsuForm,
  TokusatsuWeapon,
  TokusatsuVehicle,
  TokusatsuAbility,
  TokusatsuAppearance,
} from "@/lib/types/tokusatsu";
import { ImageLightboxModal } from "@/components/ui/ImageLightboxModal";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Props {
  isOpen: boolean;
  entry: HallOfFameEntry | null;
  onClose: () => void;
  onEdit?: (entry: HallOfFameEntry) => void;
  onLike?: (id: string) => void;
}

const TABS = [
  { id: "overview", label: "OVERVIEW", icon: "🏛️" },
  { id: "gallery", label: "GALLERY", icon: "🖼️" },
  { id: "lore", label: "LORE", icon: "📖" },
  { id: "appearances", label: "APPEARANCES", icon: "📺" },
  { id: "forms", label: "FORMS", icon: "⚡" },
  { id: "weapons", label: "WEAPONS", icon: "⚔️" },
  { id: "vehicles", label: "VEHICLES", icon: "🏍️" },
  { id: "powers", label: "POWERS", icon: "💥" },
  { id: "franchise", label: "FRANCHISE", icon: "🛡️" },
] as const;
type TabId = (typeof TABS)[number]["id"];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  accent,
  isCyber,
}: {
  label: string;
  value?: string | string[] | null;
  accent: string;
  isCyber: boolean;
}) {
  if (!value || (Array.isArray(value) && value.length === 0) || value === "") return null;
  const display = Array.isArray(value) ? value.join(", ") : String(value);
  return (
    <div className={`flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-2 border-b last:border-0 ${isCyber ? "border-white/[0.06]" : "border-black/10"}`}>
      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider sm:w-36 shrink-0 pt-0.5 ${isCyber ? "text-cyan-400/80" : "text-gray-600"}`}>{label}</span>
      <span className={`text-xs break-words flex-1 font-semibold ${isCyber ? "text-white/90" : "text-gray-900"}`}>{display}</span>
    </div>
  );
}

function SectionBox({
  title, icon, isCyber, accent, children, visible,
}: {
  title: string; icon: string; isCyber: boolean; accent: string; children: React.ReactNode; visible?: boolean;
}) {
  if (visible === false) return null;
  return (
    <div className={`p-4 sm:p-5 rounded-2xl border ${isCyber ? "bg-white/[0.02] border-white/10" : "bg-gray-50 border-black shadow-[4px_4px_0_#000]"}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">{icon}</span>
        <h3 className={`text-xs font-mono font-black uppercase tracking-[0.15em] ${isCyber ? "" : "text-gray-900"}`} style={{ color: isCyber ? accent : undefined }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function TagChips({ items, isCyber, accent, finisher }: { items?: string[]; isCyber: boolean; accent: string; finisher?: boolean }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span key={i} className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border ${
          finisher
            ? isCyber ? "bg-red-500/20 text-red-300 border-red-500/40" : "bg-red-100 text-black border-black shadow-[1.5px_1.5px_0_#000]"
            : isCyber ? "bg-white/10 text-white/80 border-white/10" : "bg-amber-100 text-black border-black shadow-[1px_1px_0_#000]"
        }`}>{item}</span>
      ))}
    </div>
  );
}

function EmptyState({ label, isCyber }: { label: string; isCyber: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 rounded-2xl border border-dashed gap-3 ${isCyber ? "border-white/10 text-white/30" : "border-black/20 text-gray-400"}`}>
      <span className="text-3xl opacity-40">📭</span>
      <p className="text-xs font-mono text-center">{label}</p>
    </div>
  );
}

function StatPill({ label, value, isCyber }: { label: string; value?: string; isCyber: boolean }) {
  if (!value) return null;
  return (
    <div className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center ${isCyber ? "bg-white/[0.03] border-white/10" : "bg-white border-black shadow-[2px_2px_0_#000]"}`}>
      <span className={`text-[9px] font-mono font-black uppercase tracking-wider mb-1 ${isCyber ? "text-cyan-400/70" : "text-gray-500"}`}>{label}</span>
      <span className={`text-xs font-black ${isCyber ? "text-white" : "text-gray-900"}`}>{value}</span>
    </div>
  );
}

// ─── Card Renderers ────────────────────────────────────────────────────────────

function FormCard({ form, isCyber, accent }: { form: TokusatsuForm; isCyber: boolean; accent: string }) {
  return (
    <div className={`p-4 rounded-2xl border transition-all ${isCyber ? "bg-white/[0.03] border-white/10 hover:border-cyan-500/30" : "bg-white border-black shadow-[3px_3px_0_#000] hover:shadow-[5px_5px_0_#000]"}`}>
      <div className="flex items-start gap-3">
        {form.imageUrl && <img src={form.imageUrl} alt={form.name} className="w-16 h-16 rounded-xl object-cover shrink-0 border" style={{ borderColor: isCyber ? accent : "#000" }} />}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className={`text-sm font-black truncate ${isCyber ? "text-white" : "text-gray-900"}`}>{form.name}</h4>
            {form.formType && <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${isCyber ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" : "bg-cyan-200 text-black border-black shadow-[1px_1px_0_#000]"}`}>{form.formType}</span>}
            {form.debutEpisode && <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono border ${isCyber ? "bg-white/5 text-white/50 border-white/10" : "bg-gray-200 text-gray-700 border-black"}`}>📺 {form.debutEpisode}</span>}
          </div>
          {form.appearance && <p className={`text-xs leading-relaxed ${isCyber ? "text-white/60" : "text-gray-600"}`}>{form.appearance}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
            {form.transformationDevice && (
              <div>
                <span className={`font-mono font-bold uppercase text-[9px] tracking-wider block ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>Device</span>
                <span className={isCyber ? "text-white/80" : "text-gray-900"}>{form.transformationDevice}</span>
              </div>
            )}
            {form.transformationItem && (
              <div>
                <span className={`font-mono font-bold uppercase text-[9px] tracking-wider block ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>Item</span>
                <span className={isCyber ? "text-white/80" : "text-gray-900"}>{form.transformationItem}</span>
              </div>
            )}
            {form.transformationPhrase && (
              <div className="sm:col-span-2">
                <span className={`font-mono font-bold uppercase text-[9px] tracking-wider block ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>Phrase</span>
                <span className={`italic font-bold ${isCyber ? "text-cyan-300" : "text-gray-900"}`}>&ldquo;{form.transformationPhrase}&rdquo;</span>
              </div>
            )}
          </div>
          {form.abilities.length > 0 && (
            <div>
              <span className={`font-mono font-bold uppercase text-[9px] tracking-wider block mb-1 ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>Abilities</span>
              <TagChips items={form.abilities} isCyber={isCyber} accent={accent} />
            </div>
          )}
          {form.finisher && (
            <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-mono font-black border ${isCyber ? "bg-red-500/20 text-red-300 border-red-500/40" : "bg-red-100 text-black border-black shadow-[1.5px_1.5px_0_#000]"}`}>💥 Finisher: {form.finisher}</span>
          )}
          {form.powerLevelNotes && <p className={`text-[11px] font-mono ${isCyber ? "text-white/40 italic" : "text-gray-400 italic"}`}>{form.powerLevelNotes}</p>}
        </div>
      </div>
    </div>
  );
}

function WeaponCard({ weapon, isCyber, accent }: { weapon: TokusatsuWeapon; isCyber: boolean; accent: string }) {
  return (
    <div className={`p-4 rounded-2xl border transition-all ${isCyber ? "bg-white/[0.03] border-white/10 hover:border-amber-500/30" : "bg-white border-black shadow-[3px_3px_0_#000] hover:shadow-[5px_5px_0_#000]"}`}>
      <div className="flex items-start gap-3">
        {weapon.imageUrl && <img src={weapon.imageUrl} alt={weapon.name} className="w-14 h-14 rounded-xl object-cover shrink-0 border" style={{ borderColor: isCyber ? accent : "#000" }} />}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className={`text-sm font-black ${isCyber ? "text-white" : "text-gray-900"}`}>{weapon.name}</h4>
            {weapon.type && <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${isCyber ? "bg-amber-500/15 text-amber-300 border-amber-500/30" : "bg-amber-200 text-black border-black shadow-[1px_1px_0_#000]"}`}>⚔️ {weapon.type}</span>}
          </div>
          {weapon.description && <p className={`text-xs leading-relaxed ${isCyber ? "text-white/60" : "text-gray-600"}`}>{weapon.description}</p>}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
            {weapon.firstAppearance && (
              <div>
                <span className={`font-mono font-bold uppercase text-[9px] tracking-wider block ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>First Appearance</span>
                <span className={isCyber ? "text-white/80" : "text-gray-900"}>{weapon.firstAppearance}</span>
              </div>
            )}
            {weapon.associatedForm && (
              <div>
                <span className={`font-mono font-bold uppercase text-[9px] tracking-wider block ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>Used In</span>
                <span className={isCyber ? "text-white/80" : "text-gray-900"}>{weapon.associatedForm}</span>
              </div>
            )}
          </div>
          {weapon.abilities.length > 0 && <TagChips items={weapon.abilities} isCyber={isCyber} accent={accent} />}
          {weapon.specialAttack && (
            <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-mono font-black border ${isCyber ? "bg-red-500/20 text-red-300 border-red-500/40" : "bg-red-100 text-black border-black shadow-[1.5px_1.5px_0_#000]"}`}>💥 {weapon.specialAttack}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function VehicleCard({ vehicle, isCyber, accent }: { vehicle: TokusatsuVehicle; isCyber: boolean; accent: string }) {
  return (
    <div className={`p-4 rounded-2xl border transition-all ${isCyber ? "bg-white/[0.03] border-white/10 hover:border-emerald-500/30" : "bg-white border-black shadow-[3px_3px_0_#000] hover:shadow-[5px_5px_0_#000]"}`}>
      <div className="flex items-start gap-3">
        {vehicle.imageUrl && <img src={vehicle.imageUrl} alt={vehicle.name} className="w-14 h-14 rounded-xl object-cover shrink-0 border" style={{ borderColor: isCyber ? accent : "#000" }} />}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className={`text-sm font-black ${isCyber ? "text-white" : "text-gray-900"}`}>{vehicle.name}</h4>
            {vehicle.type && <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${isCyber ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-emerald-200 text-black border-black shadow-[1px_1px_0_#000]"}`}>🏍️ {vehicle.type}</span>}
            {vehicle.debut && <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono border ${isCyber ? "bg-white/5 text-white/50 border-white/10" : "bg-gray-200 text-gray-700 border-black"}`}>📺 {vehicle.debut}</span>}
          </div>
          {vehicle.description && <p className={`text-xs leading-relaxed ${isCyber ? "text-white/60" : "text-gray-600"}`}>{vehicle.description}</p>}
          {vehicle.associatedHeroForm && (
            <div className="text-[11px]">
              <span className={`font-mono font-bold uppercase text-[9px] tracking-wider block ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>Associated Form</span>
              <span className={isCyber ? "text-white/80" : "text-gray-900"}>{vehicle.associatedHeroForm}</span>
            </div>
          )}
          {vehicle.abilities && <p className={`text-xs ${isCyber ? "text-white/60" : "text-gray-600"}`}>{vehicle.abilities}</p>}
        </div>
      </div>
    </div>
  );
}

function AbilityCard({ ability, isCyber, accent }: { ability: TokusatsuAbility; isCyber: boolean; accent: string }) {
  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      ability.isFinisher
        ? isCyber ? "bg-red-500/[0.08] border-red-500/30 hover:border-red-500/50" : "bg-red-50 border-black shadow-[3px_3px_0_#000]"
        : isCyber ? "bg-white/[0.03] border-white/10 hover:border-cyan-500/30" : "bg-white border-black shadow-[3px_3px_0_#000]"
    }`}>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <h4 className={`text-sm font-black ${isCyber ? "text-white" : "text-gray-900"}`}>{ability.isFinisher && "💥 "}{ability.name}</h4>
        {ability.category && (
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
            ability.isFinisher
              ? isCyber ? "bg-red-500/20 text-red-300 border-red-500/40" : "bg-red-200 text-black border-black shadow-[1px_1px_0_#000]"
              : isCyber ? "bg-purple-500/15 text-purple-300 border-purple-500/30" : "bg-purple-200 text-black border-black shadow-[1px_1px_0_#000]"
          }`}>{ability.category}</span>
        )}
        {ability.isFinisher && <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-black ${isCyber ? "text-red-400 bg-red-500/10" : "text-red-600 bg-red-100"}`}>FINISHER</span>}
      </div>
      {ability.description && <p className={`text-xs leading-relaxed mb-2 ${isCyber ? "text-white/60" : "text-gray-600"}`}>{ability.description}</p>}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        {ability.activationMethod && (
          <div>
            <span className={`font-mono font-bold uppercase text-[9px] tracking-wider block ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>Activation</span>
            <span className={isCyber ? "text-white/80" : "text-gray-900"}>{ability.activationMethod}</span>
          </div>
        )}
        {ability.associatedForm && (
          <div>
            <span className={`font-mono font-bold uppercase text-[9px] tracking-wider block ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>Form</span>
            <span className={isCyber ? "text-white/80" : "text-gray-900"}>{ability.associatedForm}</span>
          </div>
        )}
        {ability.debut && (
          <div>
            <span className={`font-mono font-bold uppercase text-[9px] tracking-wider block ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>Debut</span>
            <span className={isCyber ? "text-white/80" : "text-gray-900"}>{ability.debut}</span>
          </div>
        )}
        {ability.visualEffect && (
          <div>
            <span className={`font-mono font-bold uppercase text-[9px] tracking-wider block ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>Visual Effect</span>
            <span className={isCyber ? "text-white/80" : "text-gray-900"}>{ability.visualEffect}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function AppearanceCard({ appearance, isCyber, accent }: { appearance: TokusatsuAppearance; isCyber: boolean; accent: string }) {
  const typeColorMap: Record<string, string> = {
    "Main Series": isCyber ? "text-cyan-300 bg-cyan-500/15 border-cyan-500/30" : "bg-cyan-200 text-black border-black shadow-[1px_1px_0_#000]",
    "Movie": isCyber ? "text-amber-300 bg-amber-500/15 border-amber-500/30" : "bg-amber-200 text-black border-black shadow-[1px_1px_0_#000]",
    "Special": isCyber ? "text-purple-300 bg-purple-500/15 border-purple-500/30" : "bg-purple-200 text-black border-black shadow-[1px_1px_0_#000]",
    "Crossover": isCyber ? "text-emerald-300 bg-emerald-500/15 border-emerald-500/30" : "bg-emerald-200 text-black border-black shadow-[1px_1px_0_#000]",
    "Spin-off": isCyber ? "text-rose-300 bg-rose-500/15 border-rose-500/30" : "bg-rose-200 text-black border-black shadow-[1px_1px_0_#000]",
    "Cameo": isCyber ? "text-white/60 bg-white/5 border-white/10" : "bg-gray-200 text-gray-700 border-black",
    "Guest": isCyber ? "text-white/60 bg-white/5 border-white/10" : "bg-gray-200 text-gray-700 border-black",
  };
  return (
    <div className={`p-4 rounded-2xl border transition-all ${isCyber ? "bg-white/[0.03] border-white/10" : "bg-white border-black shadow-[3px_3px_0_#000]"}`}>
      <div className="flex flex-wrap items-start gap-2">
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-black leading-tight ${isCyber ? "text-white" : "text-gray-900"}`}>{appearance.title}</h4>
          {(appearance.role || appearance.episodeFilmNumber) && (
            <p className={`text-[11px] mt-0.5 ${isCyber ? "text-white/50" : "text-gray-500"}`}>
              {appearance.role}{appearance.episodeFilmNumber && ` · ${appearance.episodeFilmNumber}`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {appearance.releaseYear && <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${isCyber ? "bg-white/5 text-white/60 border-white/10" : "bg-gray-100 text-gray-600 border-black"}`}>{appearance.releaseYear}</span>}
          {appearance.appearanceType && <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${typeColorMap[appearance.appearanceType] || ""}`}>{appearance.appearanceType}</span>}
        </div>
      </div>
      {appearance.notes && <p className={`text-[11px] mt-2 leading-relaxed italic ${isCyber ? "text-white/40" : "text-gray-400"}`}>{appearance.notes}</p>}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function TokusatsuProfileModal({ isOpen, entry, onClose, onEdit, onLike }: Props) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => { if (isOpen) setActiveTab("overview"); }, [isOpen]);

  const profile = useMemo<TokusatsuProfile>(() => {
    if (!entry) return normalizeTokusatsuProfile(null, null);
    return normalizeTokusatsuProfile(entry.details?.tokusatsuData || null, entry);
  }, [entry]);

  if (!isOpen || !entry) return null;

  const accent = profile.accentColor || entry.accentColor || (isCyber ? "#00F5FF" : "#FF6B35");
  const portraitImage = profile.portraitUrl || profile.imageUrl || entry.portraitUrl || entry.imageUrl;

  const galleryImages = profile.galleryUrls.filter(Boolean).map((src, i) => ({
    src,
    label: `${profile.heroName} — Gallery ${i + 1}`,
  }));

  const franchiseLabel =
    profile.franchiseType === "KAMEN_RIDER" ? "Kamen Rider" :
    profile.franchiseType === "ULTRAMAN" ? "Ultraman" :
    profile.franchiseType === "POWER_RANGERS" ? "Power Rangers" :
    profile.franchiseType === "SUPER_SENTAI" ? "Super Sentai" : "Tokusatsu";

  const franchiseIcon =
    profile.franchiseType === "KAMEN_RIDER" ? "🏍️" :
    profile.franchiseType === "ULTRAMAN" ? "⚡" :
    profile.franchiseType === "POWER_RANGERS" ? "🔴" :
    profile.franchiseType === "SUPER_SENTAI" ? "🛡️" : "🎬";

  const visibleTabs = TABS.filter((t) => {
    if (["overview", "gallery", "lore", "appearances", "franchise"].includes(t.id)) return true;
    if (t.id === "forms") return profile.forms.length > 0;
    if (t.id === "weapons") return profile.weapons.length > 0;
    if (t.id === "vehicles") return profile.vehicles.length > 0;
    if (t.id === "powers") return profile.abilities.length > 0;
    return true;
  });

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[1500] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="relative w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
              style={{
                backgroundColor: isCyber ? "#050816" : "#FFFFFF",
                borderColor: isCyber ? `${accent}60` : "#000000",
                borderWidth: isCyber ? "1.5px" : "3px",
                boxShadow: isCyber ? `0 0 60px ${accent}25` : "8px 8px 0 #000000",
              }}
            >
              {/* ── HEADER ── */}
              <div
                className="relative px-4 py-3.5 sm:px-6 sm:py-4 border-b shrink-0"
                style={{
                  borderColor: isCyber ? `${accent}30` : "#000000",
                  borderWidth: isCyber ? "1px" : "2px",
                  backgroundColor: isCyber ? "rgba(10,15,44,0.95)" : "#F8FAFC",
                }}
              >
                {isCyber && (
                  <div className="absolute top-0 left-0 right-0 h-0.5"
                    style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                  />
                )}

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 min-w-0">
                  <div
                    className="w-28 h-28 sm:w-32 sm:h-32 aspect-square rounded-2xl overflow-hidden border shrink-0 flex items-center justify-center font-black text-3xl shadow-md"
                    style={{
                      borderColor: accent, borderWidth: isCyber ? "2px" : "3px",
                      boxShadow: isCyber ? `0 0 20px ${accent}40` : "4px 4px 0 #000000",
                      backgroundColor: isCyber ? "#0A0F2C" : "#E2E8F0",
                    }}
                  >
                    {portraitImage
                      ? <img src={portraitImage} alt={profile.heroName} className="w-full h-full object-cover object-center" />
                      : <span className="opacity-40 text-4xl" style={{ color: accent }}>{franchiseIcon}</span>
                    }
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5 text-center sm:text-left w-full">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border ${isCyber ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-amber-300 text-black border-black shadow-[1px_1px_0_#000]"}`}>
                          👑 {profile.status || "GOAT Status"}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${isCyber ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" : "bg-cyan-200 text-black border-black shadow-[1px_1px_0_#000]"}`}>
                          {franchiseIcon} {franchiseLabel}
                        </span>
                        {profile.series && (
                          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${isCyber ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-emerald-200 text-black border-black shadow-[1px_1px_0_#000]"}`}>
                            📺 {profile.series}
                          </span>
                        )}
                        {profile.country && (
                          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${isCyber ? "bg-purple-500/20 text-purple-300 border-purple-500/40" : "bg-purple-200 text-black border-black shadow-[1px_1px_0_#000]"}`}>
                            🌐 {profile.country}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                        {onLike && (
                          <button onClick={() => onLike(entry.id)} className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer flex items-center gap-1 border ${isCyber ? "bg-pink-500/20 text-pink-300 border-pink-500/40 hover:bg-pink-500/30" : "bg-pink-300 text-black border-black shadow-[1.5px_1.5px_0_#000] hover:scale-105"}`}>
                            <span>❤️</span><span>{entry.likes || 0}</span>
                          </button>
                        )}
                        {onEdit && (
                          <button onClick={() => { onClose(); onEdit(entry); }} className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer border ${isCyber ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30" : "bg-amber-400 text-black border-black shadow-[1.5px_1.5px_0_#000] hover:scale-105"}`}>
                            ✏️ Edit
                          </button>
                        )}
                        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs bg-black/10 dark:bg-white/10 theme-text-primary hover:bg-red-500 hover:text-white transition-colors cursor-pointer">✕</button>
                      </div>
                    </div>

                    <h1
                      className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight theme-text-primary"
                      style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit", color: isCyber ? accent : undefined }}
                    >
                      {profile.heroName}
                    </h1>

                    {profile.civilianName && (
                      <p className="text-xs font-mono theme-text-muted">
                        {profile.civilianName}{profile.heroType && <span className="opacity-70"> · {profile.heroType}</span>}
                      </p>
                    )}

                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap pt-0.5 text-[11px] font-mono theme-text-muted">
                      {profile.alignment && <span className="px-2 py-0.5 rounded bg-black/10 dark:bg-white/10">⚖️ {profile.alignment}</span>}
                      {profile.debutYear && <span className="px-2 py-0.5 rounded bg-black/10 dark:bg-white/10">📅 {profile.debutYear}</span>}
                      {profile.organization && <span className="px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 truncate max-w-[200px]">🏛️ {profile.organization}</span>}
                    </div>
                  </div>
                </div>

                <div
                  className="flex items-center gap-1.5 mt-3 pt-2.5 border-t overflow-x-auto scrollbar-none text-xs font-mono font-bold"
                  style={{ borderColor: isCyber ? `${accent}20` : "#00000020" }}
                >
                  {visibleTabs.map((t) => {
                    const isActive = activeTab === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-all ${
                          isActive
                            ? isCyber ? "border text-white font-black" : "bg-amber-300 text-black border-2 border-black shadow-[2px_2px_0_#000]"
                            : isCyber ? "text-white/40 hover:text-white/80 hover:bg-white/5" : "text-gray-600 hover:text-black hover:bg-gray-200"
                        }`}
                        style={isActive && isCyber ? { backgroundColor: `${accent}20`, borderColor: `${accent}60`, color: accent } : undefined}
                      >
                        <span>{t.icon}</span><span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── TAB CONTENT BODY ── */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

                {/* OVERVIEW */}
                {activeTab === "overview" && (
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="w-full md:w-64 shrink-0 space-y-4">
                      <div
                        className={`relative aspect-[3/4] w-full rounded-2xl overflow-hidden border shadow-xl group ${isCyber ? "bg-black/60" : "bg-gray-100"}`}
                        style={{ borderColor: isCyber ? `${accent}60` : "#000000", boxShadow: isCyber ? `0 0 25px ${accent}30` : "6px 6px 0 #000" }}
                      >
                        {portraitImage
                          ? <img src={portraitImage} alt={profile.heroName} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                          : <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">{franchiseIcon}</div>
                        }
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider block" style={{ color: accent }}>{franchiseLabel} · Profile Portrait</span>
                        </div>
                      </div>

                      {profile.franchiseType === "ULTRAMAN" && profile.ultraman && (
                        <div className="grid grid-cols-2 gap-2">
                          <StatPill label="Height" value={profile.ultraman.height} isCyber={isCyber} />
                          <StatPill label="Weight" value={profile.ultraman.weight} isCyber={isCyber} />
                          <StatPill label="Flight" value={profile.ultraman.flightSpeed} isCyber={isCyber} />
                          <StatPill label="Color Timer" value={profile.ultraman.colorTimer} isCyber={isCyber} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-5 w-full">
                      <SectionBox title="HERO IDENTITY" icon="⚙️" isCyber={isCyber} accent={accent}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                          <InfoRow label="Hero Name" value={profile.heroName} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Civilian Name" value={profile.civilianName} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Hero Type" value={profile.heroType} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Alignment" value={profile.alignment} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Organization" value={profile.organization} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Country" value={profile.country} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Universe" value={profile.universe} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Debut Year" value={profile.debutYear} accent={accent} isCyber={isCyber} />
                          <InfoRow label="First Appearance" value={profile.firstAppearance} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Status" value={profile.status} accent={accent} isCyber={isCyber} />
                        </div>
                      </SectionBox>

                      <SectionBox
                        title="TRANSFORMATION SYSTEM" icon="🔄" isCyber={isCyber} accent={accent}
                        visible={Boolean(profile.transformationSystem || profile.transformationDevice || profile.transformationMethod || profile.transformationPhrase || profile.baseForm)}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                          <InfoRow label="System" value={profile.transformationSystem} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Device" value={profile.transformationDevice} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Method" value={profile.transformationMethod} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Base Form" value={profile.baseForm} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Power Source" value={profile.powerSource} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Weaknesses" value={profile.weaknesses} accent={accent} isCyber={isCyber} />
                        </div>
                        {profile.transformationPhrase && (
                          <div className="mt-3 p-3 rounded-xl border" style={{ borderColor: isCyber ? `${accent}30` : "#000" }}>
                            <span className={`text-[9px] font-mono font-black uppercase tracking-wider block mb-1 ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>Transformation Phrase</span>
                            <p className="text-sm font-black italic" style={{ color: accent }}>&ldquo;{profile.transformationPhrase}&rdquo;</p>
                          </div>
                        )}
                      </SectionBox>

                      {profile.specialAbilities.length > 0 && (
                        <SectionBox title="SPECIAL ABILITIES" icon="✨" isCyber={isCyber} accent={accent}>
                          <TagChips items={profile.specialAbilities} isCyber={isCyber} accent={accent} />
                          {profile.signatureAbility && (
                            <div className="mt-3 flex items-center gap-2">
                              <span className={`text-[9px] font-mono font-black uppercase tracking-wider ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>Signature:</span>
                              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-black border ${isCyber ? "bg-red-500/20 text-red-300 border-red-500/40" : "bg-red-100 text-black border-black shadow-[1.5px_1.5px_0_#000]"}`}>
                                ⭐ {profile.signatureAbility}
                              </span>
                            </div>
                          )}
                        </SectionBox>
                      )}

                      {(profile.primaryColor || profile.suitDescription) && (
                        <SectionBox title="SUIT PROFILE" icon="🦸" isCyber={isCyber} accent={accent}>
                          <div className="flex items-center gap-3 mb-3">
                            {profile.primaryColor && (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full border-2 border-black dark:border-white/20" style={{ backgroundColor: profile.primaryColor }} />
                                <span className={`text-xs font-mono ${isCyber ? "text-white/60" : "text-gray-600"}`}>Primary</span>
                              </div>
                            )}
                            {profile.secondaryColor && (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full border-2 border-black dark:border-white/20" style={{ backgroundColor: profile.secondaryColor }} />
                                <span className={`text-xs font-mono ${isCyber ? "text-white/60" : "text-gray-600"}`}>Secondary</span>
                              </div>
                            )}
                          </div>
                          {profile.suitDescription && (
                            <p className={`text-xs leading-relaxed ${isCyber ? "text-white/60" : "text-gray-600"}`}>{profile.suitDescription}</p>
                          )}
                        </SectionBox>
                      )}

                      <SectionBox
                        title="CAST & PRODUCTION" icon="🎬" isCyber={isCyber} accent={accent}
                        visible={Boolean(profile.mainActor || profile.suitActor || profile.voiceActor || profile.productionStudio || profile.networkBroadcaster)}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                          <InfoRow label="Main Actor" value={profile.mainActor} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Suit Actor" value={profile.suitActor} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Voice Actor" value={profile.voiceActor} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Stunt Performer" value={profile.stuntPerformer} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Director" value={profile.director} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Writer" value={profile.writer} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Studio" value={profile.productionStudio} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Network" value={profile.networkBroadcaster} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Broadcast Period" value={profile.broadcastPeriod} accent={accent} isCyber={isCyber} />
                        </div>
                        {profile.productionNotes && (
                          <p className={`text-xs italic mt-2 leading-relaxed ${isCyber ? "text-white/40" : "text-gray-400"}`}>{profile.productionNotes}</p>
                        )}
                      </SectionBox>
                    </div>
                  </div>
                )}

                {/* GALLERY */}
                {activeTab === "gallery" && (
                  galleryImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {galleryImages.map((img, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          className="relative aspect-square rounded-2xl overflow-hidden border cursor-pointer group"
                          style={{ borderColor: isCyber ? `${accent}40` : "#000", borderWidth: isCyber ? "1px" : "2px", boxShadow: isCyber ? "none" : "3px 3px 0 #000" }}
                          onClick={() => { setLightboxSrc(img.src); setLightboxTitle(img.label); }}
                        >
                          <img src={img.src} alt={img.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-2xl">🔍</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState label="No gallery images. Add images in the Gallery section of the Tokusatsu Editor." isCyber={isCyber} />
                  )
                )}

                {/* LORE */}
                {activeTab === "lore" && (
                  <div className="space-y-5">
                    {entry.note && (
                      <blockquote
                        className={`p-4 rounded-2xl border text-sm italic font-medium leading-relaxed ${isCyber ? "border-cyan-500/30 bg-cyan-500/[0.04] text-cyan-200" : "border-black bg-amber-50 text-gray-900 shadow-[3px_3px_0_#000]"}`}
                        style={{ borderLeft: `4px solid ${accent}` }}
                      >
                        &ldquo;{entry.note}&rdquo;
                      </blockquote>
                    )}

                    {(entry.bio || entry.background || entry.motivation) ? (
                      <SectionBox title="BIOGRAPHY / LORE" icon="📖" isCyber={isCyber} accent={accent}>
                        {entry.bio && <p className={`text-sm leading-relaxed mb-3 ${isCyber ? "text-white/75" : "text-gray-700"}`}>{entry.bio}</p>}
                        {entry.background && (
                          <div className="mt-3">
                            <span className={`text-[10px] font-mono font-black uppercase tracking-wider block mb-1 ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>Background</span>
                            <p className={`text-sm leading-relaxed ${isCyber ? "text-white/70" : "text-gray-700"}`}>{entry.background}</p>
                          </div>
                        )}
                        {entry.motivation && (
                          <div className="mt-3">
                            <span className={`text-[10px] font-mono font-black uppercase tracking-wider block mb-1 ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>Motivation</span>
                            <p className={`text-sm leading-relaxed ${isCyber ? "text-white/70" : "text-gray-700"}`}>{entry.motivation}</p>
                          </div>
                        )}
                      </SectionBox>
                    ) : (
                      <EmptyState label="No biography recorded. Add lore in the Tokusatsu Editor." isCyber={isCyber} />
                    )}

                    {entry.traits && entry.traits.length > 0 && (
                      <SectionBox title="TRAITS" icon="🎭" isCyber={isCyber} accent={accent}>
                        <TagChips items={entry.traits} isCyber={isCyber} accent={accent} />
                      </SectionBox>
                    )}
                    {entry.characterDevelopment && (
                      <SectionBox title="CHARACTER DEVELOPMENT" icon="📈" isCyber={isCyber} accent={accent}>
                        <p className={`text-sm leading-relaxed ${isCyber ? "text-white/70" : "text-gray-700"}`}>{entry.characterDevelopment}</p>
                      </SectionBox>
                    )}
                  </div>
                )}

                {/* APPEARANCES */}
                {activeTab === "appearances" && (
                  profile.appearances.length > 0 ? (
                    <div className="space-y-3">
                      {profile.appearances.map((app, i) => (
                        <AppearanceCard key={app.id || i} appearance={app} isCyber={isCyber} accent={accent} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState label="No appearances recorded. Add appearances in the Tokusatsu Editor." isCyber={isCyber} />
                  )
                )}

                {/* FORMS */}
                {activeTab === "forms" && (
                  profile.forms.length > 0 ? (
                    <div className="space-y-4">
                      {profile.forms.map((form, i) => (
                        <FormCard key={form.id || i} form={form} isCyber={isCyber} accent={accent} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState label="No forms recorded. Add transformation forms in the Tokusatsu Editor." isCyber={isCyber} />
                  )
                )}

                {/* WEAPONS */}
                {activeTab === "weapons" && (
                  profile.weapons.length > 0 ? (
                    <div className="space-y-4">
                      {profile.weapons.map((weapon, i) => (
                        <WeaponCard key={weapon.id || i} weapon={weapon} isCyber={isCyber} accent={accent} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState label="No weapons recorded. Add weapons in the Tokusatsu Editor." isCyber={isCyber} />
                  )
                )}

                {/* VEHICLES */}
                {activeTab === "vehicles" && (
                  profile.vehicles.length > 0 ? (
                    <div className="space-y-4">
                      {profile.vehicles.map((vehicle, i) => (
                        <VehicleCard key={vehicle.id || i} vehicle={vehicle} isCyber={isCyber} accent={accent} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState label="No vehicles / rider machines recorded. Add vehicles in the Tokusatsu Editor." isCyber={isCyber} />
                  )
                )}

                {/* POWERS & FINISHERS */}
                {activeTab === "powers" && (
                  profile.abilities.length > 0 ? (
                    <div className="space-y-4">
                      {profile.abilities.filter((a) => a.isFinisher).length > 0 && (
                        <div>
                          <h3 className={`text-xs font-mono font-black uppercase tracking-widest mb-3 ${isCyber ? "text-red-400" : "text-red-600"}`}>💥 FINISHER ATTACKS</h3>
                          <div className="space-y-3">
                            {profile.abilities.filter((a) => a.isFinisher).map((ability, i) => (
                              <AbilityCard key={ability.id || i} ability={ability} isCyber={isCyber} accent={accent} />
                            ))}
                          </div>
                        </div>
                      )}
                      {profile.abilities.filter((a) => !a.isFinisher).length > 0 && (
                        <div>
                          <h3 className={`text-xs font-mono font-black uppercase tracking-widest mb-3 ${isCyber ? "text-cyan-400" : "text-gray-700"}`}>✨ POWERS & ABILITIES</h3>
                          <div className="space-y-3">
                            {profile.abilities.filter((a) => !a.isFinisher).map((ability, i) => (
                              <AbilityCard key={ability.id || i} ability={ability} isCyber={isCyber} accent={accent} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <EmptyState label="No powers or finishers recorded. Add abilities in the Tokusatsu Editor." isCyber={isCyber} />
                  )
                )}

                {/* FRANCHISE */}
                {activeTab === "franchise" && (
                  <div className="space-y-5">
                    {/* KAMEN RIDER */}
                    {profile.franchiseType === "KAMEN_RIDER" && profile.kamenRider && (
                      <>
                        <SectionBox title="KAMEN RIDER CORE DATA" icon="🏍️" isCyber={isCyber} accent={accent}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                            <InfoRow label="Rider Name" value={profile.kamenRider.riderName} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Rider System" value={profile.kamenRider.riderSystem} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Trans. Belt" value={profile.kamenRider.transformationBelt} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Trans. Device" value={profile.kamenRider.transformationDevice} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Trans. Item" value={profile.kamenRider.transformationItem} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Main Host" value={profile.kamenRider.mainHost} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Rider Machine" value={profile.kamenRider.riderMachine} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Organization" value={profile.kamenRider.riderOrganization} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Final Form" value={profile.kamenRider.finalForm} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Berserk Form" value={profile.kamenRider.berserkForm} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Series Era" value={profile.kamenRider.seriesEra} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Rider Kick" value={profile.kamenRider.riderKick} accent={accent} isCyber={isCyber} />
                          </div>
                        </SectionBox>

                        <SectionBox title="RIDER FORMS & RELATIONS" icon="⚡" isCyber={isCyber} accent={accent}
                          visible={Boolean(profile.kamenRider.riderForms?.length || profile.kamenRider.upgradeForms?.length || profile.kamenRider.alliedRiders?.length || profile.kamenRider.rivalRiders?.length || profile.kamenRider.mainVillains?.length)}>
                          <div className="space-y-4">
                            {profile.kamenRider.riderForms?.length > 0 && (
                              <div>
                                <span className={`text-[9px] font-mono font-black uppercase tracking-wider block mb-1.5 ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>Rider Forms</span>
                                <TagChips items={profile.kamenRider.riderForms} isCyber={isCyber} accent={accent} />
                              </div>
                            )}
                            {profile.kamenRider.upgradeForms?.length > 0 && (
                              <div>
                                <span className={`text-[9px] font-mono font-black uppercase tracking-wider block mb-1.5 ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>Upgrade Forms</span>
                                <TagChips items={profile.kamenRider.upgradeForms} isCyber={isCyber} accent={accent} />
                              </div>
                            )}
                            {profile.kamenRider.movieExclusiveForms?.length > 0 && (
                              <div>
                                <span className={`text-[9px] font-mono font-black uppercase tracking-wider block mb-1.5 ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>Movie Exclusive Forms</span>
                                <TagChips items={profile.kamenRider.movieExclusiveForms} isCyber={isCyber} accent={accent} />
                              </div>
                            )}
                            {profile.kamenRider.alliedRiders?.length > 0 && (
                              <div>
                                <span className={`text-[9px] font-mono font-black uppercase tracking-wider block mb-1.5 ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>Allied Riders</span>
                                <TagChips items={profile.kamenRider.alliedRiders} isCyber={isCyber} accent={accent} />
                              </div>
                            )}
                            {profile.kamenRider.rivalRiders?.length > 0 && (
                              <div>
                                <span className={`text-[9px] font-mono font-black uppercase tracking-wider block mb-1.5 ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>Rival Riders</span>
                                <TagChips items={profile.kamenRider.rivalRiders} isCyber={isCyber} accent={accent} />
                              </div>
                            )}
                            {profile.kamenRider.mainVillains?.length > 0 && (
                              <div>
                                <span className={`text-[9px] font-mono font-black uppercase tracking-wider block mb-1.5 ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>Main Villains</span>
                                <TagChips items={profile.kamenRider.mainVillains} isCyber={isCyber} accent={accent} />
                              </div>
                            )}
                            {profile.kamenRider.monsterEnemyFaction && (
                              <InfoRow label="Enemy Faction" value={profile.kamenRider.monsterEnemyFaction} accent={accent} isCyber={isCyber} />
                            )}
                          </div>
                        </SectionBox>
                      </>
                    )}

                    {/* ULTRAMAN */}
                    {profile.franchiseType === "ULTRAMAN" && profile.ultraman && (
                      <>
                        <SectionBox title="ULTRAMAN CORE DATA" icon="⚡" isCyber={isCyber} accent={accent}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                            <InfoRow label="Ultra Name" value={profile.ultraman.ultraName} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Human Host" value={profile.ultraman.humanHost} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Trans. Item" value={profile.ultraman.transformationItem} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Trans. Method" value={profile.ultraman.transformationMethod} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Color Timer" value={profile.ultraman.colorTimer} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Height" value={profile.ultraman.height} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Weight" value={profile.ultraman.weight} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Flight Speed" value={profile.ultraman.flightSpeed} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Running Speed" value={profile.ultraman.runningSpeed} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Jump Height" value={profile.ultraman.jumpHeight} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Planet Origin" value={profile.ultraman.planetOrigin} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Ultra Universe" value={profile.ultraman.ultraUniverse} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Defense Team" value={profile.ultraman.defenseTeam} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Main Rival" value={profile.ultraman.mainRival} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Series Era" value={profile.ultraman.seriesEra} accent={accent} isCyber={isCyber} />
                          </div>
                        </SectionBox>

                        <SectionBox title="BEAM ATTACKS & ALLIES" icon="🌟" isCyber={isCyber} accent={accent}
                          visible={Boolean(profile.ultraman.beamAttacks?.length || profile.ultraman.finishingAttacks?.length || profile.ultraman.ultraBrothersAllies?.length || profile.ultraman.kaijuEnemies?.length)}>
                          <div className="space-y-4">
                            {profile.ultraman.beamAttacks?.length > 0 && (
                              <div>
                                <span className={`text-[9px] font-mono font-black uppercase tracking-wider block mb-1.5 ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>Beam Attacks</span>
                                <TagChips items={profile.ultraman.beamAttacks} isCyber={isCyber} accent={accent} finisher />
                              </div>
                            )}
                            {profile.ultraman.finishingAttacks?.length > 0 && (
                              <div>
                                <span className={`text-[9px] font-mono font-black uppercase tracking-wider block mb-1.5 ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>Finishing Attacks</span>
                                <TagChips items={profile.ultraman.finishingAttacks} isCyber={isCyber} accent={accent} finisher />
                              </div>
                            )}
                            {profile.ultraman.ultraBrothersAllies?.length > 0 && (
                              <div>
                                <span className={`text-[9px] font-mono font-black uppercase tracking-wider block mb-1.5 ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>Ultra Brothers / Allies</span>
                                <TagChips items={profile.ultraman.ultraBrothersAllies} isCyber={isCyber} accent={accent} />
                              </div>
                            )}
                            {profile.ultraman.kaijuEnemies?.length > 0 && (
                              <div>
                                <span className={`text-[9px] font-mono font-black uppercase tracking-wider block mb-1.5 ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>Kaiju Enemies</span>
                                <TagChips items={profile.ultraman.kaijuEnemies} isCyber={isCyber} accent={accent} />
                              </div>
                            )}
                          </div>
                        </SectionBox>
                      </>
                    )}

                    {/* POWER RANGERS */}
                    {profile.franchiseType === "POWER_RANGERS" && profile.powerRangers && (
                      <>
                        <SectionBox title="POWER RANGERS CORE DATA" icon="🔴" isCyber={isCyber} accent={accent}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                            <InfoRow label="Ranger Name" value={profile.powerRangers.rangerName} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Civilian Identity" value={profile.powerRangers.civilianIdentity} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Ranger Color" value={profile.powerRangers.rangerColor} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Ranger Team" value={profile.powerRangers.rangerTeam} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Morphing Device" value={profile.powerRangers.morphingDevice} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Morphing Call" value={profile.powerRangers.morphingCall} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Personal Zord" value={profile.powerRangers.personalZord} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Megazord" value={profile.powerRangers.megazord} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Mentor" value={profile.powerRangers.mentor} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Power Source" value={profile.powerRangers.powerSource} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Command Center" value={profile.powerRangers.commandCenter} accent={accent} isCyber={isCyber} />
                            <InfoRow label="Series Era" value={profile.powerRangers.seriesEra} accent={accent} isCyber={isCyber} />
                          </div>
                        </SectionBox>

                        <SectionBox title="ALLIES & ENEMIES" icon="⚔️" isCyber={isCyber} accent={accent}
                          visible={Boolean(profile.powerRangers.rangerAllies?.length || profile.powerRangers.mainVillains?.length)}>
                          <div className="space-y-4">
                            {profile.powerRangers.rangerAllies?.length > 0 && (
                              <div>
                                <span className={`text-[9px] font-mono font-black uppercase tracking-wider block mb-1.5 ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>Ranger Allies</span>
                                <TagChips items={profile.powerRangers.rangerAllies} isCyber={isCyber} accent={accent} />
                              </div>
                            )}
                            {profile.powerRangers.mainVillains?.length > 0 && (
                              <div>
                                <span className={`text-[9px] font-mono font-black uppercase tracking-wider block mb-1.5 ${isCyber ? "text-cyan-400/60" : "text-gray-500"}`}>Main Villains</span>
                                <TagChips items={profile.powerRangers.mainVillains} isCyber={isCyber} accent={accent} />
                              </div>
                            )}
                          </div>
                        </SectionBox>
                      </>
                    )}

                    {/* SUPER SENTAI */}
                    {profile.franchiseType === "SUPER_SENTAI" && profile.superSentai && (
                      <SectionBox title="SUPER SENTAI CORE DATA" icon="🛡️" isCyber={isCyber} accent={accent}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                          <InfoRow label="Sentai Name" value={profile.superSentai.sentaiName} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Ranger Color" value={profile.superSentai.rangerColor} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Team Position" value={profile.superSentai.teamPosition} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Trans. Device" value={profile.superSentai.transformationDevice} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Individual Mecha" value={profile.superSentai.individualMecha} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Gattai / Combination" value={profile.superSentai.combinationGattai} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Mentor" value={profile.superSentai.mentor} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Series Era" value={profile.superSentai.seriesEra} accent={accent} isCyber={isCyber} />
                          <InfoRow label="Villain Faction" value={profile.superSentai.villainFaction} accent={accent} isCyber={isCyber} />
                        </div>
                      </SectionBox>
                    )}

                    {profile.franchiseType === "OTHER" && (
                      <EmptyState label="This Tokusatsu hero uses the shared base profile. Franchise-specific data applies to Kamen Rider, Ultraman, Power Rangers, and Super Sentai." isCyber={isCyber} />
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ImageLightboxModal
        isOpen={Boolean(lightboxSrc)}
        onClose={() => setLightboxSrc(null)}
        imageUrl={lightboxSrc}
        title={lightboxTitle}
      />
    </>
  );
}
