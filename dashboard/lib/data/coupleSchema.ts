/**
 * Couple & Romance System Schema, Types, and JSON Validation Engine
 */

export interface CoupleTimelineEvent {
  id: string;
  title: string;
  description: string;
  episode?: string;
  date?: string;
  media?: string | null;
  order?: number;
}

export interface CoupleMoment {
  id: string;
  category: string; // e.g. "Favourite Scene", "Most Romantic", "Best Confession"
  title: string;
  description: string;
  episode?: string;
  media?: string | null;
  order?: number;
}

export interface CoupleChemistry {
  communication: number; // 1 - 10 or 1 - 5 (standard default 1-10)
  trust: number;
  loyalty: number;
  support: number;
  compatibility: number;
  growth: number;
  affection: number;
  humor: number;
  description?: string;
}

export interface CoupleGreenFlags {
  partnerA: string[];
  partnerB: string[];
}

export interface CouplePersonalNotes {
  whyILoveThem?: string;
  relationshipAnalysis?: string;
}

export interface CoupleMedia {
  cover?: string | null;
  card?: string | null;
  gallery?: string[];
}

export interface CouplePartnerRef {
  characterId?: string | null; // Ref to Character Dictionary (HallOfFame / Dossier)
  name?: string;
  avatar?: string | null;
  role?: string;
}

export interface CoupleSource {
  title: string;
  mediaType: string; // e.g. "Anime" | "Drama" | "Movie" | "Game" | "Other"
  country?: string;  // e.g. "Japan", "South Korea", "China", "Hollywood"
  year?: number;
}

export interface CoupleRelationship {
  status: "canon" | "endgame" | "developing" | "slow_burn" | "ambiguous" | "separated" | "unresolved" | string;
  ending?: "endgame" | "happy" | "open" | "tragic" | "unresolved" | string;
  dynamics: string[];
  description?: string;
}

