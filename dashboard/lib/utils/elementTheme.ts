/**
 * elementTheme.ts
 *
 * Reusable Element-Driven Visual Identity system for Game Character Inspection.
 * Maps elements across games (Wuthering Waves, Genshin Impact, Honkai: Star Rail,
 * ZZZ, Nikke, PGR, Arknights, etc.) to harmonious color palettes, glowing aura
 * styles, particle configurations, and theme metadata.
 */

export type ElementCategory =
  | "glacio"    // Ice / Cryo / Frost
  | "fusion"    // Fire / Pyro / Flame / Thermal
  | "electro"   // Lightning / Volt
  | "aero"      // Wind / Anemo
  | "spectro"   // Light / Geo / Imaginary / Luminous
  | "havoc"     // Dark / Quantum / Shadow / Abyssal
  | "hydro"     // Water / Liquid
  | "dendro"    // Nature / Bio / Flora
  | "physical"  // Kinetic / Physical / Neutral
  | "neutral";  // Fallback

export type ParticleType = "ice" | "ember" | "spark" | "wind" | "mote" | "shadow" | "droplet" | "neutral";

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
  headerAuraGradientCyber: string;
}

const ELEMENT_MAP: Record<string, ElementCategory> = {
  // Glacio / Ice / Cryo
  glacio: "glacio",
  cryo: "glacio",
  ice: "glacio",
  frost: "glacio",
  freeze: "glacio",

  // Fusion / Fire / Pyro / Thermal
  fusion: "fusion",
  pyro: "fusion",
  fire: "fusion",
  thermal: "fusion",
  flame: "fusion",

  // Electro / Lightning / Volt
  electro: "electro",
  lightning: "electro",
  volt: "electro",
  electric: "electro",

  // Aero / Wind / Anemo
  aero: "aero",
  anemo: "aero",
  wind: "aero",
  gale: "aero",

  // Spectro / Light / Geo / Imaginary / Solar
  spectro: "spectro",
  geo: "spectro",
  imaginary: "spectro",
  light: "spectro",
  sun: "spectro",
  luminous: "spectro",

  // Havoc / Dark / Quantum / Shadow
  havoc: "havoc",
  dark: "havoc",
  quantum: "havoc",
  shadow: "havoc",
  abyss: "havoc",
  abyssal: "havoc",
  void: "havoc",

  // Hydro / Water
  hydro: "hydro",
  water: "hydro",
  liquid: "hydro",
  aqua: "hydro",

  // Dendro / Bio / Flora
  dendro: "dendro",
  bio: "dendro",
  flora: "dendro",
  nature: "dendro",

  // Physical
  physical: "physical",
  kinetic: "physical",
  slash: "physical",
  strike: "physical",
};

/**
 * Normalizes element string and returns rich element theme.
 */
