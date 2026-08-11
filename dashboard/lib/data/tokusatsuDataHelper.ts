import { HallOfFameEntry } from "@/lib/store/dashboardStore";
import {
  TokusatsuProfile,
  TokusatsuFranchiseType,
  TokusatsuForm,
  TokusatsuWeapon,
  TokusatsuVehicle,
  TokusatsuAbility,
  TokusatsuAppearance,
  KamenRiderSpecificData,
  UltramanSpecificData,
  PowerRangersSpecificData,
  SuperSentaiSpecificData,
} from "@/lib/types/tokusatsu";

// ─── Safe String & Array Helpers ───────────────────────────────────────────────

function safeStr(val: unknown): string {
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  return "";
}

function safeStrArr(val: unknown): string[] {
  if (Array.isArray(val)) {
    return val.map((v) => safeStr(v)).filter((v) => v.length > 0);
  }
  if (typeof val === "string" && val.trim().length > 0) {
    return val.split(",").map((v) => v.trim()).filter((v) => v.length > 0);
  }
  return [];
}

// ─── Tokusatsu Entry Detection ────────────────────────────────────────────────
//
// Detection Priority (highest to lowest):
//   1. Explicit stored type === "tokusatsu"
//   2. Explicit Tokusatsu structured fields (tokusatsuFranchise, tokusatsuShow, details.*)
//   3. Type field keyword match (kamen, ultraman, sentai, power ranger)
//   4. Franchise/show field keyword match
//
// NEVER uses: nationality, country, origin, or entry name as Tokusatsu evidence.
// Japan/Japanese is NOT a Tokusatsu signal.

export function isTokusatsuEntry(entry: HallOfFameEntry | null | undefined): boolean {
  if (!entry) return false;

  // ── 1. Explicit stored type (authoritative) ──
  const type = (entry.type || "").toLowerCase().trim();
  if (type === "tokusatsu") return true;

  // ── 2. Explicit non-artist types that are clearly Tokusatsu ──
  // Only match keywords in the TYPE field itself, not in names or nationalities
  if (
    type.includes("toku") ||
    type.includes("kamen") ||
    type.includes("ultraman") ||
    type.includes("sentai") ||
    type.includes("power ranger")
  ) return true;

  // ── 3. Explicit Tokusatsu structured data fields ──
  const details = entry.details || {};
  if (details.tokusatsuData) return true;
  if (details.kamenRider) return true;
  if (details.ultraman) return true;
  if (details.powerRangers) return true;
  if (details.superSentai) return true;

  // ── 4. Explicit Tokusatsu metadata fields on the entry ──
  const franchise = (entry.tokusatsuFranchise || "").toLowerCase().trim();
  if (franchise) return true;

  const show = (entry.tokusatsuShow || "").toLowerCase().trim();
  if (show) return true;

  // ── 5. Keyword match ONLY in the franchise/show metadata fields (NOT name, NOT nationality) ──
  const franchiseKeywords = `${entry.franchise || ""} ${entry.series || ""}`.toLowerCase();
  if (
    franchiseKeywords.includes("ultraman") ||
    franchiseKeywords.includes("kamen rider") ||
    franchiseKeywords.includes("super sentai") ||
    franchiseKeywords.includes("power rangers") ||
    franchiseKeywords.includes("tokusatsu")
  ) return true;

  return false;
}

// ─── Franchise Type Resolver ──────────────────────────────────────────────────

export function resolveFranchiseType(
  rawFranchise?: string,
  rawType?: string,
  rawName?: string
): TokusatsuFranchiseType {
  const combined = `${rawFranchise || ""} ${rawType || ""} ${rawName || ""}`.toLowerCase();
  if (combined.includes("kamen") || combined.includes("rider")) return "KAMEN_RIDER";
  if (combined.includes("ultraman") || combined.includes("ultra")) return "ULTRAMAN";
  if (combined.includes("power ranger") || combined.includes("power-ranger")) return "POWER_RANGERS";
  if (combined.includes("sentai")) return "SUPER_SENTAI";
  return "OTHER";
}

// ─── Default Sub-Profiles ──────────────────────────────────────────────────────

export function defaultKamenRiderData(): KamenRiderSpecificData {
  return {
    riderName: "",
    riderSystem: "",
    transformationBelt: "",
    transformationDevice: "",
    transformationItem: "",
    transformationSequence: "",
    riderForms: [],
    riderKick: "",
    riderWeapons: [],
    riderMachine: "",
    riderOrganization: "",
    mainHost: "",
    upgradeForms: [],
    finalForm: "",
    berserkForm: "",
    movieExclusiveForms: [],
    rivalRiders: [],
    alliedRiders: [],
    mainVillains: [],
    monsterEnemyFaction: "",
    seriesEra: "Reiwa",
  };
}

