/**
 * elementTheme.ts
 *
 * GAME CHARACTER ELEMENT VISUAL SYSTEM — MASTER ARCHITECTURE
 *
 * Centralized Visual Grouping system for Game Character inspection.
 * Standardizes elemental visual identity across all 19 supported games
 * WITHOUT renaming, overwriting, or altering canonical DB element strings.
 */

export type ElementCategory =
  | "fusion"    // 🔥 FIRE (Fire, Pyro, Fusion, Flame, Heat, Ignis, Burn, Thermal)
  | "glacio"    // ❄️ ICE (Ice, Cryo, Glacio, Frost, Freeze, Glaciation)
  | "electro"   // ⚡ ELECTRIC (Electro, Lightning, Electric, Volt, Thunder)
  | "aero"      // 🌪️ WIND (Wind, Anemo, Aero, Ventus, Gale)
  | "hydro"     // 💧 WATER (Water, Hydro, Aqua, Liquid)
  | "dendro"    // 🌿 NATURE (Dendro, Nature, Plant, Flora, Bio)
  | "earth"     // 🪨 EARTH (Geo, Earth, Terra, Mineral)
  | "spectro"   // ✨ LIGHT (Light, Spectro, Lux, Radiant, LGT, Imaginary, Arts)
  | "havoc"     // 🌑 DARK (Dark, Havoc, Umbra, Abyss, Shadow, Void)
  | "cosmic"    // 🌌 COSMIC (Quantum, Ether, Cosmic, Astral, Star, Altered, Stardust)
  | "toxic"     // ☠️ TOXIC (Poison, Toxic, Venom, Corrosion, Acid)
  | "physical"  // ⚙️ PHYSICAL (Physical, Normal, Neutral, Iron, Striker, Impact, Slash, Strike, Kinetic)
  | "neutral"   // Neutral fallback
  | "db_red"    // 🔴 DB Legends RED
  | "db_blu"    // 🔵 DB Legends BLU
  | "db_grn"    // 🟢 DB Legends GRN
  | "db_pur"    // 🟣 DB Legends PUR
  | "db_yel";   // 🟡 DB Legends YEL

export type ParticleType =
  | "ember"
  | "ice"
  | "spark"
  | "wind"
  | "droplet"
  | "leaf"
  | "dust"
  | "mote"
  | "shadow"
  | "cosmic"
  | "toxic"
  | "neutral"
  | "db_red"
  | "db_blu"
  | "db_grn"
  | "db_pur"
  | "db_yel";

export interface ElementTheme {
  category: ElementCategory;
  rawName: string;
  displayName: string;
  primaryColor: string;     // Main vibrant accent hex
  secondaryColor: string;   // Complementary accent hex
  glowColorRgba: string;    // Rgba string for atmospheric aura
  particleType: ParticleType;
  particleColors: string[];
  icon: string;
  badgeBgCyber: string;
  badgeBorderCyber: string;
  badgeTextCyber: string;
  badgeBgBrutal: string;
  badgeBorderBrutal: string;
  badgeTextBrutal: string;
  cardBorderGlowCyber: string;
  cardBorderGlowBrutal: string;
  headerAuraGradientCyber: string;
  headerAuraGradientBrutal: string;
}

/**
 * Resolves the visual element group based on game name and canonical element string.
 * Special handling for DB Legends (Attribute colors) and Reverse: 1999 (Afflatus categories).
 */
