// ─── TOKUSATSU DOMAIN TYPES ───────────────────────────────────────────────────

export type TokusatsuFranchiseType =
  | "KAMEN_RIDER"
  | "ULTRAMAN"
  | "POWER_RANGERS"
  | "SUPER_SENTAI"
  | "OTHER";

export type FormTypeCategory =
  | "Base"
  | "Upgrade"
  | "Super"
  | "Final"
  | "Movie"
  | "Special"
  | "Berserk"
  | "Power Type"
  | "Speed Type"
  | "Sky Type"
  | "Strong Type"
  | "Fusion"
  | "Other";

export interface TokusatsuForm {
  id: string;
  name: string;
  formType: string;
  appearance: string;
  transformationDevice: string;
  transformationItem: string;
  transformationSequence: string;
  transformationPhrase: string;
  abilities: string[];
  weapons: string[];
  finisher: string;
  powerLevelNotes: string;
  debutEpisode: string;
  imageUrl: string;
}

export interface TokusatsuWeapon {
  id: string;
  name: string;
  type: string;
  description: string;
  abilities: string[];
  specialAttack: string;
  firstAppearance: string;
  associatedForm: string;
  imageUrl: string;
}

export interface TokusatsuVehicle {
  id: string;
  name: string;
  type: string;
  description: string;
  abilities: string;
  associatedHeroForm: string;
  debut: string;
  imageUrl: string;
}

export interface TokusatsuAbility {
  id: string;
  name: string;
  category: string;
  description: string;
  activationMethod: string;
  associatedForm: string;
  visualEffect: string;
  isFinisher: boolean;
  debut: string;
}

export interface TokusatsuAppearance {
  id: string;
  title: string;
  appearanceType: "Main Series" | "Movie" | "Special" | "Crossover" | "Spin-off" | "Cameo" | "Guest";
  episodeFilmNumber: string;
  releaseYear: string;
  role: string;
  notes: string;
}

export interface KamenRiderSpecificData {
  riderName: string;
  riderSystem: string;
  transformationBelt: string;
  transformationDevice: string;
  transformationItem: string;
  transformationSequence: string;
  riderForms: string[];
  riderKick: string;
  riderWeapons: string[];
  riderMachine: string;
  riderOrganization: string;
  mainHost: string;
  upgradeForms: string[];
  finalForm: string;
  berserkForm: string;
  movieExclusiveForms: string[];
  rivalRiders: string[];
  alliedRiders: string[];
  mainVillains: string[];
  monsterEnemyFaction: string;
  seriesEra: "Showa" | "Heisei Phase 1" | "Heisei Phase 2" | "Reiwa" | "";
}

export interface UltramanSpecificData {
  ultraName: string;
  humanHost: string;
  transformationItem: string;
  transformationDevice: string;
  transformationMethod: string;
  transformationSequence: string;
  colorTimer: string;
  height: string;
  weight: string;
  flightSpeed: string;
  runningSpeed: string;
  underwaterSpeed: string;
  jumpHeight: string;
  specialAbilities: string[];
  beamAttacks: string[];
  finishingAttacks: string[];
  weapons: string[];
  forms: string[];
  fusionCombination: string;
  ultraBrothersAllies: string[];
  defenseTeam: string;
  kaijuEnemies: string[];
  mainRival: string;
  planetOrigin: string;
  ultraUniverse: string;
  seriesEra: "Showa" | "Heisei" | "New Generation" | "Reiwa" | "";
}

export interface PowerRangersSpecificData {
  rangerName: string;
  civilianIdentity: string;
  rangerColor: string;
  rangerTeam: string;
  rangerNumber: string;
  morphingDevice: string;
  morphingCall: string;
  morphingSequence: string;
  rangerSuit: string;
  powerSource: string;
  rangerPowers: string[];
  individualWeapon: string;
  teamWeapon: string;
  personalZord: string;
  megazord: string;
  zordCombination: string;
  rangerTeamAffiliation: string;
  mentor: string;
  commandCenter: string;
  mainVillains: string[];
  enemyFaction: string;
  rangerAllies: string[];
  sixthRangerStatus: string;
  formerRangerStatus: string;
  seriesEra: "Saban Era" | "Disney Era" | "Neo-Saban Era" | "Hasbro Era" | "";
}

export interface SuperSentaiSpecificData {
  sentaiName: string;
  rangerColor: string;
  teamPosition: string;
  transformationDevice: string;
  transformationItem: string;
  transformationCall: string;
  personalWeapon: string;
  teamWeapon: string;
  mecha: string;
  individualMecha: string;
  combinationGattai: string;
  team: string;
  mentor: string;
  villainFaction: string;
  monsters: string[];
  sixthRanger: string;
  additionalRangers: string[];
  seriesEra: "Showa" | "Heisei" | "Reiwa" | "";
}

export interface TokusatsuProfile {
  // Shared Basic Identity
  franchiseType: TokusatsuFranchiseType;
  heroName: string;
  civilianName: string;
  series: string;
  universe: string;
  country: string;
  debutYear: string;
  firstAppearance: string;
  status: string;
  alignment: string;
  organization: string;

  // Tokusatsu Profile & Transformation
  heroType: string;
  transformationSystem: string;
  transformationDevice: string;
  transformationMethod: string;
  transformationPhrase: string;
  baseForm: string;
  primaryColor: string;
  secondaryColor: string;
  suitDescription: string;
  powerSource: string;
  specialAbilities: string[];
  signatureAbility: string;
  weaknesses: string;

  // Card Visuals
  imageUrl: string;
  portraitUrl: string;
  avatarUrl: string;
  accentColor: string;
  galleryUrls: string[];

  // Repeatable Collections
  forms: TokusatsuForm[];
  weapons: TokusatsuWeapon[];
  vehicles: TokusatsuVehicle[];
  abilities: TokusatsuAbility[];
  appearances: TokusatsuAppearance[];

  // Cast & Production
  mainActor: string;
  suitActor: string;
  voiceActor: string;
  stuntPerformer: string;
  director: string;
  writer: string;
  productionStudio: string;
  networkBroadcaster: string;
  broadcastPeriod: string;
  productionNotes: string;

  // Franchise Specific Profiles
  kamenRider?: KamenRiderSpecificData;
  ultraman?: UltramanSpecificData;
  powerRangers?: PowerRangersSpecificData;
  superSentai?: SuperSentaiSpecificData;
}
