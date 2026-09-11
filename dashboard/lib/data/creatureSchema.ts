/**
 * Creature Archive System Schema, Types, and Normalization Engine
 * Independent personal collection system for favourite pets, dragons, beasts,
 * familiars, companions, mascots, spirits, monsters, and non-human creatures.
 */

export interface CreatureMedia {
  primary?: string | null;       // Main hero artwork (detail modal / spotlight)
  card?: string | null;          // Optimized 3:4 portrait card poster
  gallery?: string[];            // Additional artwork / high-res illustrations
  favouriteMoment?: string | null; // Special memory scene / emotional moment
}

/**
 * A single canonical Form variant belonging to a parent Creature.
 * Forms represent alternate states, evolutions, transformations, powered modes,
 * elemental variants, or other recognized distinct forms of the same Creature.
 * They are NOT separate Creatures — they live under the parent Creature record.
 */
export interface CreatureForm {
  id: string;                    // Unique form id (uuid or generated slug)
  name: string;                  // e.g. "Standard Form", "Arc-V Form", "Monster Point"
  displayName?: string;          // Optional alternate display label
  description?: string;          // What makes this form distinct
  artwork?: string | null;       // Form-specific artwork URL (does not replace parent media)
  variantType?: string;          // e.g. "Evolution", "Powered Form", "Transformation", "Regional"
  tags?: string[];
  order?: number;                // Sort order for display
  createdAt?: string;
  updatedAt?: string;
}

export const CREATURE_TIERS = ["SS", "S", "A", "B", "C"] as const;
export type CreatureTier = (typeof CREATURE_TIERS)[number];

export const CREATURE_TIER_META: Record<
  CreatureTier,
  { label: string; badgeLabel: string; color: string; bgCyber: string; bgNeo: string; borderCyber: string }
> = {
  SS: {
    label: "Mythic / Supreme Bestiary",
    badgeLabel: "SS TIER",
    color: "#FFD700",
    bgCyber: "rgba(255, 215, 0, 0.15)",
    bgNeo: "#FEF08A",
    borderCyber: "rgba(255, 215, 0, 0.6)",
  },
  S: {
    label: "Legendary / Apex",
    badgeLabel: "S TIER",
    color: "#00F5FF",
    bgCyber: "rgba(0, 245, 255, 0.15)",
    bgNeo: "#BAE6FD",
    borderCyber: "rgba(0, 245, 255, 0.6)",
  },
  A: {
    label: "Great Beast / Noble",
    badgeLabel: "A TIER",
    color: "#A855F7",
    bgCyber: "rgba(168, 85, 247, 0.15)",
    bgNeo: "#E9D5FF",
    borderCyber: "rgba(168, 85, 247, 0.6)",
  },
  B: {
    label: "Valued Companion",
    badgeLabel: "B TIER",
    color: "#10B981",
    bgCyber: "rgba(16, 185, 129, 0.15)",
    bgNeo: "#BBF7D0",
    borderCyber: "rgba(16, 185, 129, 0.6)",
  },
  C: {
    label: "Familiar / Pet",
    badgeLabel: "C TIER",
    color: "#94A3B8",
    bgCyber: "rgba(148, 163, 184, 0.15)",
    bgNeo: "#E2E8F0",
    borderCyber: "rgba(148, 163, 184, 0.6)",
  },
};

export const CREATURE_RELATIONSHIP_TYPES = [
  "Partner",
  "Companion",
  "Owner",
  "Summon",
  "Trainer",
  "Mount",
  "Familiar",
  "Associated",
  "Other",
] as const;
export type CreatureRelationshipType = (typeof CREATURE_RELATIONSHIP_TYPES)[number];

export interface CreatureCharacterRef {
  characterId: string;
  characterType: "character_dict" | "game_character";
  name: string;
  avatar?: string | null;
  avatarUrl?: string | null;
  sourceTitle?: string;
  relationshipType?: string; // "Partner" | "Companion" | "Owner" | "Summon" | "Trainer" | "Mount" | "Familiar" | "Associated" | "Other"
}