export function getVisualElementCategory(
  gameName?: string | null,
  elementName?: string | null
): ElementCategory {
  const gClean = (gameName || "").trim().toLowerCase();
  const eClean = (elementName || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

  if (!eClean) return "neutral";

  // ── 1. DRAGON BALL LEGENDS (Dedicated attribute color mapping) ─────────────
  if (gClean.includes("dragon ball") || gClean.includes("db legends") || gClean === "dbl") {
    if (eClean === "red" || eClean === "dblred") return "db_red";
    if (eClean === "blu" || eClean === "blue" || eClean === "dblblu") return "db_blu";
    if (eClean === "grn" || eClean === "green" || eClean === "dblgrn") return "db_grn";
    if (eClean === "pur" || eClean === "purple" || eClean === "dblpur") return "db_pur";
    if (eClean === "yel" || eClean === "yellow" || eClean === "dblyel") return "db_yel";
    if (eClean === "impact" || eClean === "strike" || eClean === "physical") return "physical";
  }

  // ── 2. REVERSE: 1999 (Afflatus Visual Mapping) ──────────────────────────────
  if (gClean.includes("reverse: 1999") || gClean.includes("reverse 1999")) {
    if (eClean === "beast") return "fusion";
    if (eClean === "plant") return "dendro";
    if (eClean === "mineral") return "earth";
    if (eClean === "star") return "cosmic";
    if (eClean === "spirit") return "spectro";
    if (eClean === "intellect" || eClean === "intellectual") return "spectro";
  }

  // ── 3. NON-ELEMENTAL GAMES (Default to neutral) ───────────────────────────
  const nonElementalGames = [
    "mobile legends",
    "valorant",
    "umamusume",
    "pubg",
  ];
  if (nonElementalGames.some((neg) => gClean.includes(neg))) {
    if (["none", "na", "speed", "stamina", "turf", "dirt", "racing", "physical"].includes(eClean)) {
      return "neutral";
    }
  }

  // ── 4. STANDARD CANONICAL ELEMENT DICTIONARY ───────────────────────────────
  // FIRE / FUSION
  if (["fusion", "pyro", "fire", "thermal", "flame", "heat", "ignis", "burn", "ignition"].includes(eClean)) {
    return "fusion";
  }

  // ICE / GLACIO
  if (["glacio", "cryo", "ice", "frost", "freeze", "glaciation"].includes(eClean)) {
    return "glacio";
  }

  // ELECTRIC / ELECTRO
  if (["electro", "lightning", "volt", "electric", "thunder"].includes(eClean)) {
    return "electro";
  }

  // WIND / AERO
  if (["aero", "anemo", "wind", "gale", "ventus"].includes(eClean)) {
    return "aero";
  }

  // WATER / HYDRO
  if (["hydro", "water", "liquid", "aqua"].includes(eClean)) {
    return "hydro";
  }

  // NATURE / DENDRO
  if (["dendro", "nature", "plant", "flora", "bio"].includes(eClean)) {
    return "dendro";
  }

  // EARTH / GEO
  if (["geo", "earth", "terra", "mineral"].includes(eClean)) {
    return "earth";
  }

  // LIGHT / SPECTRO
  if (["spectro", "light", "lux", "radiant", "lgt", "imaginary", "sun", "luminous", "arts"].includes(eClean)) {
    return "spectro";
  }

  // DARK / HAVOC
  if (["havoc", "dark", "umbra", "abyss", "abyssal", "shadow", "void"].includes(eClean)) {
    return "havoc";
  }

  // COSMIC / QUANTUM / ETHER
  if (["quantum", "ether", "cosmic", "astral", "star", "auricink", "altered", "stardust"].includes(eClean)) {
    return "cosmic";
  }

  // TOXIC / CORROSION
  if (["poison", "toxic", "venom", "corrosion", "acid"].includes(eClean)) {
    return "toxic";
  }

  // PHYSICAL / NEUTRAL
  if (["physical", "kinetic", "normal", "iron", "striker", "impact", "slash", "strike", "mech", "mecha", "psy", "psychic"].includes(eClean)) {
    return "physical";
  }

  return "neutral";
}

/**
 * Returns complete visual theme data for a game character element.
 * Accepts optional gameName to handle game-specific rules (DB Legends, Reverse 1999).
 */
export function getElementTheme(
  gameNameOrElement?: string | null,
  elementNameOrAccent?: string | null,
  accentOverride?: string | null
): ElementTheme {
  let gameName: string | null = null;
  let elementName: string | null = null;
  let accent: string | null = null;

  // Handle flexible arguments: getElementTheme(element), getElementTheme(game, element), getElementTheme(game, element, accent)
  if (arguments.length === 1) {
    elementName = gameNameOrElement || null;
  } else if (arguments.length === 2) {
    if (elementNameOrAccent && (elementNameOrAccent.startsWith("#") || elementNameOrAccent.startsWith("rgb"))) {
      elementName = gameNameOrElement || null;
      accent = elementNameOrAccent;
    } else {
      gameName = gameNameOrElement || null;
      elementName = elementNameOrAccent || null;
    }
  } else {
    gameName = gameNameOrElement || null;
    elementName = elementNameOrAccent || null;
    accent = accentOverride || null;
  }

  const category = getVisualElementCategory(gameName, elementName);
  const raw = (elementName || "Universal").trim();

  switch (category) {
    // ── 🔥 FIRE ─────────────────────────────────────────────────────────────
    case "fusion":
      return {
        category: "fusion",
        rawName: raw,
        displayName: raw,
        primaryColor: "#FF6B35",
        secondaryColor: "#EF4444",
        glowColorRgba: "rgba(255, 107, 53, 0.35)",
        particleType: "ember",
        particleColors: ["#F97316", "#F59E0B", "#EF4444", "#FF8C42"],
        icon: "🔥",
        badgeBgCyber: "rgba(255, 107, 53, 0.15)",
        badgeBorderCyber: "rgba(255, 107, 53, 0.45)",
        badgeTextCyber: "#FF8C42",
        badgeBgBrutal: "#FFEDD5",
        badgeBorderBrutal: "#C2410C",
        badgeTextBrutal: "#9A3412",
        cardBorderGlowCyber: "0 0 16px rgba(255, 107, 53, 0.25)",
        cardBorderGlowBrutal: "3px 3px 0px #C2410C",
        headerAuraGradientCyber: "radial-gradient(ellipse at 50% 0%, rgba(255, 107, 53, 0.38) 0%, rgba(239, 68, 68, 0.12) 50%, transparent 80%)",
        headerAuraGradientBrutal: "linear-gradient(180deg, rgba(255, 237, 213, 0.6) 0%, transparent 100%)",
      };

    // ── ❄️ ICE ───────────────────────────────────────────────────────────────
    case "glacio":
      return {
        category: "glacio",
        rawName: raw,
        displayName: raw,
        primaryColor: "#38BDF8",
        secondaryColor: "#7DD3FC",
        glowColorRgba: "rgba(56, 189, 248, 0.35)",
        particleType: "ice",
        particleColors: ["#7DD3FC", "#E0F2FE", "#38BDF8", "#BAE6FD"],
        icon: "❄️",
        badgeBgCyber: "rgba(56, 189, 248, 0.15)",
        badgeBorderCyber: "rgba(56, 189, 248, 0.45)",
        badgeTextCyber: "#7DD3FC",
        badgeBgBrutal: "#E0F2FE",
        badgeBorderBrutal: "#0284C7",
        badgeTextBrutal: "#0369A1",
        cardBorderGlowCyber: "0 0 16px rgba(56, 189, 248, 0.25)",
        cardBorderGlowBrutal: "3px 3px 0px #0284C7",
        headerAuraGradientCyber: "radial-gradient(ellipse at 50% 0%, rgba(56, 189, 248, 0.38) 0%, rgba(14, 165, 233, 0.12) 50%, transparent 80%)",
        headerAuraGradientBrutal: "linear-gradient(180deg, rgba(224, 242, 254, 0.6) 0%, transparent 100%)",
      };

    // ── ⚡ ELECTRIC ──────────────────────────────────────────────────────────
    case "electro":
      return {
        category: "electro",
        rawName: raw,
        displayName: raw,
        primaryColor: "#A855F7",
        secondaryColor: "#C084FC",
        glowColorRgba: "rgba(168, 85, 247, 0.35)",
        particleType: "spark",
        particleColors: ["#C084FC", "#E9D5FF", "#A855F7", "#D8B4FE"],
        icon: "⚡",
        badgeBgCyber: "rgba(168, 85, 247, 0.15)",
        badgeBorderCyber: "rgba(168, 85, 247, 0.45)",
        badgeTextCyber: "#D8B4FE",
        badgeBgBrutal: "#F3E8FF",
        badgeBorderBrutal: "#7E22CE",
        badgeTextBrutal: "#6B21A8",
        cardBorderGlowCyber: "0 0 16px rgba(168, 85, 247, 0.25)",
        cardBorderGlowBrutal: "3px 3px 0px #7E22CE",
        headerAuraGradientCyber: "radial-gradient(ellipse at 50% 0%, rgba(168, 85, 247, 0.38) 0%, rgba(147, 51, 234, 0.12) 50%, transparent 80%)",
        headerAuraGradientBrutal: "linear-gradient(180deg, rgba(243, 232, 255, 0.6) 0%, transparent 100%)",
      };

    // ── 🌪️ WIND ──────────────────────────────────────────────────────────────
    case "aero":
      return {
        category: "aero",
        rawName: raw,
        displayName: raw,
        primaryColor: "#2DD4BF",
        secondaryColor: "#5EEAD4",
        glowColorRgba: "rgba(45, 212, 191, 0.35)",
        particleType: "wind",
        particleColors: ["#5EEAD4", "#99F6E4", "#2DD4BF", "#14B8A6"],
        icon: "🌪️",
        badgeBgCyber: "rgba(45, 212, 191, 0.15)",
        badgeBorderCyber: "rgba(45, 212, 191, 0.45)",
        badgeTextCyber: "#5EEAD4",
        badgeBgBrutal: "#CCFBF1",
        badgeBorderBrutal: "#0F766E",
        badgeTextBrutal: "#115E59",
        cardBorderGlowCyber: "0 0 16px rgba(45, 212, 191, 0.25)",
        cardBorderGlowBrutal: "3px 3px 0px #0F766E",
        headerAuraGradientCyber: "radial-gradient(ellipse at 50% 0%, rgba(45, 212, 191, 0.38) 0%, rgba(20, 184, 166, 0.12) 50%, transparent 80%)",
        headerAuraGradientBrutal: "linear-gradient(180deg, rgba(204, 251, 241, 0.6) 0%, transparent 100%)",
      };

    // ── 💧 WATER ─────────────────────────────────────────────────────────────
    case "hydro":
      return {
        category: "hydro",
        rawName: raw,
        displayName: raw,
        primaryColor: "#0284C7",
        secondaryColor: "#38BDF8",
        glowColorRgba: "rgba(2, 132, 199, 0.35)",
        particleType: "droplet",
        particleColors: ["#38BDF8", "#7DD3FC", "#0284C7", "#BAE6FD"],
        icon: "💧",
        badgeBgCyber: "rgba(2, 132, 199, 0.15)",
        badgeBorderCyber: "rgba(2, 132, 199, 0.45)",
        badgeTextCyber: "#7DD3FC",
        badgeBgBrutal: "#E0F2FE",
        badgeBorderBrutal: "#0369A1",
        badgeTextBrutal: "#075985",
        cardBorderGlowCyber: "0 0 16px rgba(2, 132, 199, 0.25)",
        cardBorderGlowBrutal: "3px 3px 0px #0369A1",
        headerAuraGradientCyber: "radial-gradient(ellipse at 50% 0%, rgba(2, 132, 199, 0.38) 0%, rgba(14, 165, 233, 0.12) 50%, transparent 80%)",
        headerAuraGradientBrutal: "linear-gradient(180deg, rgba(224, 242, 254, 0.6) 0%, transparent 100%)",
      };

    // ── 🌿 NATURE ────────────────────────────────────────────────────────────
    case "dendro":
      return {
        category: "dendro",
        rawName: raw,
        displayName: raw,
        primaryColor: "#10B981",
        secondaryColor: "#34D399",
        glowColorRgba: "rgba(16, 185, 129, 0.35)",
        particleType: "leaf",
        particleColors: ["#34D399", "#6EE7B7", "#10B981", "#A7F3D0"],
        icon: "🌿",
        badgeBgCyber: "rgba(16, 185, 129, 0.15)",
        badgeBorderCyber: "rgba(16, 185, 129, 0.45)",
        badgeTextCyber: "#6EE7B7",
        badgeBgBrutal: "#D1FAE5",
        badgeBorderBrutal: "#047857",
        badgeTextBrutal: "#065F46",
        cardBorderGlowCyber: "0 0 16px rgba(16, 185, 129, 0.25)",
        cardBorderGlowBrutal: "3px 3px 0px #047857",
        headerAuraGradientCyber: "radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.38) 0%, rgba(5, 150, 105, 0.12) 50%, transparent 80%)",
        headerAuraGradientBrutal: "linear-gradient(180deg, rgba(209, 250, 229, 0.6) 0%, transparent 100%)",
      };

    // ── 🪨 EARTH ─────────────────────────────────────────────────────────────
    case "earth":
      return {
        category: "earth",
        rawName: raw,
        displayName: raw,
        primaryColor: "#D97706",
        secondaryColor: "#FBBF24",
        glowColorRgba: "rgba(217, 119, 6, 0.35)",
        particleType: "dust",
        particleColors: ["#FBBF24", "#FCD34D", "#D97706", "#B45309"],
        icon: "🪨",
        badgeBgCyber: "rgba(217, 119, 6, 0.15)",
        badgeBorderCyber: "rgba(217, 119, 6, 0.45)",
        badgeTextCyber: "#FBBF24",
        badgeBgBrutal: "#FEF3C7",
        badgeBorderBrutal: "#B45309",
        badgeTextBrutal: "#78350F",
        cardBorderGlowCyber: "0 0 16px rgba(217, 119, 6, 0.25)",
        cardBorderGlowBrutal: "3px 3px 0px #B45309",
        headerAuraGradientCyber: "radial-gradient(ellipse at 50% 0%, rgba(217, 119, 6, 0.38) 0%, rgba(180, 83, 9, 0.12) 50%, transparent 80%)",
        headerAuraGradientBrutal: "linear-gradient(180deg, rgba(254, 243, 199, 0.6) 0%, transparent 100%)",
      };

    // ── ✨ LIGHT ─────────────────────────────────────────────────────────────
    case "spectro":
      return {
        category: "spectro",
        rawName: raw,
        displayName: raw,
        primaryColor: "#FACC15",
        secondaryColor: "#FEF08A",
        glowColorRgba: "rgba(250, 204, 21, 0.35)",
        particleType: "mote",
        particleColors: ["#FEF08A", "#FDE047", "#FACC15", "#EAB308"],
        icon: "✨",
        badgeBgCyber: "rgba(250, 204, 21, 0.15)",
        badgeBorderCyber: "rgba(250, 204, 21, 0.45)",
        badgeTextCyber: "#FEF08A",
        badgeBgBrutal: "#FEF9C3",
        badgeBorderBrutal: "#CA8A04",
        badgeTextBrutal: "#854D0E",
        cardBorderGlowCyber: "0 0 16px rgba(250, 204, 21, 0.25)",
        cardBorderGlowBrutal: "3px 3px 0px #CA8A04",
        headerAuraGradientCyber: "radial-gradient(ellipse at 50% 0%, rgba(250, 204, 21, 0.38) 0%, rgba(234, 179, 8, 0.12) 50%, transparent 80%)",
        headerAuraGradientBrutal: "linear-gradient(180deg, rgba(254, 249, 195, 0.6) 0%, transparent 100%)",
      };

    // ── 🌑 DARK ──────────────────────────────────────────────────────────────
    case "havoc":
      return {
        category: "havoc",
        rawName: raw,
        displayName: raw,
        primaryColor: "#DC2626",
        secondaryColor: "#9333EA",
        glowColorRgba: "rgba(220, 38, 38, 0.35)",
        particleType: "shadow",
        particleColors: ["#F87171", "#C084FC", "#EF4444", "#991B1B"],
        icon: "🩸",
        badgeBgCyber: "rgba(220, 38, 38, 0.15)",
        badgeBorderCyber: "rgba(220, 38, 38, 0.45)",
        badgeTextCyber: "#F87171",
        badgeBgBrutal: "#FEE2E2",
        badgeBorderBrutal: "#B91C1C",
        badgeTextBrutal: "#991B1B",
        cardBorderGlowCyber: "0 0 16px rgba(220, 38, 38, 0.25)",
        cardBorderGlowBrutal: "3px 3px 0px #B91C1C",
        headerAuraGradientCyber: "radial-gradient(ellipse at 50% 0%, rgba(220, 38, 38, 0.38) 0%, rgba(147, 51, 234, 0.14) 50%, transparent 80%)",
        headerAuraGradientBrutal: "linear-gradient(180deg, rgba(254, 226, 226, 0.6) 0%, transparent 100%)",
      };

    // ── 🌌 COSMIC ────────────────────────────────────────────────────────────
    case "cosmic":
      return {
        category: "cosmic",
        rawName: raw,
        displayName: raw,
        primaryColor: "#818CF8",
        secondaryColor: "#C084FC",
        glowColorRgba: "rgba(129, 140, 248, 0.35)",
        particleType: "cosmic",
        particleColors: ["#A5B4FC", "#C084FC", "#818CF8", "#6366F1"],
        icon: "🌌",
        badgeBgCyber: "rgba(129, 140, 248, 0.15)",
        badgeBorderCyber: "rgba(129, 140, 248, 0.45)",
        badgeTextCyber: "#A5B4FC",
        badgeBgBrutal: "#E0E7FF",
        badgeBorderBrutal: "#4338CA",
        badgeTextBrutal: "#3730A3",
        cardBorderGlowCyber: "0 0 16px rgba(129, 140, 248, 0.25)",
        cardBorderGlowBrutal: "3px 3px 0px #4338CA",
        headerAuraGradientCyber: "radial-gradient(ellipse at 50% 0%, rgba(129, 140, 248, 0.38) 0%, rgba(99, 102, 241, 0.12) 50%, transparent 80%)",
        headerAuraGradientBrutal: "linear-gradient(180deg, rgba(224, 231, 255, 0.6) 0%, transparent 100%)",
      };

    // ── ☠️ TOXIC ─────────────────────────────────────────────────────────────
    case "toxic":
      return {
        category: "toxic",
        rawName: raw,
        displayName: raw,
        primaryColor: "#84CC16",
        secondaryColor: "#A3E635",
        glowColorRgba: "rgba(132, 204, 22, 0.35)",
        particleType: "toxic",
        particleColors: ["#A3E635", "#BEF264", "#84CC16", "#65A30D"],
        icon: "☠️",
        badgeBgCyber: "rgba(132, 204, 22, 0.15)",
        badgeBorderCyber: "rgba(132, 204, 22, 0.45)",
        badgeTextCyber: "#BEF264",
        badgeBgBrutal: "#ECFCCB",
        badgeBorderBrutal: "#4D7C0F",
        badgeTextBrutal: "#3F6212",
        cardBorderGlowCyber: "0 0 16px rgba(132, 204, 22, 0.25)",
        cardBorderGlowBrutal: "3px 3px 0px #4D7C0F",
        headerAuraGradientCyber: "radial-gradient(ellipse at 50% 0%, rgba(132, 204, 22, 0.38) 0%, rgba(101, 163, 13, 0.12) 50%, transparent 80%)",
        headerAuraGradientBrutal: "linear-gradient(180deg, rgba(236, 252, 203, 0.6) 0%, transparent 100%)",
      };

    // ── ⚙️ PHYSICAL ──────────────────────────────────────────────────────────
    case "physical":
      return {
        category: "physical",
        rawName: raw,
        displayName: raw,
        primaryColor: "#94A3B8",
        secondaryColor: "#CBD5E1",
        glowColorRgba: "rgba(148, 163, 184, 0.3)",
        particleType: "neutral",
        particleColors: ["#CBD5E1", "#E2E8F0", "#94A3B8"],
        icon: "⚙️",
        badgeBgCyber: "rgba(148, 163, 184, 0.15)",
        badgeBorderCyber: "rgba(148, 163, 184, 0.4)",
        badgeTextCyber: "#CBD5E1",
        badgeBgBrutal: "#F1F5F9",
        badgeBorderBrutal: "#475569",
        badgeTextBrutal: "#334155",
        cardBorderGlowCyber: "0 0 16px rgba(148, 163, 184, 0.2)",
        cardBorderGlowBrutal: "3px 3px 0px #475569",
        headerAuraGradientCyber: "radial-gradient(ellipse at 50% 0%, rgba(148, 163, 184, 0.28) 0%, transparent 75%)",
        headerAuraGradientBrutal: "linear-gradient(180deg, rgba(241, 245, 249, 0.6) 0%, transparent 100%)",
      };

    // ── 🔴 DB LEGENDS RED ─────────────────────────────────────────────────────
    case "db_red":
      return {
        category: "db_red",
        rawName: raw,
        displayName: raw,
        primaryColor: "#EF4444",
        secondaryColor: "#F87171",
        glowColorRgba: "rgba(239, 68, 68, 0.38)",
        particleType: "db_red",
        particleColors: ["#F87171", "#FCA5A5", "#EF4444"],
        icon: "🔴",
        badgeBgCyber: "rgba(239, 68, 68, 0.18)",
        badgeBorderCyber: "rgba(239, 68, 68, 0.55)",
        badgeTextCyber: "#F87171",
        badgeBgBrutal: "#FEE2E2",
        badgeBorderBrutal: "#B91C1C",
        badgeTextBrutal: "#991B1B",
        cardBorderGlowCyber: "0 0 16px rgba(239, 68, 68, 0.3)",
        cardBorderGlowBrutal: "3px 3px 0px #B91C1C",
        headerAuraGradientCyber: "radial-gradient(ellipse at 50% 0%, rgba(239, 68, 68, 0.4) 0%, transparent 75%)",
        headerAuraGradientBrutal: "linear-gradient(180deg, rgba(254, 226, 226, 0.6) 0%, transparent 100%)",
      };

    // ── 🔵 DB LEGENDS BLU ─────────────────────────────────────────────────────
    case "db_blu":
      return {
        category: "db_blu",
        rawName: raw,
        displayName: raw,
        primaryColor: "#3B82F6",
        secondaryColor: "#60A5FA",
        glowColorRgba: "rgba(59, 130, 246, 0.38)",
        particleType: "db_blu",
        particleColors: ["#60A5FA", "#93C5FD", "#3B82F6"],
        icon: "🔵",
        badgeBgCyber: "rgba(59, 130, 246, 0.18)",
        badgeBorderCyber: "rgba(59, 130, 246, 0.55)",
        badgeTextCyber: "#60A5FA",
        badgeBgBrutal: "#DBEAFE",
        badgeBorderBrutal: "#1D4ED8",
        badgeTextBrutal: "#1E40AF",
        cardBorderGlowCyber: "0 0 16px rgba(59, 130, 246, 0.3)",
        cardBorderGlowBrutal: "3px 3px 0px #1D4ED8",
        headerAuraGradientCyber: "radial-gradient(ellipse at 50% 0%, rgba(59, 130, 246, 0.4) 0%, transparent 75%)",
        headerAuraGradientBrutal: "linear-gradient(180deg, rgba(219, 234, 254, 0.6) 0%, transparent 100%)",
      };

    // ── 🟢 DB LEGENDS GRN ─────────────────────────────────────────────────────
    case "db_grn":
      return {
        category: "db_grn",
        rawName: raw,
        displayName: raw,
        primaryColor: "#22C55E",
        secondaryColor: "#4ADE80",
        glowColorRgba: "rgba(34, 197, 94, 0.38)",
        particleType: "db_grn",
        particleColors: ["#4ADE80", "#86EFAC", "#22C55E"],
        icon: "🟢",
        badgeBgCyber: "rgba(34, 197, 94, 0.18)",
        badgeBorderCyber: "rgba(34, 197, 94, 0.55)",
        badgeTextCyber: "#4ADE80",
        badgeBgBrutal: "#DCFCE7",
        badgeBorderBrutal: "#15803D",
        badgeTextBrutal: "#166534",
        cardBorderGlowCyber: "0 0 16px rgba(34, 197, 94, 0.3)",
        cardBorderGlowBrutal: "3px 3px 0px #15803D",
        headerAuraGradientCyber: "radial-gradient(ellipse at 50% 0%, rgba(34, 197, 94, 0.4) 0%, transparent 75%)",
        headerAuraGradientBrutal: "linear-gradient(180deg, rgba(220, 252, 231, 0.6) 0%, transparent 100%)",
      };

    // ── 🟣 DB LEGENDS PUR ─────────────────────────────────────────────────────
    case "db_pur":
      return {
        category: "db_pur",
        rawName: raw,
        displayName: raw,
        primaryColor: "#A855F7",
        secondaryColor: "#C084FC",
        glowColorRgba: "rgba(168, 85, 247, 0.38)",
        particleType: "db_pur",
        particleColors: ["#C084FC", "#E9D5FF", "#A855F7"],
        icon: "🟣",
        badgeBgCyber: "rgba(168, 85, 247, 0.18)",
        badgeBorderCyber: "rgba(168, 85, 247, 0.55)",
        badgeTextCyber: "#C084FC",
        badgeBgBrutal: "#F3E8FF",
        badgeBorderBrutal: "#7E22CE",
        badgeTextBrutal: "#6B21A8",
        cardBorderGlowCyber: "0 0 16px rgba(168, 85, 247, 0.3)",
        cardBorderGlowBrutal: "3px 3px 0px #7E22CE",
        headerAuraGradientCyber: "radial-gradient(ellipse at 50% 0%, rgba(168, 85, 247, 0.4) 0%, transparent 75%)",
        headerAuraGradientBrutal: "linear-gradient(180deg, rgba(243, 232, 255, 0.6) 0%, transparent 100%)",
      };

    // ── 🟡 DB LEGENDS YEL ─────────────────────────────────────────────────────
    case "db_yel":
      return {
        category: "db_yel",
        rawName: raw,
        displayName: raw,
        primaryColor: "#EAB308",
        secondaryColor: "#FDE047",
        glowColorRgba: "rgba(234, 179, 8, 0.38)",
        particleType: "db_yel",
        particleColors: ["#FDE047", "#FEF08A", "#EAB308"],
        icon: "🟡",
        badgeBgCyber: "rgba(234, 179, 8, 0.18)",
        badgeBorderCyber: "rgba(234, 179, 8, 0.55)",
        badgeTextCyber: "#FDE047",
        badgeBgBrutal: "#FEF9C3",
        badgeBorderBrutal: "#A16207",
        badgeTextBrutal: "#854D0E",
        cardBorderGlowCyber: "0 0 16px rgba(234, 179, 8, 0.3)",
        cardBorderGlowBrutal: "3px 3px 0px #A16207",
        headerAuraGradientCyber: "radial-gradient(ellipse at 50% 0%, rgba(234, 179, 8, 0.4) 0%, transparent 75%)",
        headerAuraGradientBrutal: "linear-gradient(180deg, rgba(254, 249, 195, 0.6) 0%, transparent 100%)",
      };

    // ── NEUTRAL FALLBACK ─────────────────────────────────────────────────────
    default: {
      const fallbackAccent = accent || "#A855F7";
      return {
        category: "neutral",
        rawName: raw,
        displayName: raw,
        primaryColor: fallbackAccent,
        secondaryColor: "#C084FC",
        glowColorRgba: `${fallbackAccent}33`,
        particleType: "neutral",
        particleColors: [fallbackAccent, "#E9D5FF", "#CBD5E1"],
        icon: "🔮",
        badgeBgCyber: `${fallbackAccent}22`,
        badgeBorderCyber: `${fallbackAccent}55`,
        badgeTextCyber: fallbackAccent,
        badgeBgBrutal: "#F3E8FF",
        badgeBorderBrutal: "#000000",
        badgeTextBrutal: "#000000",
        cardBorderGlowCyber: `0 0 16px ${fallbackAccent}33`,
        cardBorderGlowBrutal: "3px 3px 0px #000000",
        headerAuraGradientCyber: `radial-gradient(ellipse at 50% 0%, ${fallbackAccent}35 0%, transparent 75%)`,
        headerAuraGradientBrutal: "linear-gradient(180deg, rgba(243, 232, 255, 0.5) 0%, transparent 100%)",
      };
    }
  }
}

/**
 * Canonical Game Character Element Extractor
 * Safely extracts the canonical element string from a GameCharacter or DossierCharacter.
 * Never modifies or mutates the underlying record.
 */
export function getCanonicalGameCharacterElement(
  character?: {
    element?: string | null;
    role?: string | null;
    attribute?: string | null;
    stats?: any;
  } | null
): string | null {
  if (!character) return null;

  // 1. Direct canonical element property
  if (
    typeof character.element === "string" &&
    character.element.trim().length > 0 &&
    character.element.trim() !== "null" &&
    character.element.trim() !== "undefined"
  ) {
    return character.element.trim();
  }

  // 2. Stats attribute / element fallback
  const stats = character.stats;
  if (stats && typeof stats === "object") {
    if (
      typeof stats.element === "string" &&
      stats.element.trim().length > 0 &&
      stats.element.trim() !== "null"
    ) {
      return stats.element.trim();
    }
    if (
      typeof stats.attribute === "string" &&
      stats.attribute.trim().length > 0 &&
      stats.attribute.trim() !== "null"
    ) {
      return stats.attribute.trim();
    }
  }

  // 3. Direct attribute property if present
  if (
    typeof character.attribute === "string" &&
    character.attribute.trim().length > 0 &&
    character.attribute.trim() !== "null"
  ) {
    return character.attribute.trim();
  }

  return null;
}

/**
 * Match Character Element against Registered GameElement
 * Matches character's canonical element with the registered game element id/name.
 * Preserves canonical game terminology (Lightning, Fire, Glacio, Fusion, etc.).
 * Does NOT force unknown or unrecognized elements into unrelated buckets.
 */
export function matchGameElement(
  characterElement: string | null | undefined,
  element: { id: string; name: string }
): boolean {
  if (!characterElement || !element) return false;

  const cleanChar = characterElement.trim().toLowerCase();
  const cleanName = element.name.trim().toLowerCase();
  const cleanId = element.id.trim().toLowerCase();

  // Exact match
  if (cleanChar === cleanName || cleanChar === cleanId) return true;

  // Punctuation-stripped match (e.g. "red" vs "red", "pur" vs "purple")
  const normChar = cleanChar.replace(/[^a-z0-9]/g, "");
  const normName = cleanName.replace(/[^a-z0-9]/g, "");
  const normId = cleanId.replace(/[^a-z0-9]/g, "");
  if (normChar === normName || normChar === normId) return true;

  // Substring/Parenthetical match for DB Legends & aliases (e.g. "LGT (Light)" matches "Light" or "LGT", "RED (Red)" matches "RED")
  if (cleanChar.includes(cleanName) || cleanName.includes(cleanChar)) return true;
  if (cleanChar.includes(cleanId) || cleanId.includes(cleanChar)) return true;

  return false;
}