export function defaultUltramanData(): UltramanSpecificData {
  return {
    ultraName: "",
    humanHost: "",
    transformationItem: "",
    transformationDevice: "",
    transformationMethod: "",
    transformationSequence: "",
    colorTimer: "",
    height: "",
    weight: "",
    flightSpeed: "",
    runningSpeed: "",
    underwaterSpeed: "",
    jumpHeight: "",
    specialAbilities: [],
    beamAttacks: [],
    finishingAttacks: [],
    weapons: [],
    forms: [],
    fusionCombination: "",
    ultraBrothersAllies: [],
    defenseTeam: "",
    kaijuEnemies: [],
    mainRival: "",
    planetOrigin: "",
    ultraUniverse: "",
    seriesEra: "Reiwa",
  };
}

export function defaultPowerRangersData(): PowerRangersSpecificData {
  return {
    rangerName: "",
    civilianIdentity: "",
    rangerColor: "",
    rangerTeam: "",
    rangerNumber: "",
    morphingDevice: "",
    morphingCall: "",
    morphingSequence: "",
    rangerSuit: "",
    powerSource: "",
    rangerPowers: [],
    individualWeapon: "",
    teamWeapon: "",
    personalZord: "",
    megazord: "",
    zordCombination: "",
    rangerTeamAffiliation: "",
    mentor: "",
    commandCenter: "",
    mainVillains: [],
    enemyFaction: "",
    rangerAllies: [],
    sixthRangerStatus: "",
    formerRangerStatus: "",
    seriesEra: "Hasbro Era",
  };
}

export function defaultSuperSentaiData(): SuperSentaiSpecificData {
  return {
    sentaiName: "",
    rangerColor: "",
    teamPosition: "",
    transformationDevice: "",
    transformationItem: "",
    transformationCall: "",
    personalWeapon: "",
    teamWeapon: "",
    mecha: "",
    individualMecha: "",
    combinationGattai: "",
    team: "",
    mentor: "",
    villainFaction: "",
    monsters: [],
    sixthRanger: "",
    additionalRangers: [],
    seriesEra: "Reiwa",
  };
}

// ─── Normalizer Function ──────────────────────────────────────────────────────

