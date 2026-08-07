"use client";

import React from "react";
import { useTheme } from "@/lib/theme";

// Games that are gacha-type (show element/weapon/rarity/path/nation/birthday)
const GACHA_GAMES = [
  "wuthering waves",
  "honkai: star rail",
  "star rail",
  "genshin impact",
  "genshin",
  "zenless zone zero",
  "zzz",
  "arknights",
  "nikke",
  "goddess of victory",
  "punishing: gray raven",
  "pgr",
  "reverse: 1999",
  "reverse1999",
  "honkai impact",
  "honkai impact 3rd",
  "solo leveling: arise",
  "outerplane",
  "stella sora",
  "dragon ball legends",
  "blue archive",
  "path to nowhere",
  "alchemy stars",
];

// Games that are competitive (show winRate/pickRate/banRate)
const COMPETITIVE_GAMES = [
  "league of legends",
  "lol",
  "valorant",
  "overwatch",
  "dota 2",
  "dota2",
  "apex legends",
  "rainbow six",
  "r6",
  "pubg",
  "fortnite",
  "mobile legends",
  "mlbb",
  "wild rift",
  "honor of kings",
  "smite",
  "deadlock",
  "marvel rivals",
];

export function detectGameType(
  gameName?: string,
  gameCategory?: string
): "gacha" | "competitive" | "general" {
  const name = (gameName || "").toLowerCase();
  const cat = (gameCategory || "").toLowerCase();

  if (
    cat.includes("gacha") ||
    GACHA_GAMES.some((g) => name.includes(g))
  ) {
    return "gacha";
  }

  if (
    cat.includes("competitive") ||
    cat.includes("moba") ||
    cat.includes("fps") ||
    cat.includes("battle royale") ||
    COMPETITIVE_GAMES.some((g) => name.includes(g))
  ) {
    return "competitive";
  }

  return "general";
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  isCyber: boolean;
}

function Field({ label, value, onChange, placeholder, type = "text", isCyber }: FieldProps) {
  return (
    <div>
      <label
        className="block text-[10px] font-mono font-bold mb-1 uppercase tracking-wider"
        style={{ color: isCyber ? "rgba(0,245,255,0.6)" : "#6B7280" }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2 rounded-lg border text-xs font-mono theme-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
        style={{
          backgroundColor: isCyber ? "rgba(255,255,255,0.04)" : "#F9FAFB",
          borderColor: isCyber ? "rgba(255,255,255,0.12)" : "#E5E7EB",
        }}
      />
    </div>
  );
}

interface RateFieldProps extends Omit<FieldProps, "type"> {}
function RateField(props: RateFieldProps) {
  return (
    <div>
      <label
        className="block text-[10px] font-mono font-bold mb-1 uppercase tracking-wider"
        style={{ color: props.isCyber ? "rgba(0,245,255,0.6)" : "#6B7280" }}
      >
        {props.label}
      </label>
      <div className="relative">
        <input
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          className="w-full p-2 pr-8 rounded-lg border text-xs font-mono theme-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
          style={{
            backgroundColor: props.isCyber ? "rgba(255,255,255,0.04)" : "#F9FAFB",
            borderColor: props.isCyber ? "rgba(255,255,255,0.12)" : "#E5E7EB",
          }}
        />
        <span
          className="absolute right-2 top-2 text-[10px] font-mono opacity-50"
          style={{ color: props.isCyber ? "#94A3B8" : "#6B7280" }}
        >
          %
        </span>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Gacha-specific fields
// ────────────────────────────────────────────────────────────
export interface GachaFieldValues {
  element: string;
  path: string;
  weapon: string;
  rarity: string;
  nation: string;
  birthday: string;
  damageType: string;
  combatRole: string;
}

interface GachaFieldsProps {
  values: GachaFieldValues;
  onChange: (field: keyof GachaFieldValues, value: string) => void;
}

export function GachaFields({ values, onChange }: GachaFieldsProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Element / Vision" value={values.element} onChange={(v) => onChange("element", v)} placeholder="e.g. Pyro, Glacio, Quantum" isCyber={isCyber} />
        <Field label="Path / Class" value={values.path} onChange={(v) => onChange("path", v)} placeholder="e.g. Destruction, Hunt" isCyber={isCyber} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Weapon Type" value={values.weapon} onChange={(v) => onChange("weapon", v)} placeholder="e.g. Claymore, Rectifier" isCyber={isCyber} />
        <Field label="Rarity" value={values.rarity} onChange={(v) => onChange("rarity", v)} placeholder="e.g. 5-Star, SSR, A-Rank" isCyber={isCyber} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nation / Region" value={values.nation} onChange={(v) => onChange("nation", v)} placeholder="e.g. Liyue, Belobog" isCyber={isCyber} />
        <Field label="Birthday" value={values.birthday} onChange={(v) => onChange("birthday", v)} placeholder="e.g. March 7" isCyber={isCyber} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Damage Type" value={values.damageType} onChange={(v) => onChange("damageType", v)} placeholder="e.g. AoE, Single-Target" isCyber={isCyber} />
        <Field label="Combat Role" value={values.combatRole} onChange={(v) => onChange("combatRole", v)} placeholder="e.g. Main DPS, Sub-DPS" isCyber={isCyber} />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Competitive-specific fields
// ────────────────────────────────────────────────────────────
export interface CompetitiveFieldValues {
  winRate: string;
  pickRate: string;
  banRate: string;
}

interface CompetitiveFieldsProps {
  values: CompetitiveFieldValues;
  onChange: (field: keyof CompetitiveFieldValues, value: string) => void;
}

export function CompetitiveFields({ values, onChange }: CompetitiveFieldsProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <RateField label="Win Rate" value={values.winRate} onChange={(v) => onChange("winRate", v)} placeholder="54.5" isCyber={isCyber} />
        <RateField label="Pick Rate" value={values.pickRate} onChange={(v) => onChange("pickRate", v)} placeholder="12.3" isCyber={isCyber} />
        <RateField label="Ban Rate" value={values.banRate} onChange={(v) => onChange("banRate", v)} placeholder="8.1" isCyber={isCyber} />
      </div>
    </div>
  );
}