export interface CreatureEntry {
  id: string;
  userId?: string | null;
  name: string;
  classification: string;        // e.g. "Dragon", "Familiar", "Pet", "Beast", "Companion", "Monster", "Mascot", "Spirit", "Animal", "Other"
  species?: string;              // e.g. "Night Fury", "Flying Bison", "Fox Spirit", "Kitsune"
  sourceTitle: string;           // e.g. "How to Train Your Dragon", "Avatar: The Last Airbender"
  originWork?: string;           // Convenience alias for sourceTitle
  mediaType: string;             // "Anime" | "Game" | "Movie" | "Drama" | "Book" | "Manga" | "Mythology" | "Other"
  sourceYear?: number;
  description?: string;          // Canonical lore / official about
  personalNote?: string;         // Personal favourite scrapbook note: "Why I Love This Creature"
  tier: CreatureTier;            // Canonical ranking tier ("SS" | "S" | "A" | "B" | "C")
  isFavorite: boolean;
  likes: number;                 // Bond / Affection count
  media: CreatureMedia;
  avatarUrl?: string | null;     // Convenience alias for media.card || media.primary
  tags: string[];
  connectedCharacters?: CreatureCharacterRef[];
  forms?: CreatureForm[];        // Optional alternate forms/transformations (canonical, single-source)
  createdAt?: string;
  updatedAt?: string;
}

// ─── Classification Presets & Helpers ────────────────────────────────────────

export interface ClassificationMeta {
  id: string;
  label: string;
  icon: string;
  color: string;
  bgCyber: string;
  bgNeo: string;
  borderCyber: string;
  borderNeo: string;
}

export const CLASSIFICATION_PRESETS: Record<string, ClassificationMeta> = {
  Dragon: {
    id: "Dragon",
    label: "Dragon",
    icon: "🐉",
    color: "#F59E0B",
    bgCyber: "rgba(245, 158, 11, 0.15)",
    bgNeo: "#FEF3C7",
    borderCyber: "rgba(245, 158, 11, 0.5)",
    borderNeo: "#000000",
  },
  Familiar: {
    id: "Familiar",
    label: "Familiar",
    icon: "✨",
    color: "#A855F7",
    bgCyber: "rgba(168, 85, 247, 0.15)",
    bgNeo: "#F3E8FF",
    borderCyber: "rgba(168, 85, 247, 0.5)",
    borderNeo: "#000000",
  },
  Pet: {
    id: "Pet",
    label: "Pet",
    icon: "🐶",
    color: "#EC4899",
    bgCyber: "rgba(236, 72, 153, 0.15)",
    bgNeo: "#FCE7F3",
    borderCyber: "rgba(236, 72, 153, 0.5)",
    borderNeo: "#000000",
  },
  Beast: {
    id: "Beast",
    label: "Beast",
    icon: "🦊",
    color: "#F97316",
    bgCyber: "rgba(249, 115, 22, 0.15)",
    bgNeo: "#FFEDD5",
    borderCyber: "rgba(249, 115, 22, 0.5)",
    borderNeo: "#000000",
  },
  Companion: {
    id: "Companion",
    label: "Companion",
    icon: "🐺",
    color: "#3B82F6",
    bgCyber: "rgba(59, 130, 246, 0.15)",
    bgNeo: "#DBEAFE",
    borderCyber: "rgba(59, 130, 246, 0.5)",
    borderNeo: "#000000",
  },
  Monster: {
    id: "Monster",
    label: "Monster",
    icon: "👾",
    color: "#84CC16",
    bgCyber: "rgba(132, 204, 22, 0.15)",
    bgNeo: "#ECFCCB",
    borderCyber: "rgba(132, 204, 22, 0.5)",
    borderNeo: "#000000",
  },
  Mascot: {
    id: "Mascot",
    label: "Mascot",
    icon: "🤖",
    color: "#06B6D4",
    bgCyber: "rgba(6, 182, 212, 0.15)",
    bgNeo: "#CFFAFE",
    borderCyber: "rgba(6, 182, 212, 0.5)",
    borderNeo: "#000000",
  },
  Spirit: {
    id: "Spirit",
    label: "Spirit",
    icon: "🌌",
    color: "#6366F1",
    bgCyber: "rgba(99, 102, 241, 0.15)",
    bgNeo: "#E0E7FF",
    borderCyber: "rgba(99, 102, 241, 0.5)",
    borderNeo: "#000000",
  },
  Animal: {
    id: "Animal",
    label: "Animal",
    icon: "🐾",
    color: "#10B981",
    bgCyber: "rgba(16, 185, 129, 0.15)",
    bgNeo: "#D1FAE5",
    borderCyber: "rgba(16, 185, 129, 0.5)",
    borderNeo: "#000000",
  },
  Other: {
    id: "Other",
    label: "Other",
    icon: "⭐",
    color: "#E2E8F0",
    bgCyber: "rgba(226, 232, 240, 0.1)",
    bgNeo: "#F1F5F9",
    borderCyber: "rgba(226, 232, 240, 0.4)",
    borderNeo: "#000000",
  },
};