export function getElementTheme(elementName?: string | null, accentOverride?: string | null): ElementTheme {
  const clean = (elementName || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  const category = ELEMENT_MAP[clean] || "neutral";

  switch (category) {
    case "glacio":
      return {
        category: "glacio",
        rawName: elementName || "Glacio",
        displayName: elementName || "Glacio / Ice",
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
        cardBorderGlowCyber: "0 0 16px rgba(56, 189, 248, 0.2)",
        headerAuraGradientCyber: "radial-gradient(ellipse at 50% 0%, rgba(56, 189, 248, 0.35) 0%, rgba(14, 165, 233, 0.1) 50%, transparent 80%)",
      };

    case "fusion":
      return {
        category: "fusion",
        rawName: elementName || "Fusion",
        displayName: elementName || "Fusion / Fire",
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
        cardBorderGlowCyber: "0 0 16px rgba(255, 107, 53, 0.2)",
        headerAuraGradientCyber: "radial-gradient(ellipse at 50% 0%, rgba(255, 107, 53, 0.35) 0%, rgba(239, 68, 68, 0.1) 50%, transparent 80%)",
      };

    case "electro":
      return {
        category: "electro",
        rawName: elementName || "Electro",
        displayName: elementName || "Electro / Lightning",
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
        cardBorderGlowCyber: "0 0 16px rgba(168, 85, 247, 0.2)",
        headerAuraGradientCyber: "radial-gradient(ellipse at 50% 0%, rgba(168, 85, 247, 0.35) 0%, rgba(147, 51, 234, 0.1) 50%, transparent 80%)",
      };

    case "aero":
      return {
        category: "aero",
        rawName: elementName || "Aero",
        displayName: elementName || "Aero / Wind",
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
        cardBorderGlowCyber: "0 0 16px rgba(45, 212, 191, 0.2)",
        headerAuraGradientCyber: "radial-gradient(ellipse at 50% 0%, rgba(45, 212, 191, 0.35) 0%, rgba(20, 184, 166, 0.1) 50%, transparent 80%)",
      };

    case "spectro":
      return {
        category: "spectro",
        rawName: elementName || "Spectro",
        displayName: elementName || "Spectro / Light",
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
        cardBorderGlowCyber: "0 0 16px rgba(250, 204, 21, 0.2)",
        headerAuraGradientCyber: "radial-gradient(ellipse at 50% 0%, rgba(250, 204, 21, 0.35) 0%, rgba(234, 179, 8, 0.1) 50%, transparent 80%)",
      };

    case "havoc":
      return {
        category: "havoc",
        rawName: elementName || "Havoc",
        displayName: elementName || "Havoc / Dark",
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
        cardBorderGlowCyber: "0 0 16px rgba(220, 38, 38, 0.2)",
        headerAuraGradientCyber: "radial-gradient(ellipse at 50% 0%, rgba(220, 38, 38, 0.35) 0%, rgba(147, 51, 234, 0.12) 50%, transparent 80%)",
      };

    case "hydro":
      return {
        category: "hydro",
        rawName: elementName || "Hydro",
        displayName: elementName || "Hydro / Water",
        primaryColor: "#0284C7",
        secondaryColor: "#38BDF8",
        glowColorRgba: "rgba(2, 132, 199, 0.35)",
        particleType: "droplet",
        particleColors: ["#38BDF8", "#7DD3FC", "#0284C7"],
        icon: "💧",
        badgeBgCyber: "rgba(2, 132, 199, 0.15)",
        badgeBorderCyber: "rgba(2, 132, 199, 0.45)",
        badgeTextCyber: "#7DD3FC",
        badgeBgBrutal: "#E0F2FE",
        badgeBorderBrutal: "#0369A1",
        badgeTextBrutal: "#075985",
        cardBorderGlowCyber: "0 0 16px rgba(2, 132, 199, 0.2)",
        headerAuraGradientCyber: "radial-gradient(ellipse at 50% 0%, rgba(2, 132, 199, 0.35) 0%, rgba(14, 165, 233, 0.1) 50%, transparent 80%)",
      };

    case "dendro":
      return {
        category: "dendro",
        rawName: elementName || "Dendro",
        displayName: elementName || "Dendro / Nature",
        primaryColor: "#10B981",
        secondaryColor: "#34D399",
        glowColorRgba: "rgba(16, 185, 129, 0.35)",
        particleType: "wind",
        particleColors: ["#34D399", "#6EE7B7", "#10B981"],
        icon: "🌿",
        badgeBgCyber: "rgba(16, 185, 129, 0.15)",
        badgeBorderCyber: "rgba(16, 185, 129, 0.45)",
        badgeTextCyber: "#6EE7B7",
        badgeBgBrutal: "#D1FAE5",
        badgeBorderBrutal: "#047857",
        badgeTextBrutal: "#065F46",
        cardBorderGlowCyber: "0 0 16px rgba(16, 185, 129, 0.2)",
        headerAuraGradientCyber: "radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.35) 0%, rgba(5, 150, 105, 0.1) 50%, transparent 80%)",
      };

    case "physical":
      return {
        category: "physical",
        rawName: elementName || "Physical",
        displayName: elementName || "Physical",
        primaryColor: "#94A3B8",
        secondaryColor: "#CBD5E1",
        glowColorRgba: "rgba(148, 163, 184, 0.3)",
        particleType: "neutral",
        particleColors: ["#CBD5E1", "#E2E8F0", "#94A3B8"],
        icon: "⚔️",
        badgeBgCyber: "rgba(148, 163, 184, 0.15)",
        badgeBorderCyber: "rgba(148, 163, 184, 0.4)",
        badgeTextCyber: "#CBD5E1",
        badgeBgBrutal: "#F1F5F9",
        badgeBorderBrutal: "#475569",
        badgeTextBrutal: "#334155",
        cardBorderGlowCyber: "0 0 16px rgba(148, 163, 184, 0.15)",
        headerAuraGradientCyber: "radial-gradient(ellipse at 50% 0%, rgba(148, 163, 184, 0.25) 0%, transparent 75%)",
      };

    default: {
      const fallbackAccent = accentOverride || "#A855F7";
      return {
        category: "neutral",
        rawName: elementName || "Universal",
        displayName: elementName || "Universal",
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
        headerAuraGradientCyber: `radial-gradient(ellipse at 50% 0%, ${fallbackAccent}35 0%, transparent 75%)`,
      };
    }
  }
}