export function normalizeTokusatsuProfile(
  rawInput?: any,
  fallbackEntry?: HallOfFameEntry | null
): TokusatsuProfile {
  const details = fallbackEntry?.details || {};
  const raw = rawInput || details.tokusatsuData || {};

  const heroName =
    safeStr(raw.heroName) ||
    safeStr(raw.name) ||
    safeStr(fallbackEntry?.name) ||
    "New Tokusatsu Hero";

  const series =
    safeStr(raw.series) ||
    safeStr(fallbackEntry?.tokusatsuShow) ||
    safeStr(fallbackEntry?.tokusatsuFranchise) ||
    safeStr(fallbackEntry?.series) ||
    "";

  const franchiseType =
    (raw.franchiseType as TokusatsuFranchiseType) ||
    resolveFranchiseType(
      fallbackEntry?.tokusatsuFranchise || raw.series,
      fallbackEntry?.type,
      heroName
    );

  const forms: TokusatsuForm[] = Array.isArray(raw.forms)
    ? raw.forms.map((f: any, idx: number) => ({
        id: safeStr(f.id) || `form-${idx}-${Math.random().toString(36).slice(2, 7)}`,
        name: safeStr(f.name) || "Base Form",
        formType: safeStr(f.formType) || "Base",
        appearance: safeStr(f.appearance),
        transformationDevice: safeStr(f.transformationDevice),
        transformationItem: safeStr(f.transformationItem),
        transformationSequence: safeStr(f.transformationSequence),
        transformationPhrase: safeStr(f.transformationPhrase),
        abilities: safeStrArr(f.abilities),
        weapons: safeStrArr(f.weapons),
        finisher: safeStr(f.finisher),
        powerLevelNotes: safeStr(f.powerLevelNotes),
        debutEpisode: safeStr(f.debutEpisode),
        imageUrl: safeStr(f.imageUrl),
      }))
    : [];

  const weapons: TokusatsuWeapon[] = Array.isArray(raw.weapons)
    ? raw.weapons.map((w: any, idx: number) => ({
        id: safeStr(w.id) || `wep-${idx}-${Math.random().toString(36).slice(2, 7)}`,
        name: safeStr(w.name) || "Primary Weapon",
        type: safeStr(w.type),
        description: safeStr(w.description),
        abilities: safeStrArr(w.abilities),
        specialAttack: safeStr(w.specialAttack),
        firstAppearance: safeStr(w.firstAppearance),
        associatedForm: safeStr(w.associatedForm),
        imageUrl: safeStr(w.imageUrl),
      }))
    : [];

  const vehicles: TokusatsuVehicle[] = Array.isArray(raw.vehicles)
    ? raw.vehicles.map((v: any, idx: number) => ({
        id: safeStr(v.id) || `veh-${idx}-${Math.random().toString(36).slice(2, 7)}`,
        name: safeStr(v.name) || "Hero Machine",
        type: safeStr(v.type) || "Motorcycle",
        description: safeStr(v.description),
        abilities: safeStr(v.abilities),
        associatedHeroForm: safeStr(v.associatedHeroForm),
        debut: safeStr(v.debut),
        imageUrl: safeStr(v.imageUrl),
      }))
    : [];

  const abilities: TokusatsuAbility[] = Array.isArray(raw.abilities)
    ? raw.abilities.map((a: any, idx: number) => ({
        id: safeStr(a.id) || `abi-${idx}-${Math.random().toString(36).slice(2, 7)}`,
        name: safeStr(a.name) || "Special Attack",
        category: safeStr(a.category) || "Finisher",
        description: safeStr(a.description),
        activationMethod: safeStr(a.activationMethod),
        associatedForm: safeStr(a.associatedForm),
        visualEffect: safeStr(a.visualEffect),
        isFinisher: Boolean(a.isFinisher),
        debut: safeStr(a.debut),
      }))
    : [];

  const appearances: TokusatsuAppearance[] = Array.isArray(raw.appearances)
    ? raw.appearances.map((ap: any, idx: number) => ({
        id: safeStr(ap.id) || `app-${idx}-${Math.random().toString(36).slice(2, 7)}`,
        title: safeStr(ap.title) || series,
        appearanceType: (ap.appearanceType as any) || "Main Series",
        episodeFilmNumber: safeStr(ap.episodeFilmNumber),
        releaseYear: safeStr(ap.releaseYear),
        role: safeStr(ap.role) || "Main Protagonist",
        notes: safeStr(ap.notes),
      }))
    : [];

  // Parse KR specific data safely
  const krRaw = raw.kamenRider || details.kamenRider || {};
  const kamenRider: KamenRiderSpecificData = {
    riderName: safeStr(krRaw.riderName) || heroName,
    riderSystem: safeStr(krRaw.riderSystem),
    transformationBelt: safeStr(krRaw.transformationBelt) || safeStr(raw.transformationDevice),
    transformationDevice: safeStr(krRaw.transformationDevice) || safeStr(raw.transformationDevice),
    transformationItem: safeStr(krRaw.transformationItem),
    transformationSequence: safeStr(krRaw.transformationSequence),
    riderForms: safeStrArr(krRaw.riderForms),
    riderKick: safeStr(krRaw.riderKick) || safeStr(raw.signatureAbility),
    riderWeapons: safeStrArr(krRaw.riderWeapons),
    riderMachine: safeStr(krRaw.riderMachine),
    riderOrganization: safeStr(krRaw.riderOrganization) || safeStr(raw.organization),
    mainHost: safeStr(krRaw.mainHost) || safeStr(raw.civilianName),
    upgradeForms: safeStrArr(krRaw.upgradeForms),
    finalForm: safeStr(krRaw.finalForm),
    berserkForm: safeStr(krRaw.berserkForm),
    movieExclusiveForms: safeStrArr(krRaw.movieExclusiveForms),
    rivalRiders: safeStrArr(krRaw.rivalRiders),
    alliedRiders: safeStrArr(krRaw.alliedRiders),
    mainVillains: safeStrArr(krRaw.mainVillains),
    monsterEnemyFaction: safeStr(krRaw.monsterEnemyFaction),
    seriesEra: (krRaw.seriesEra as any) || "Reiwa",
  };

  // Parse Ultraman specific data safely
  const ultraRaw = raw.ultraman || details.ultraman || {};
  const ultraman: UltramanSpecificData = {
    ultraName: safeStr(ultraRaw.ultraName) || heroName,
    humanHost: safeStr(ultraRaw.humanHost) || safeStr(raw.civilianName),
    transformationItem: safeStr(ultraRaw.transformationItem) || safeStr(raw.transformationDevice),
    transformationDevice: safeStr(ultraRaw.transformationDevice),
    transformationMethod: safeStr(ultraRaw.transformationMethod),
    transformationSequence: safeStr(ultraRaw.transformationSequence),
    colorTimer: safeStr(ultraRaw.colorTimer) || "3 Minutes",
    height: safeStr(ultraRaw.height) || "40-50m",
    weight: safeStr(ultraRaw.weight) || "35,000t",
    flightSpeed: safeStr(ultraRaw.flightSpeed),
    runningSpeed: safeStr(ultraRaw.runningSpeed),
    underwaterSpeed: safeStr(ultraRaw.underwaterSpeed),
    jumpHeight: safeStr(ultraRaw.jumpHeight),
    specialAbilities: safeStrArr(ultraRaw.specialAbilities),
    beamAttacks: safeStrArr(ultraRaw.beamAttacks),
    finishingAttacks: safeStrArr(ultraRaw.finishingAttacks),
    weapons: safeStrArr(ultraRaw.weapons),
    forms: safeStrArr(ultraRaw.forms),
    fusionCombination: safeStr(ultraRaw.fusionCombination),
    ultraBrothersAllies: safeStrArr(ultraRaw.ultraBrothersAllies),
    defenseTeam: safeStr(ultraRaw.defenseTeam) || safeStr(raw.organization),
    kaijuEnemies: safeStrArr(ultraRaw.kaijuEnemies),
    mainRival: safeStr(ultraRaw.mainRival),
    planetOrigin: safeStr(ultraRaw.planetOrigin) || "Nebula M78",
    ultraUniverse: safeStr(ultraRaw.ultraUniverse),
    seriesEra: (ultraRaw.seriesEra as any) || "Reiwa",
  };

  // Parse Power Rangers specific data safely
  const prRaw = raw.powerRangers || details.powerRangers || {};
  const powerRangers: PowerRangersSpecificData = {
    rangerName: safeStr(prRaw.rangerName) || heroName,
    civilianIdentity: safeStr(prRaw.civilianIdentity) || safeStr(raw.civilianName),
    rangerColor: safeStr(prRaw.rangerColor) || safeStr(raw.primaryColor),
    rangerTeam: safeStr(prRaw.rangerTeam) || series,
    rangerNumber: safeStr(prRaw.rangerNumber),
    morphingDevice: safeStr(prRaw.morphingDevice) || safeStr(raw.transformationDevice),
    morphingCall: safeStr(prRaw.morphingCall) || safeStr(raw.transformationPhrase),
    morphingSequence: safeStr(prRaw.morphingSequence),
    rangerSuit: safeStr(prRaw.rangerSuit),
    powerSource: safeStr(prRaw.powerSource) || safeStr(raw.powerSource),
    rangerPowers: safeStrArr(prRaw.rangerPowers),
    individualWeapon: safeStr(prRaw.individualWeapon),
    teamWeapon: safeStr(prRaw.teamWeapon),
    personalZord: safeStr(prRaw.personalZord),
    megazord: safeStr(prRaw.megazord),
    zordCombination: safeStr(prRaw.zordCombination),
    rangerTeamAffiliation: safeStr(prRaw.rangerTeamAffiliation) || safeStr(raw.organization),
    mentor: safeStr(prRaw.mentor),
    commandCenter: safeStr(prRaw.commandCenter),
    mainVillains: safeStrArr(prRaw.mainVillains),
    enemyFaction: safeStr(prRaw.enemyFaction),
    rangerAllies: safeStrArr(prRaw.rangerAllies),
    sixthRangerStatus: safeStr(prRaw.sixthRangerStatus),
    formerRangerStatus: safeStr(prRaw.formerRangerStatus),
    seriesEra: (prRaw.seriesEra as any) || "Hasbro Era",
  };

  // Parse Super Sentai specific data safely
  const ssRaw = raw.superSentai || details.superSentai || {};
  const superSentai: SuperSentaiSpecificData = {
    sentaiName: safeStr(ssRaw.sentaiName) || heroName,
    rangerColor: safeStr(ssRaw.rangerColor) || safeStr(raw.primaryColor),
    teamPosition: safeStr(ssRaw.teamPosition) || "Red Leader",
    transformationDevice: safeStr(ssRaw.transformationDevice) || safeStr(raw.transformationDevice),
    transformationItem: safeStr(ssRaw.transformationItem),
    transformationCall: safeStr(ssRaw.transformationCall) || safeStr(raw.transformationPhrase),
    personalWeapon: safeStr(ssRaw.personalWeapon),
    teamWeapon: safeStr(ssRaw.teamWeapon),
    mecha: safeStr(ssRaw.mecha),
    individualMecha: safeStr(ssRaw.individualMecha),
    combinationGattai: safeStr(ssRaw.combinationGattai),
    team: safeStr(ssRaw.team) || series,
    mentor: safeStr(ssRaw.mentor),
    villainFaction: safeStr(ssRaw.villainFaction),
    monsters: safeStrArr(ssRaw.monsters),
    sixthRanger: safeStr(ssRaw.sixthRanger),
    additionalRangers: safeStrArr(ssRaw.additionalRangers),
    seriesEra: (ssRaw.seriesEra as any) || "Reiwa",
  };

  return {
    franchiseType,
    heroName,
    civilianName: safeStr(raw.civilianName) || safeStr(fallbackEntry?.fullName),
    series,
    universe: safeStr(raw.universe) || safeStr(fallbackEntry?.universe) || "Tokusatsu Universe",
    country: safeStr(raw.country) || safeStr(fallbackEntry?.nationality) || "Japan",
    debutYear: safeStr(raw.debutYear) || safeStr(fallbackEntry?.debutYear) || "2023",
    firstAppearance: safeStr(raw.firstAppearance) || safeStr(fallbackEntry?.firstAppearance),
    status: safeStr(raw.status) || safeStr(fallbackEntry?.status) || "GOAT Status",
    alignment: safeStr(raw.alignment) || safeStr(fallbackEntry?.alignment) || "Hero / Lawful Good",
    organization: safeStr(raw.organization) || safeStr(fallbackEntry?.creator),

    heroType: safeStr(raw.heroType) || "Primary Main Rider / Ultra / Hero",
    transformationSystem: safeStr(raw.transformationSystem),
    transformationDevice: safeStr(raw.transformationDevice),
    transformationMethod: safeStr(raw.transformationMethod),
    transformationPhrase: safeStr(raw.transformationPhrase),
    baseForm: safeStr(raw.baseForm) || "MagnumBoost Form",
    primaryColor: safeStr(raw.primaryColor) || "#EF4444",
    secondaryColor: safeStr(raw.secondaryColor) || "#00F5FF",
    suitDescription: safeStr(raw.suitDescription),
    powerSource: safeStr(raw.powerSource),
    specialAbilities: safeStrArr(raw.specialAbilities),
    signatureAbility: safeStr(raw.signatureAbility),
    weaknesses: safeStr(raw.weaknesses),

    imageUrl: safeStr(raw.imageUrl) || safeStr(fallbackEntry?.imageUrl),
    portraitUrl: safeStr(raw.portraitUrl) || safeStr(fallbackEntry?.portraitUrl),
    avatarUrl: safeStr(raw.avatarUrl) || safeStr(fallbackEntry?.avatarUrl),
    accentColor: safeStr(raw.accentColor) || safeStr(fallbackEntry?.accentColor) || "#EF4444",
    galleryUrls: safeStrArr(raw.galleryUrls || fallbackEntry?.gallery),

    forms,
    weapons,
    vehicles,
    abilities,
    appearances,

    mainActor: safeStr(raw.mainActor),
    suitActor: safeStr(raw.suitActor),
    voiceActor: safeStr(raw.voiceActor),
    stuntPerformer: safeStr(raw.stuntPerformer),
    director: safeStr(raw.director),
    writer: safeStr(raw.writer),
    productionStudio: safeStr(raw.productionStudio) || "Toei Company / Tsuburaya Productions",
    networkBroadcaster: safeStr(raw.networkBroadcaster) || "TV Asahi",
    broadcastPeriod: safeStr(raw.broadcastPeriod),
    productionNotes: safeStr(raw.productionNotes),

    kamenRider,
    ultraman,
    powerRangers,
    superSentai,
  };
}