export const CREATURE_MEDIA_TYPES = [
  "Anime",
  "Game",
  "Movie",
  "Drama",
  "Book",
  "Manga",
  "Mythology",
  "Other",
] as const;

export function getClassificationMeta(classification: string): ClassificationMeta {
  const normalizedKey = Object.keys(CLASSIFICATION_PRESETS).find(
    (k) => k.toLowerCase() === (classification || "").trim().toLowerCase()
  );
  if (normalizedKey) {
    return CLASSIFICATION_PRESETS[normalizedKey];
  }

  // Graceful fallback for custom, user-defined classifications
  return {
    id: classification,
    label: classification || "Creature",
    icon: "🐾",
    color: "#00F5FF",
    bgCyber: "rgba(0, 245, 255, 0.15)",
    bgNeo: "#E0F2FE",
    borderCyber: "rgba(0, 245, 255, 0.5)",
    borderNeo: "#000000",
  };
}

// ─── Validation & Normalization ──────────────────────────────────────────────

export interface ValidationError {
  path: string;
  message: string;
  severity: "error" | "warning";
}

export function validateCreatureJson(raw: unknown): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      valid: false,
      errors: [{ path: "root", message: "JSON root must be an object representing a Creature record.", severity: "error" }],
    };
  }

  const obj = raw as Record<string, any>;

  if (!obj.name || typeof obj.name !== "string" || !obj.name.trim()) {
    errors.push({ path: "name", message: "Creature name is required and cannot be empty.", severity: "error" });
  }

  if (!obj.sourceTitle || typeof obj.sourceTitle !== "string" || !obj.sourceTitle.trim()) {
    errors.push({ path: "sourceTitle", message: "Source work title is required.", severity: "error" });
  }

  if (!obj.classification || typeof obj.classification !== "string" || !obj.classification.trim()) {
    errors.push({ path: "classification", message: "Classification is required (e.g. Dragon, Familiar, Pet, Beast).", severity: "warning" });
  }

  return {
    valid: !errors.some((e) => e.severity === "error"),
    errors,
  };
}