export interface CoupleEntry {
  id: string;
  userId?: string | null;
  coupleName: string;
  partnerA: CouplePartnerRef;
  partnerB: CouplePartnerRef;
  source: CoupleSource;
  relationship: CoupleRelationship;
  tier: "SS" | "S" | "A" | "B" | "C";
  isFavorite: boolean;
  likes: number;
  greenFlags: CoupleGreenFlags;
  chemistry: CoupleChemistry;
  timeline: CoupleTimelineEvent[];
  favouriteMoments: CoupleMoment[];
  personalNotes: CouplePersonalNotes;
  media: CoupleMedia;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Standard Vocabulary Options ─────────────────────────────────────────────

export const RELATIONSHIP_STATUS_OPTIONS = [
  { id: "canon", label: "Canon", color: "#10B981", badgeBg: "rgba(16,185,129,0.15)", icon: "💍" },
  { id: "endgame", label: "Endgame", color: "#EC4899", badgeBg: "rgba(236,72,153,0.15)", icon: "👑" },
  { id: "developing", label: "Developing", color: "#00F5FF", badgeBg: "rgba(0,245,255,0.15)", icon: "🌱" },
  { id: "slow_burn", label: "Slow Burn", color: "#F59E0B", badgeBg: "rgba(245,158,11,0.15)", icon: "🔥" },
  { id: "ambiguous", label: "Ambiguous", color: "#8B5CF6", badgeBg: "rgba(139,92,246,0.15)", icon: "❓" },
  { id: "separated", label: "Separated", color: "#64748B", badgeBg: "rgba(100,116,139,0.15)", icon: "💔" },
  { id: "unresolved", label: "Unresolved", color: "#EF4444", badgeBg: "rgba(239,68,68,0.15)", icon: "⏳" },
];

export const RELATIONSHIP_ENDING_OPTIONS = [
  { id: "endgame", label: "Endgame / Married", icon: "💍" },
  { id: "happy", label: "Happy Together", icon: "✨" },
  { id: "open", label: "Open-Ended", icon: "🌅" },
  { id: "tragic", label: "Bittersweet / Tragic", icon: "🥀" },
  { id: "unresolved", label: "Unresolved", icon: "⏳" },
];

export const POPULAR_DYNAMICS = [
  "Friends to Lovers",
  "Enemies to Lovers",
  "Slow Burn",
  "Childhood Friends",
  "Opposites Attract",
  "Mutual Pining",
  "Fake Dating",
  "Forced Proximity",
  "Second Chance",
  "Workplace Romance",
  "Supportive Partners",
  "Soulmates",
  "Power Couple",
  "Grumpy × Sunshine",
  "Found Family",
  "Master × Bodyguard",
  "Royalty × Commoner",
];

export const COUPLE_MEDIA_TYPES = [
  "Anime",
  "Drama",
  "Movie",
  "Game",
  "Manga / Manhwa",
  "Novel",
  "Other",
];

export const COUPLE_TIERS: Array<CoupleEntry["tier"]> = ["SS", "S", "A", "B", "C"];

export const TIER_COLORS: Record<CoupleEntry["tier"], { label: string; color: string; bgCyber: string; bgNeo: string }> = {
  SS: { label: "SS Tier", color: "#EC4899", bgCyber: "rgba(236,72,153,0.2)", bgNeo: "#FCE7F3" },
  S:  { label: "S Tier",  color: "#EAB308", bgCyber: "rgba(234,179,8,0.2)",   bgNeo: "#FEF9C3" },
  A:  { label: "A Tier",  color: "#00F5FF", bgCyber: "rgba(0,245,255,0.2)",  bgNeo: "#CCFBF1" },
  B:  { label: "B Tier",  color: "#3B82F6", bgCyber: "rgba(59,130,246,0.2)",  bgNeo: "#DBEAFE" },
  C:  { label: "C Tier",  color: "#94A3B8", bgCyber: "rgba(148,163,184,0.2)", bgNeo: "#F1F5F9" },
};

export const POPULAR_MOMENT_CATEGORIES = [
  "Favourite Scene",
  "Most Romantic Moment",
  "Best Confession",
  "Funniest Moment",
  "Most Emotional Moment",
  "Best Relationship Development",
  "Signature Moment",
];

export const CHEMISTRY_DIMENSIONS = [
  { key: "communication", label: "Communication", icon: "💬" },
  { key: "trust",         label: "Trust",         icon: "🤝" },
  { key: "loyalty",       label: "Loyalty",       icon: "🛡️" },
  { key: "support",       label: "Support",       icon: "🫂" },
  { key: "compatibility", label: "Compatibility", icon: "🧩" },
  { key: "growth",        label: "Growth",        icon: "🌱" },
  { key: "affection",     label: "Affection",     icon: "💖" },
  { key: "humor",         label: "Humor",         icon: "😄" },
] as const;

// ─── Validation Types ────────────────────────────────────────────────────────

export interface ValidationError {
  path: string;
  message: string;
  severity: "error" | "warning";
}

export interface FieldDiff {
  path: string;
  oldValue: any;
  newValue: any;
  type: "added" | "changed" | "removed";
}

// ─── JSON Validation ─────────────────────────────────────────────────────────

export function validateCoupleJson(raw: unknown): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      valid: false,
      errors: [{ path: "root", message: "JSON root must be an object representing a Couple record.", severity: "error" }],
    };
  }

  const obj = raw as Record<string, any>;

  // Required Fields
  if (!obj.coupleName || typeof obj.coupleName !== "string" || !obj.coupleName.trim()) {
    errors.push({ path: "coupleName", message: "coupleName is required and must be a non-empty string.", severity: "error" });
  }

  // Source object
  if (!obj.source || typeof obj.source !== "object") {
    errors.push({ path: "source", message: "source must be an object with at least a title.", severity: "error" });
  } else {
    if (!obj.source.title || typeof obj.source.title !== "string") {
      errors.push({ path: "source.title", message: "source.title is required.", severity: "error" });
    }
  }

  // Partner A
  if (!obj.partnerA || typeof obj.partnerA !== "object") {
    errors.push({ path: "partnerA", message: "partnerA must be an object (can contain characterId or name).", severity: "error" });
  } else if (!obj.partnerA.characterId && !obj.partnerA.name) {
    errors.push({ path: "partnerA", message: "partnerA should have at least a characterId reference or a fallback name.", severity: "warning" });
  }

  // Partner B
  if (!obj.partnerB || typeof obj.partnerB !== "object") {
    errors.push({ path: "partnerB", message: "partnerB must be an object (can contain characterId or name).", severity: "error" });
  } else if (!obj.partnerB.characterId && !obj.partnerB.name) {
    errors.push({ path: "partnerB", message: "partnerB should have at least a characterId reference or a fallback name.", severity: "warning" });
  }

  // Tier
  if (obj.tier && !["SS", "S", "A", "B", "C"].includes(obj.tier)) {
    errors.push({ path: "tier", message: 'tier must be one of "SS", "S", "A", "B", "C".', severity: "warning" });
  }

  // Chemistry dimensions check
  if (obj.chemistry && typeof obj.chemistry === "object") {
    for (const dim of CHEMISTRY_DIMENSIONS) {
      const val = obj.chemistry[dim.key];
      if (val !== undefined && (typeof val !== "number" || val < 1 || val > 10)) {
        errors.push({ path: `chemistry.${dim.key}`, message: `${dim.label} rating must be a number between 1 and 10.`, severity: "warning" });
      }
    }
  }

  // Timeline array check
  if (obj.timeline && !Array.isArray(obj.timeline)) {
    errors.push({ path: "timeline", message: "timeline must be an array of milestone events.", severity: "error" });
  }

  // Moments array check
  if (obj.favouriteMoments && !Array.isArray(obj.favouriteMoments)) {
    errors.push({ path: "favouriteMoments", message: "favouriteMoments must be an array of moment objects.", severity: "error" });
  }

  const hasErrors = errors.some((e) => e.severity === "error");
  return { valid: !hasErrors, errors };
}