// ─── Extract HOF Update Data ─────────────────────────────────────────────────

export function extractHofDataFromTokusatsuProfile(
  profile: TokusatsuProfile,
  existingEntry?: HallOfFameEntry | null
): Partial<HallOfFameEntry> {
  const franchiseDisplay =
    profile.franchiseType === "KAMEN_RIDER"
      ? "Kamen Rider"
      : profile.franchiseType === "ULTRAMAN"
      ? "Ultraman"
      : profile.franchiseType === "POWER_RANGERS"
      ? "Power Rangers"
      : profile.franchiseType === "SUPER_SENTAI"
      ? "Super Sentai"
      : "Tokusatsu";

  const knownForList = [
    profile.series,
    profile.civilianName ? `Identity: ${profile.civilianName}` : "",
    profile.baseForm ? `Base: ${profile.baseForm}` : "",
  ].filter(Boolean);

  const existingDetails = existingEntry?.details || {};

  return {
    name: profile.heroName,
    type: "tokusatsu",
    status: profile.status as any,
    nationality: profile.country || "Japan",
    tokusatsuFranchise: profile.series || franchiseDisplay,
    tokusatsuShow: profile.series,
    knownFor: knownForList,
    imageUrl: profile.imageUrl || undefined,
    portraitUrl: profile.portraitUrl || undefined,
    avatarUrl: profile.avatarUrl || undefined,
    accentColor: profile.accentColor || "#EF4444",
    gallery: profile.galleryUrls,
    fullName: profile.civilianName || undefined,
    officialName: profile.heroName || undefined,
    universe: profile.universe || undefined,
    series: profile.series || undefined,
    franchise: franchiseDisplay,
    debutYear: profile.debutYear || undefined,
    alignment: profile.alignment || undefined,
    details: {
      ...existingDetails,
      tokusatsuData: profile,
    },
  };
}