export function normalizeCreatureJson(raw: any, fallbackId?: string): CreatureEntry {
  const media = raw.media || {};
  return {
    id: raw.id || fallbackId || `creature-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId: raw.userId || null,
    name: String(raw.name || "Unnamed Creature").trim(),
    classification: String(raw.classification || "Other").trim(),
    species: raw.species ? String(raw.species).trim() : undefined,
    sourceTitle: String(raw.sourceTitle || "Unknown Work").trim(),
    mediaType: raw.mediaType || "Anime",
    sourceYear: typeof raw.sourceYear === "number" ? raw.sourceYear : raw.sourceYear ? parseInt(String(raw.sourceYear), 10) || undefined : undefined,
    description: raw.description ? String(raw.description).trim() : "",
    personalNote: raw.personalNote ? String(raw.personalNote).trim() : "",
    tier: (["SS", "S", "A", "B", "C"].includes(raw.tier) ? raw.tier : "S") as CreatureTier,
    isFavorite: Boolean(raw.isFavorite ?? raw.favourite ?? false),
    likes: typeof raw.likes === "number" ? raw.likes : 0,
    media: {
      primary: media.primary || raw.imageUrl || raw.avatarUrl || null,
      card: media.card || media.primary || raw.imageUrl || null,
      gallery: Array.isArray(media.gallery) ? media.gallery.filter((u: any) => typeof u === "string" && u.trim()) : [],
      favouriteMoment: media.favouriteMoment || null,
    },
    tags: Array.isArray(raw.tags) ? raw.tags.map((t: any) => String(t).trim()).filter(Boolean) : [],
    connectedCharacters: Array.isArray(raw.connectedCharacters)
      ? raw.connectedCharacters
          .map((c: any) => ({
            characterId: String(c.characterId || c.id || "").trim(),
            characterType: c.characterType === "game_character" ? ("game_character" as const) : ("character_dict" as const),
            name: String(c.name || "Unknown Character").trim(),
            avatar: c.avatar || c.avatarUrl || c.imageUrl || null,
            sourceTitle: c.sourceTitle ? String(c.sourceTitle).trim() : undefined,
            relationshipType: c.relationshipType ? String(c.relationshipType).trim() : "Companion",
          }))
          .filter((c: any) => c.characterId)
      : [],
    forms: Array.isArray(raw.forms)
      ? raw.forms
          .map((f: any, idx: number): CreatureForm => ({
            id: String(f.id || `form-${idx}-${Date.now()}`).trim(),
            name: String(f.name || "Unnamed Form").trim(),
            displayName: f.displayName ? String(f.displayName).trim() : undefined,
            description: f.description ? String(f.description).trim() : undefined,
            artwork: f.artwork || null,
            variantType: f.variantType ? String(f.variantType).trim() : undefined,
            tags: Array.isArray(f.tags) ? f.tags.map((t: any) => String(t).trim()).filter(Boolean) : [],
            order: typeof f.order === "number" ? f.order : idx,
            createdAt: f.createdAt,
            updatedAt: f.updatedAt,
          }))
          .filter((f: any) => f.name)
      : [],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function exportCreatureToJson(creature: Partial<CreatureEntry>) {
  return {
    id: creature.id,
    name: creature.name,
    classification: creature.classification,
    species: creature.species || undefined,
    sourceTitle: creature.sourceTitle,
    mediaType: creature.mediaType,
    sourceYear: creature.sourceYear || undefined,
    description: creature.description || undefined,
    personalNote: creature.personalNote || undefined,
    tier: creature.tier || "S",
    isFavorite: Boolean(creature.isFavorite),
    likes: creature.likes || 0,
    media: {
      primary: creature.media?.primary || undefined,
      card: creature.media?.card || undefined,
      gallery: creature.media?.gallery && creature.media.gallery.length > 0 ? creature.media.gallery : undefined,
      favouriteMoment: creature.media?.favouriteMoment || undefined,
    },
    tags: creature.tags && creature.tags.length > 0 ? creature.tags : undefined,
    connectedCharacters:
      creature.connectedCharacters && creature.connectedCharacters.length > 0
        ? creature.connectedCharacters
        : undefined,
    forms:
      creature.forms && creature.forms.length > 0
        ? creature.forms
        : undefined,
  };
}

// ─── Guest Sandbox Sample Data ──────────────────────────────────────────────

export const SAMPLE_CREATURES: CreatureEntry[] = [
  {
    id: "sample-toothless",
    userId: null,
    name: "Toothless",
    classification: "Dragon",
    species: "Night Fury",
    sourceTitle: "How to Train Your Dragon",
    mediaType: "Movie",
    sourceYear: 2010,
    description: "The rarest and most intelligent dragon species, known as the 'unholy offspring of lightning and death'. In reality, he is intensely loyal, playful as a giant feline, and shares an unbreakable bond with Hiccup.",
    personalNote: "The gold standard of mythical companions. The way his body language alternates between lethal apex predator and goofy puppy captures pure cinematic magic.",
    tier: "SS",
    isFavorite: true,
    likes: 128,
    media: {
      primary: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80",
      card: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80"
      ],
      favouriteMoment: "The iconic touch test where Hiccup turns away and Toothless leans into his hand.",
    },
    tags: ["Night Fury", "Alpha", "Plasma Blast", "True Friend"],
    connectedCharacters: [
      {
        characterId: "guest-char-1",
        characterType: "game_character",
        name: "Acheron",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
        sourceTitle: "Honkai: Star Rail",
        relationshipType: "Companion",
      },
      {
        characterId: "sample-hiccup",
        characterType: "character_dict",
        name: "Hiccup Horrendous Haddock III",
        sourceTitle: "How to Train Your Dragon",
        relationshipType: "Partner",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sample-appa",
    userId: null,
    name: "Appa",
    classification: "Companion",
    species: "Sky Bison",
    sourceTitle: "Avatar: The Last Airbender",
    mediaType: "Anime",
    sourceYear: 2005,
    description: "A ten-ton flying bison with six legs and an airbending tail who served as the faithful spirit guide and primary transport of Avatar Aang and Team Avatar throughout the Hundred Year War.",
    personalNote: "Appa's Lost Days is one of the most heartbreaking, emotionally resonant episodes in television history. 'Yip Yip' carries immense warmth.",
    tier: "SS",
    isFavorite: true,
    likes: 95,
    media: {
      primary: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
      card: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
      gallery: [],
      favouriteMoment: "Aang reuniting with Appa in Lake Laogai.",
    },
    tags: ["Airbender", "Sky Bison", "Team Avatar", "Gentle Giant"],
    connectedCharacters: [
      {
        characterId: "guest-hof-1",
        characterType: "character_dict",
        name: "Tao Tsuchiya",
        sourceTitle: "Alice in Borderland",
        relationshipType: "Companion",
      },
      {
        characterId: "sample-aang",
        characterType: "character_dict",
        name: "Avatar Aang",
        sourceTitle: "Avatar: The Last Airbender",
        relationshipType: "Companion",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sample-chopper",
    userId: null,
    name: "Tony Tony Chopper",
    classification: "Mascot",
    species: "Blue-Nosed Reindeer",
    sourceTitle: "One Piece",
    mediaType: "Anime",
    sourceYear: 1999,
    description: "The doctor of the Straw Hat Pirates. After consuming the Human-Human Fruit, he gained human intelligence, speech, and multiple transformation points, dreaming of curing every disease in the world.",
    personalNote: "He hides behind walls backwards when praised and screams at people for complimenting him while dancing with pure joy. An absolute national treasure.",
    tier: "S",
    isFavorite: true,
    likes: 84,
    media: {
      primary: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80",
      card: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
      gallery: [],
      favouriteMoment: "The cherry blossom fireworks cure over Drum Island.",
    },
    tags: ["Doctor", "Cotton Candy Lover", "Monster Point", "Straw Hat"],
    connectedCharacters: [
      {
        characterId: "sample-luffy",
        characterType: "character_dict",
        name: "Monkey D. Luffy",
        sourceTitle: "One Piece",
        relationshipType: "Companion",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sample-kurama",
    userId: null,
    name: "Kurama",
    classification: "Beast",
    species: "Nine-Tailed Fox (Kyuubi)",
    sourceTitle: "Naruto Shippuden",
    mediaType: "Anime",
    sourceYear: 2002,
    description: "One of the nine Tailed Beasts born of the Ten-Tails chakra. Initially viewing humanity with deep cynicism and hatred, his decade-long bond with Naruto transformed him into an unyielding protector.",
    personalNote: "The moment Naruto freed Kurama from his torii gates and called him a comrade from the Hidden Leaf still gives me goosebumps every single time.",
    tier: "S",
    isFavorite: false,
    likes: 67,
    media: {
      primary: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
      card: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
      gallery: [],
      favouriteMoment: "Baryon Mode final fist bump.",
    },
    tags: ["Tailed Beast", "Kitsune", "Chakra", "Baryon Mode"],
    connectedCharacters: [
      {
        characterId: "sample-naruto",
        characterType: "character_dict",
        name: "Naruto Uzumaki",
        sourceTitle: "Naruto Shippuden",
        relationshipType: "Partner",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sample-haku",
    userId: null,
    name: "Nigihayami Kohakunushi",
    classification: "Spirit",
    species: "River Dragon Spirit",
    sourceTitle: "Spirited Away",
    mediaType: "Anime",
    sourceYear: 2001,
    description: "The spirit of the Kohaku River who takes the form of a white, serpentine dragon with emerald mane and piercing eyes. He helps Chihiro survive Yubaba's bathhouse.",
    personalNote: "The aesthetic of the Eastern serpentine river dragon gliding through the evening clouds with flower petals remains visually peak Ghibli.",
    tier: "A",
    isFavorite: false,
    likes: 53,
    media: {
      primary: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
      card: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
      gallery: [],
      favouriteMoment: "Chihiro remembering his real name as they fall through the sky.",
    },
    tags: ["River Spirit", "Ghibli", "Dragon", "Kohaku"],
    connectedCharacters: [
      {
        characterId: "sample-chihiro",
        characterType: "character_dict",
        name: "Chihiro Ogino",
        sourceTitle: "Spirited Away",
        relationshipType: "Companion",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