// ─── Normalizer ──────────────────────────────────────────────────────────────

export function normalizeCoupleJson(raw: any, fallbackId?: string): CoupleEntry {
  const pA = raw.partnerA || {};
  const pB = raw.partnerB || {};
  const src = raw.source || {};
  const rel = raw.relationship || {};
  const gf = raw.greenFlags || {};
  const chem = raw.chemistry || {};
  const notes = raw.personalNotes || {};
  const media = raw.media || {};

  return {
    id: raw.id || fallbackId || `couple-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId: raw.userId || null,
    coupleName: String(raw.coupleName || `${pA.name || "Partner A"} × ${pB.name || "Partner B"}`).trim(),
    partnerA: {
      characterId: pA.characterId || null,
      name: pA.name || "",
      avatar: pA.avatar || null,
      role: pA.role || "",
    },
    partnerB: {
      characterId: pB.characterId || null,
      name: pB.name || "",
      avatar: pB.avatar || null,
      role: pB.role || "",
    },
    source: {
      title: src.title || "Untitled Work",
      mediaType: src.mediaType || "Anime",
      country: src.country || "Japan",
      year: typeof src.year === "number" ? src.year : src.year ? parseInt(String(src.year), 10) || undefined : undefined,
    },
    relationship: {
      status: rel.status || "canon",
      ending: rel.ending || "endgame",
      dynamics: Array.isArray(rel.dynamics) ? rel.dynamics : [],
      description: rel.description || "",
    },
    tier: (["SS", "S", "A", "B", "C"].includes(raw.tier) ? raw.tier : "S") as CoupleEntry["tier"],
    isFavorite: Boolean(raw.isFavorite ?? raw.favourite ?? false),
    likes: typeof raw.likes === "number" ? raw.likes : 0,
    greenFlags: {
      partnerA: Array.isArray(gf.partnerA) ? gf.partnerA : [],
      partnerB: Array.isArray(gf.partnerB) ? gf.partnerB : [],
    },
    chemistry: {
      communication: typeof chem.communication === "number" ? chem.communication : 8,
      trust: typeof chem.trust === "number" ? chem.trust : 8,
      loyalty: typeof chem.loyalty === "number" ? chem.loyalty : 9,
      support: typeof chem.support === "number" ? chem.support : 8,
      compatibility: typeof chem.compatibility === "number" ? chem.compatibility : 8,
      growth: typeof chem.growth === "number" ? chem.growth : 8,
      affection: typeof chem.affection === "number" ? chem.affection : 8,
      humor: typeof chem.humor === "number" ? chem.humor : 7,
      description: chem.description || "",
    },
    timeline: Array.isArray(raw.timeline)
      ? raw.timeline.map((evt: any, i: number) => ({
          id: evt.id || `tl-${i + 1}`,
          title: evt.title || `Milestone ${i + 1}`,
          description: evt.description || "",
          episode: evt.episode || "",
          date: evt.date || "",
          media: evt.media || null,
          order: typeof evt.order === "number" ? evt.order : i,
        }))
      : [],
    favouriteMoments: Array.isArray(raw.favouriteMoments)
      ? raw.favouriteMoments.map((m: any, i: number) => ({
          id: m.id || `moment-${i + 1}`,
          category: m.category || "Favourite Scene",
          title: m.title || `Moment ${i + 1}`,
          description: m.description || "",
          episode: m.episode || "",
          media: m.media || null,
          order: typeof m.order === "number" ? m.order : i,
        }))
      : [],
    personalNotes: {
      whyILoveThem: notes.whyILoveThem || "",
      relationshipAnalysis: notes.relationshipAnalysis || "",
    },
    media: {
      cover: media.cover || null,
      card: media.card || null,
      gallery: Array.isArray(media.gallery) ? media.gallery : [],
    },
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

// ─── Clean Exporter ──────────────────────────────────────────────────────────

export function exportCoupleToJson(couple: Partial<CoupleEntry>) {
  return {
    id: couple.id,
    coupleName: couple.coupleName,
    partnerA: couple.partnerA
      ? {
          characterId: couple.partnerA.characterId || undefined,
          name: couple.partnerA.name || undefined,
          avatar: couple.partnerA.avatar || undefined,
          role: couple.partnerA.role || undefined,
        }
      : undefined,
    partnerB: couple.partnerB
      ? {
          characterId: couple.partnerB.characterId || undefined,
          name: couple.partnerB.name || undefined,
          avatar: couple.partnerB.avatar || undefined,
          role: couple.partnerB.role || undefined,
        }
      : undefined,
    source: couple.source,
    relationship: couple.relationship,
    tier: couple.tier,
    isFavorite: couple.isFavorite,
    likes: couple.likes,
    greenFlags: couple.greenFlags,
    chemistry: couple.chemistry,
    timeline: couple.timeline,
    favouriteMoments: couple.favouriteMoments,
    personalNotes: couple.personalNotes,
    media: couple.media,
  };
}

// ─── Diffing ─────────────────────────────────────────────────────────────────

export function diffCoupleProfiles(original: Partial<CoupleEntry>, updated: Partial<CoupleEntry>): FieldDiff[] {
  const diffs: FieldDiff[] = [];
  const keys = new Set([...Object.keys(original), ...Object.keys(updated)]);

  for (const k of keys) {
    if (["createdAt", "updatedAt", "userId"].includes(k)) continue;
    const oldVal = (original as any)[k];
    const newVal = (updated as any)[k];

    const oldStr = JSON.stringify(oldVal);
    const newStr = JSON.stringify(newVal);

    if (oldVal === undefined && newVal !== undefined) {
      diffs.push({ path: k, oldValue: undefined, newValue: newVal, type: "added" });
    } else if (oldVal !== undefined && newVal === undefined) {
      diffs.push({ path: k, oldValue: oldVal, newValue: undefined, type: "removed" });
    } else if (oldStr !== newStr) {
      diffs.push({ path: k, oldValue: oldVal, newValue: newVal, type: "changed" });
    }
  }

  return diffs;
}

export function summarizeDiff(diffs: FieldDiff[]): string {
  if (diffs.length === 0) return "No changes detected.";
  const added = diffs.filter((d) => d.type === "added").length;
  const changed = diffs.filter((d) => d.type === "changed").length;
  const removed = diffs.filter((d) => d.type === "removed").length;

  const parts: string[] = [];
  if (added) parts.push(`${added} added`);
  if (changed) parts.push(`${changed} modified`);
  if (removed) parts.push(`${removed} removed`);
  return parts.join(", ");
}