// ─── Built-in Tokusatsu Presets ───────────────────────────────────────────────

export const TOKUSATSU_PRESETS: TokusatsuProfile[] = [
  normalizeTokusatsuProfile({
    franchiseType: "KAMEN_RIDER",
    heroName: "Kamen Rider Geats",
    civilianName: "Ace Ukyo (浮世 英寿)",
    series: "Kamen Rider Geats",
    universe: "Desire Grand Prix World",
    country: "Japan",
    debutYear: "2022",
    firstAppearance: "Kamen Rider Revice Episode 50 / Geats Episode 1",
    status: "GOAT Status",
    alignment: "Hero / Deity of Creation",
    organization: "Desire Grand Prix",
    heroType: "Primary Kamen Rider",
    transformationSystem: "Desire Driver System",
    transformationDevice: "Desire Driver",
    transformationMethod: "Set Core ID and Raise Buckle into Desire Driver",
    transformationPhrase: "Henshin!",
    baseForm: "MagnumBoost Form",
    primaryColor: "#EF4444",
    secondaryColor: "#00F5FF",
    powerSource: "Desire Power / Creation God Energy",
    specialAbilities: ["Creation Manipulation", "Tactical Genius", "Bullet Time Precision"],
    signatureAbility: "Tactical Creation & Reset",
    weaknesses: "High emotional strain when manipulating world creation rules",
    mainActor: "Kan Hideyoshi",
    suitActor: "Yuji Nakata",
    productionStudio: "Toei Company",
    networkBroadcaster: "TV Asahi",
    broadcastPeriod: "September 4, 2022 – August 27, 2023",
    forms: [
      {
        id: "geats-magnumboost",
        name: "MagnumBoost Form",
        formType: "Base",
        appearance: "White armor with red accents and Magnum Shooter 40X revolver",
        transformationDevice: "Desire Driver",
        transformationItem: "Magnum Raise Buckle & Boost Raise Buckle",
        transformationSequence: "Set Magnum & Boost, Revolving Change!",
        transformationPhrase: "Henshin!",
        abilities: ["High Mobility", "Precision Marksmanship", "Boost Acceleration"],
        weapons: ["Magnum Shooter 40X"],
        finisher: "MagnumBoost Grand Victory",
        powerLevelNotes: "Standard Battle Form",
        debutEpisode: "Episode 1",
        imageUrl: "",
      },
      {
        id: "geats-ix",
        name: "Kamen Rider Geats IX",
        formType: "Final",
        appearance: "Pure white celestial fox form with nine glowing tails",
        transformationDevice: "Desire Driver",
        transformationItem: "Geats IX Raise Buckle",
        transformationSequence: "Revolving Change, Nine-Tailed God of Creation!",
        transformationPhrase: "Henshin!",
        abilities: ["Reality Deconstruction", "Creation", "Gravity Alteration"],
        weapons: ["Geats Buster QB9"],
        finisher: "Boost IX Victory",
        powerLevelNotes: "God Tier Form",
        debutEpisode: "Episode 38",
        imageUrl: "",
      },
    ],
    weapons: [
      {
        id: "wep-magnum-shooter",
        name: "Magnum Shooter 40X",
        type: "Revolver / Rifle",
        description: "Multi-mode ranged sidearm compatible with Raise Buckles.",
        abilities: ["Precision Burst", "Rifle Sniping"],
        specialAttack: "Charge Victory Shot",
        firstAppearance: "Episode 1",
        associatedForm: "MagnumBoost Form",
        imageUrl: "",
      },
    ],
    vehicles: [
      {
        id: "veh-boostriker",
        name: "Boostriker",
        type: "Motorcycle",
        description: "High-speed tactical motorcycle transformed from Boost Buckle.",
        abilities: ["Boost Jet Rocket Flight", "Extreme Off-Road Mobility"],
        associatedHeroForm: "Boost Form",
        debut: "Episode 1",
        imageUrl: "",
      },
    ],
    kamenRider: {
      riderName: "Kamen Rider Geats",
      riderSystem: "Desire Driver",
      transformationBelt: "Desire Driver",
      transformationDevice: "Desire Driver & Raise Buckles",
      transformationItem: "Magnum & Boost Raise Buckles",
      transformationSequence: "Set & Revolving Change",
      riderForms: ["MagnumBoost", "Fever Magnum", "Command Jet", "LaserBoost", "Geats IX"],
      riderKick: "MagnumBoost Grand Victory",
      riderWeapons: ["Magnum Shooter 40X", "Geats Buster QB9"],
      riderMachine: "Boostriker",
      riderOrganization: "Desire Grand Prix",
      mainHost: "Ace Ukyo",
      upgradeForms: ["Fever Form", "Command Form"],
      finalForm: "Geats IX",
      berserkForm: "None",
      movieExclusiveForms: ["Oneness Form"],
      rivalRiders: ["Kamen Rider Buffa"],
      alliedRiders: ["Kamen Rider Tycoon", "Kamen Rider Na-Go"],
      mainVillains: ["Jit", "Suel", "Jamatogard"],
      monsterEnemyFaction: "Jamato Faction",
      seriesEra: "Reiwa",
    },
  }),
  normalizeTokusatsuProfile({
    franchiseType: "ULTRAMAN",
    heroName: "Ultraman Tiga",
    civilianName: "Daigo Madoka (真角 大古)",
    series: "Ultraman Tiga",
    universe: "Neo Frontier Space",
    country: "Japan",
    debutYear: "1996",
    firstAppearance: "Ultraman Tiga Episode 1",
    status: "GOAT Status",
    alignment: "Hero of Light",
    organization: "GUTS (Global Unlimited Task Squad)",
    heroType: "Giant of Light",
    transformationSystem: "Spark Lence Light Channeling",
    transformationDevice: "Spark Lence",
    transformationMethod: "Raise Spark Lence high and channel Ancient Light",
    transformationPhrase: "Tiga!",
    baseForm: "Multi Type",
    primaryColor: "#3B82F6",
    secondaryColor: "#EF4444",
    powerSource: "Ancient Light of the Giant Pyramids",
    specialAbilities: ["Type Change Ability", "Zeperion Beam", "Hand Slash"],
    signatureAbility: "Zeperion Beam",
    weaknesses: "3-minute time limit due to Color Timer exhaustion",
    mainActor: "Hiroshi Nagano",
    suitActor: "Koji Nakamura / Shunsuke Gondo",
    productionStudio: "Tsuburaya Productions",
    networkBroadcaster: "MBS / TBS",
    broadcastPeriod: "September 7, 1996 – August 30, 1997",
    forms: [
      {
        id: "tiga-multi",
        name: "Multi Type",
        formType: "Base",
        appearance: "Balanced red, purple, and silver armored Giant of Light",
        transformationDevice: "Spark Lence",
        transformationItem: "Ancient Light Stone",
        transformationSequence: "Light burst transformation",
        transformationPhrase: "Tiga!",
        abilities: ["Balanced Speed & Power", "Zeperion Ray"],
        weapons: [],
        finisher: "Zeperion Beam",
        powerLevelNotes: "Balanced Base State",
        debutEpisode: "Episode 1",
        imageUrl: "",
      },
      {
        id: "tiga-power",
        name: "Power Type",
        formType: "Strong Type",
        appearance: "Red-heavy muscular armor built for wrestling and heavy impact",
        transformationDevice: "Spark Lence",
        transformationItem: "Type Change Spark",
        transformationSequence: "Cross arms and glow red",
        transformationPhrase: "Tiga Power!",
        abilities: ["Extreme Physical Strength", "Heat Resistance"],
        weapons: [],
        finisher: "Deracium Light Stream",
        powerLevelNotes: "Heavy Might State",
        debutEpisode: "Episode 2",
        imageUrl: "",
      },
      {
        id: "tiga-sky",
        name: "Sky Type",
        formType: "Speed Type",
        appearance: "Purple-heavy sleek aerodynamic armor built for aerial combat",
        transformationDevice: "Spark Lence",
        transformationItem: "Type Change Spark",
        transformationSequence: "Cross arms and glow purple",
        transformationPhrase: "Tiga Sky!",
        abilities: ["Hyper Speed Flight", "Agile Martial Arts"],
        weapons: [],
        finisher: "Runboldt Beam",
        powerLevelNotes: "Hyper Agile State",
        debutEpisode: "Episode 2",
        imageUrl: "",
      },
    ],
    ultraman: {
      ultraName: "Ultraman Tiga",
      humanHost: "Daigo Madoka",
      transformationItem: "Spark Lence",
      transformationDevice: "Spark Lence",
      transformationMethod: "Channel Ancient Light",
      transformationSequence: "Spark Lence opens with light flash",
      colorTimer: "3 Minutes (Blue to Flashing Red)",
      height: "53m",
      weight: "44,000t",
      flightSpeed: "Mach 5 (Multi) / Mach 7 (Sky)",
      runningSpeed: "Mach 1.5",
      underwaterSpeed: "Mach 1",
      jumpHeight: "800m",
      specialAbilities: ["Type Change", "Zeperion Beam", "Deracium Light Stream"],
      beamAttacks: ["Zeperion Beam", "Runboldt Beam"],
      finishingAttacks: ["Zeperion Beam", "Timer Flash Special"],
      weapons: [],
      forms: ["Multi Type", "Power Type", "Sky Type", "Glitter Tiga"],
      fusionCombination: "Glitter Tiga (Combined Children Light)",
      ultraBrothersAllies: ["Ultraman Dyna", "Ultraman Gaia"],
      defenseTeam: "GUTS",
      kaijuEnemies: ["Gatanothor", "Golza", "Melba"],
      mainRival: "Evil Tiga / Camearra",
      planetOrigin: "Earth (Ancient Civilization)",
      ultraUniverse: "Neo Frontier Space",
      seriesEra: "Heisei",
    },
  }),
  normalizeTokusatsuProfile({
    franchiseType: "POWER_RANGERS",
    heroName: "Mighty Morphin Red Ranger",
    civilianName: "Jason Lee Scott",
    series: "Mighty Morphin Power Rangers",
    universe: "Power Rangers Main Universe",
    country: "United States",
    debutYear: "1993",
    firstAppearance: "Mighty Morphin Power Rangers S01E01",
    status: "GOAT Status",
    alignment: "Hero / Team Captain",
    organization: "Power Rangers Command Center",
    heroType: "Red Ranger / Field Leader",
    transformationSystem: "Power Morpher & Power Coins",
    transformationDevice: "Power Morpher",
    transformationMethod: "Insert Tyrannosaurus Power Coin into Power Morpher",
    transformationPhrase: "It's Morphin Time! Tyrannosaurus!",
    baseForm: "Red Ranger Suit",
    primaryColor: "#EF4444",
    secondaryColor: "#FFFFFF",
    powerSource: "Morphin Grid & Tyrannosaurus Dino Coin",
    specialAbilities: ["Martial Arts Mastery", "Sword Strike Precision", "Zord Command"],
    signatureAbility: "Power Sword Energy Strike",
    weaknesses: "Vulnerable to Morphin Grid energy disruptions",
    mainActor: "Austin St. John",
    suitActor: "Hiroshi Maeda",
    productionStudio: "Saban Entertainment",
    networkBroadcaster: "Fox Kids",
    broadcastPeriod: "August 28, 1993 – November 27, 1995",
    forms: [
      {
        id: "mmpr-red-base",
        name: "Mighty Morphin Red Ranger",
        formType: "Base",
        appearance: "Classic Red spandex suit with white diamond chest pattern and helmet",
        transformationDevice: "Power Morpher",
        transformationItem: "Tyrannosaurus Power Coin",
        transformationSequence: "It's Morphin Time! Tyrannosaurus!",
        transformationPhrase: "Tyrannosaurus!",
        abilities: ["Enhanced Strength", "Martial Arts"],
        weapons: ["Power Sword", "Blade Blaster"],
        finisher: "Power Sword Strike / Power Blaster Combined Shot",
        powerLevelNotes: "Base Ranger Suit",
        debutEpisode: "S01E01 - Day of the Dumpster",
        imageUrl: "",
      },
    ],
    weapons: [
      {
        id: "wep-power-sword",
        name: "Power Sword",
        type: "Broadsword",
        description: "Red Ranger's signature melee blade that channels energy.",
        abilities: ["Energy Strike", "Power Blaster Component"],
        specialAttack: "Red Energy Slash",
        firstAppearance: "Episode 1",
        associatedForm: "Base",
        imageUrl: "",
      },
    ],
    vehicles: [
      {
        id: "veh-tyrannozord",
        name: "Tyrannosaurus Dinozord",
        type: "Zord / Mecha",
        description: "Giant mechanical Tyrannosaurus forming the core torso of the Dino Megazord.",
        abilities: ["Seismic Roar", "Tail Whip", "Fire Breath"],
        associatedHeroForm: "Base",
        debut: "Episode 1",
        imageUrl: "",
      },
    ],
    powerRangers: {
      rangerName: "Mighty Morphin Red Ranger",
      civilianIdentity: "Jason Lee Scott",
      rangerColor: "Red",
      rangerTeam: "Mighty Morphin Power Rangers",
      rangerNumber: "1",
      morphingDevice: "Power Morpher",
      morphingCall: "It's Morphin Time! Tyrannosaurus!",
      morphingSequence: "Power Coin flash and suit materialization",
      rangerSuit: "Red Diamond Suit",
      powerSource: "Morphin Grid",
      rangerPowers: ["Tyrannosaurus Power", "Dragon Shield (Temporary)"],
      individualWeapon: "Power Sword",
      teamWeapon: "Power Blaster",
      personalZord: "Tyrannosaurus Dinozord",
      megazord: "Dino Megazord",
      zordCombination: "Dino Megazord Tank & Battle Mode",
      rangerTeamAffiliation: "Command Center Rangers",
      mentor: "Zordon & Alpha 5",
      commandCenter: "Angel Grove Command Center",
      mainVillains: ["Rita Repulsa", "Lord Zedd", "Goldar"],
      enemyFaction: "Putty Patrol / Rita's Monsters",
      rangerAllies: ["Tommy Oliver (Green Ranger)", "Kimberly Hart (Pink Ranger)"],
      sixthRangerStatus: "Led team alongside Green Ranger Tommy Oliver",
      formerRangerStatus: "Returned as Gold Zeo Ranger",
      seriesEra: "Saban Era",
    },
  }),
];

export function searchTokusatsuPresets(query: string): TokusatsuProfile[] {
  if (!query || !query.trim()) return TOKUSATSU_PRESETS;
  const q = query.toLowerCase().trim();
  return TOKUSATSU_PRESETS.filter((p) => {
    const matchName = p.heroName.toLowerCase().includes(q);
    const matchCivilian = p.civilianName.toLowerCase().includes(q);
    const matchSeries = p.series.toLowerCase().includes(q);
    const matchType = p.franchiseType.toLowerCase().includes(q);
    return matchName || matchCivilian || matchSeries || matchType;
  });
}
