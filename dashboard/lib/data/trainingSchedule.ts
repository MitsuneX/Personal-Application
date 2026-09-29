/**
 * Canonical Home Training Schedule Data Model
 *
 * This is the single source of truth for the weekly home training schedule.
 * The UI derives entirely from this data — never from hardcoded weekday checks.
 *
 * Adding a new training day, block, or exercise = adding data here.
 * No UI changes required.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type TrainingBlockType =
  | "warmup"
  | "shadowboxing"
  | "strength"
  | "cooldown"
  | "kicking"
  | "footwork"
  | "reflex"
  | "flexibility"
  | "walk"
  | "grip"
  | "mobility"
  | "breathing"
  | "core"
  | "rest";

export type TrainingCategory =
  | "Boxing"
  | "Taekwondo"
  | "Strength"
  | "Flexibility"
  | "Recovery"
  | "Conditioning"
  | "Rest";

export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

/** Maps to JS Date.getDay() — 0=Sunday, 1=Monday … 6=Saturday */
export const DAY_OF_WEEK_INDEX: Record<DayOfWeek, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

export interface TrainingExercise {
  id: string;
  name: string;
  /** Optional detail / instruction */
  detail?: string;
  reps?: string;       // e.g. "8-15", "20", "8-10 / arm"
  duration?: string;   // e.g. "30-45 seconds"
  sets?: number;
  rounds?: number;
  rest?: string;       // e.g. "45-60 seconds"
  intensity?: string;  // e.g. "~70%"
  notes?: string;      // technique cues
}

export interface TrainingBlock {
  id: string;
  title: string;
  type: TrainingBlockType;
  /** Human-readable duration (e.g. "5 minutes") */
  duration?: string;
  rounds?: number;
  sets?: number;
  rest?: string;
  intensity?: string;
  exercises: TrainingExercise[];
  /** XP awarded on block completion */
  xp: number;
  /** Whether this block is required (vs. optional) */
  required: boolean;
  instructions?: string;
}

export interface TrainingDay {
  id: string;
  dayOfWeek: DayOfWeek;
  /** e.g. "Monday" */
  label: string;
  /** Short abbreviation e.g. "MON" */
  short: string;
  title: string;
  subtitle: string;
  estimatedDuration: string;
  categories: TrainingCategory[];
  /** Related hobby skill names for Hobbies cross-linking */
  hobbyLinks?: string[];
  blocks: TrainingBlock[];
  /** Rest day — no workout blocks */
  isRestDay?: boolean;
  restNote?: string;
}

// ─── Monday ──────────────────────────────────────────────────────────────────

const MONDAY: TrainingDay = {
  id: "monday",
  dayOfWeek: "monday",
  label: "Monday",
  short: "MON",
  title: "Boxing & Upper Body Strength",
  subtitle: "Shadowboxing · Strength · Technique",
  estimatedDuration: "40–45 min",
  categories: ["Boxing", "Strength"],
  hobbyLinks: ["MMA", "Silat"],
  blocks: [
    {
      id: "mon-warmup",
      title: "Warm-Up",
      type: "warmup",
      duration: "5 minutes",
      xp: 10,
      required: true,
      exercises: [
        { id: "mon-wu-1", name: "Arm circles", reps: "20 forward / 20 backward" },
        { id: "mon-wu-2", name: "Shoulder rolls", reps: "15" },
        { id: "mon-wu-3", name: "Hip circles", reps: "15 each direction" },
        { id: "mon-wu-4", name: "Light bouncing", duration: "1 minute" },
        { id: "mon-wu-5", name: "Easy air punches", duration: "2 minutes" },
      ],
    },
    {
      id: "mon-shadowboxing",
      title: "Shadowboxing",
      type: "shadowboxing",
      rounds: 5,
      duration: "3 minutes per round",
      rest: "45–60 seconds",
      intensity: "~70%",
      xp: 25,
      required: true,
      exercises: [
        { id: "mon-sb-r1", name: "Round 1", detail: "Stance · Guard · Footwork" },
        { id: "mon-sb-r2", name: "Round 2", detail: "Lead jab mechanics" },
        { id: "mon-sb-r3", name: "Round 3", detail: "Jab-cross · Rear hip pivot" },
        { id: "mon-sb-r4", name: "Round 4", detail: "1-2 · Step off angle" },
        { id: "mon-sb-r5", name: "Round 5", detail: "Free combinations · Head defense" },
      ],
    },
    {
      id: "mon-strength",
      title: "Strength",
      type: "strength",
      sets: 3,
      rest: "60–90 seconds",
      xp: 20,
      required: true,
      exercises: [
        { id: "mon-st-1", name: "Push-ups", reps: "8–15", notes: "Neutral wrist" },
        { id: "mon-st-2", name: "Single-arm 5 kg hammer curls", reps: "8–10 / arm", notes: "Locked wrist" },
        { id: "mon-st-3", name: "Elbow plank", duration: "30–45 seconds" },
        { id: "mon-st-4", name: "Bird-dog", reps: "8–12 / side" },
      ],
    },
    {
      id: "mon-cooldown",
      title: "Cooldown",
      type: "cooldown",
      duration: "5 minutes",
      xp: 10,
      required: true,
      exercises: [
        { id: "mon-cd-1", name: "Arm across chest stretch", reps: "2 × 30 seconds / arm" },
        { id: "mon-cd-2", name: "Wrist stretch (palms-up/down)", reps: "2 × 20 seconds" },
      ],
    },
  ],
};

// ─── Tuesday ─────────────────────────────────────────────────────────────────

const TUESDAY: TrainingDay = {
  id: "tuesday",
  dayOfWeek: "tuesday",
  label: "Tuesday",
  short: "TUE",
  title: "Taekwondo, Balance & Reflex",
  subtitle: "Kicking Mechanics · Footwork · Flexibility",
  estimatedDuration: "40–45 min",
  categories: ["Taekwondo", "Flexibility", "Conditioning"],
  hobbyLinks: ["Taekwondo", "MMA"],
  blocks: [
    {
      id: "tue-warmup",
      title: "Warm-Up",
      type: "warmup",
      duration: "5–7 minutes",
      xp: 10,
      required: true,
      exercises: [
        { id: "tue-wu-1", name: "Arm/shoulder rolls", reps: "20 each" },
        { id: "tue-wu-2", name: "Hip circles", reps: "15 each" },
        { id: "tue-wu-3", name: "Leg swings", reps: "10 / leg" },
        { id: "tue-wu-4", name: "Light bouncing/knee lifts", duration: "1–2 minutes" },
      ],
    },
    {
      id: "tue-kicking",
      title: "Kicking Mechanics / Balance",
      type: "kicking",
      sets: 3,
      xp: 20,
      required: true,
      exercises: [
        { id: "tue-km-1", name: "Knee-up chamber holds", duration: "15–20 seconds / leg" },
        { id: "tue-km-2", name: "Slow front kicks", reps: "8–10 / leg", notes: "1 second peak hold" },
        { id: "tue-km-3", name: "Slow side kicks", reps: "6–8 / leg", notes: "Pivot heel out" },
      ],
    },
    {
      id: "tue-footwork",
      title: "Footwork / Agility",
      type: "footwork",
      rounds: 4,
      duration: "1 minute per round",
      rest: "30–45 seconds",
      xp: 15,
      required: true,
      exercises: [
        { id: "tue-fw-1", name: "Sets 1–2: Forward/back stance shifts" },
        { id: "tue-fw-2", name: "Sets 3–4: Single-leg balance bounces", notes: "Switch every 15 seconds" },
      ],
    },
    {
      id: "tue-reflex",
      title: "Reflex",
      type: "reflex",
      rounds: 3,
      duration: "2 minutes per round",
      rest: "30–45 seconds",
      xp: 15,
      required: true,
      exercises: [
        { id: "tue-rf-1", name: "Reflex sequence", detail: "Check Guard → Pivot Hip → Duck → Reset" },
      ],
    },
    {
      id: "tue-flexibility",
      title: "Deep Flexibility / Cooldown",
      type: "flexibility",
      duration: "7 minutes",
      xp: 10,
      required: true,
      exercises: [
        { id: "tue-fl-1", name: "Wide-leg straddle", reps: "3 × 45 seconds" },
        { id: "tue-fl-2", name: "Standing hamstring stretch", reps: "2 × 30 seconds / leg" },
        { id: "tue-fl-3", name: "Butterfly stretch", reps: "2 × 45 seconds" },
      ],
    },
  ],
};

// ─── Wednesday ───────────────────────────────────────────────────────────────

const WEDNESDAY: TrainingDay = {
  id: "wednesday",
  dayOfWeek: "wednesday",
  label: "Wednesday",
  short: "WED",
  title: "Active Recovery & Grip Health",
  subtitle: "Light Walk · Forearm · Mobility",
  estimatedDuration: "30–35 min",
  categories: ["Recovery", "Conditioning"],
  hobbyLinks: [],
  blocks: [
    {
      id: "wed-walk",
      title: "Light Walk",
      type: "walk",
      duration: "15–20 minutes",
      xp: 10,
      required: true,
      exercises: [
        { id: "wed-wk-1", name: "Conversational pace walk", duration: "15–20 minutes" },
      ],
    },
    {
      id: "wed-grip",
      title: "Forearm / Grip",
      type: "grip",
      sets: 3,
      xp: 15,
      required: true,
      exercises: [
        { id: "wed-gr-1", name: "Hand gripper", reps: "12–15 / hand", notes: "Neutral wrist" },
        { id: "wed-gr-2", name: "Wrist mobility rotations", reps: "2 × 15", notes: "Zero weight" },
      ],
    },
    {
      id: "wed-mobility",
      title: "Mobility / Flexibility",
      type: "mobility",
      duration: "8–10 minutes",
      xp: 15,
      required: true,
      exercises: [
        { id: "wed-mb-1", name: "Cat-cow", reps: "10" },
        { id: "wed-mb-2", name: "Doorway chest stretch", reps: "2 × 30 seconds" },
        { id: "wed-mb-3", name: "Deep squat / hip opener", reps: "2 × 45 seconds" },
        { id: "wed-mb-4", name: "Wrist stretch (palms-up/down)", reps: "2 × 30 seconds" },
      ],
    },
    {
      id: "wed-breathing",
      title: "Mind / Recovery",
      type: "breathing",
      duration: "5 minutes",
      xp: 10,
      required: true,
      exercises: [
        {
          id: "wed-br-1",
          name: "Deep belly breathing",
          detail: "4 seconds inhale · 6 seconds exhale",
          duration: "5 minutes",
        },
      ],
    },
  ],
};

// ─── Thursday ────────────────────────────────────────────────────────────────

const THURSDAY: TrainingDay = {
  id: "thursday",
  dayOfWeek: "thursday",
  label: "Thursday",
  short: "THU",
  title: "Boxing, Lower Strength & Reflex",
  subtitle: "Shadowboxing · Squats · Lunges · Slips",
  estimatedDuration: "40–45 min",
  categories: ["Boxing", "Strength", "Conditioning"],
  hobbyLinks: ["MMA", "Silat"],
  blocks: [
    {
      id: "thu-warmup",
      title: "Warm-Up",
      type: "warmup",
      duration: "5 minutes",
      xp: 10,
      required: true,
      exercises: [
        { id: "thu-wu-1", name: "Shoulder rotations", reps: "15–20" },
        { id: "thu-wu-2", name: "Wrist rotations", reps: "15–20" },
        { id: "thu-wu-3", name: "Hip rotations", reps: "15–20" },
        { id: "thu-wu-4", name: "Bounce", duration: "1–2 minutes" },
      ],
    },
    {
      id: "thu-shadowboxing",
      title: "Shadowboxing",
      type: "shadowboxing",
      rounds: 5,
      duration: "3 minutes per round",
      rest: "45–60 seconds",
      intensity: "~70%",
      xp: 25,
      required: true,
      exercises: [
        { id: "thu-sb-r1", name: "Round 1", detail: "Footwork · High guard" },
        { id: "thu-sb-r2", name: "Round 2", detail: "1-2 · Hip rotation" },
        { id: "thu-sb-r3", name: "Round 3", detail: "Lead/rear hooks · Elbows parallel" },
        { id: "thu-sb-r4", name: "Round 4", detail: "Slips · Weaves" },
        { id: "thu-sb-r5", name: "Round 5", detail: "Free flow" },
      ],
    },
    {
      id: "thu-strength",
      title: "Strength",
      type: "strength",
      sets: 3,
      rest: "60–90 seconds",
      xp: 20,
      required: true,
      exercises: [
        { id: "thu-st-1", name: "5 kg goblet squat", reps: "10–15", notes: "Weight vertical at chest" },
        { id: "thu-st-2", name: "Single-arm 5 kg hammer curl", reps: "8–10 / arm", notes: "Locked wrist" },
        { id: "thu-st-3", name: "Reverse lunge", reps: "8–10 / leg" },
      ],
    },
    {
      id: "thu-reflex",
      title: "Reflex",
      type: "reflex",
      rounds: 3,
      duration: "2 minutes per round",
      rest: "30–45 seconds",
      xp: 15,
      required: true,
      exercises: [
        { id: "thu-rf-1", name: "Reflex sequence", detail: "Punch → Guard → Slip → Duck → Reset" },
      ],
    },
    {
      id: "thu-cooldown",
      title: "Cooldown",
      type: "cooldown",
      duration: "5 minutes",
      xp: 10,
      required: true,
      exercises: [
        { id: "thu-cd-1", name: "Chest stretch", reps: "2 × 30 seconds" },
        { id: "thu-cd-2", name: "Shoulder stretch", reps: "2 × 30 seconds" },
        { id: "thu-cd-3", name: "Wrist stretch", reps: "2 × 30 seconds" },
      ],
    },
  ],
};

// ─── Friday ──────────────────────────────────────────────────────────────────

const FRIDAY: TrainingDay = {
  id: "friday",
  dayOfWeek: "friday",
  label: "Friday",
  short: "FRI",
  title: "Taekwondo, Kick Speed & Flexibility",
  subtitle: "Kick Combos · Speed Intervals · Deep Stretch",
  estimatedDuration: "40–45 min",
  categories: ["Taekwondo", "Flexibility", "Conditioning"],
  hobbyLinks: ["Taekwondo"],
  blocks: [
    {
      id: "fri-warmup",
      title: "Warm-Up",
      type: "warmup",
      duration: "5–7 minutes",
      xp: 10,
      required: true,
      exercises: [
        { id: "fri-wu-1", name: "Dynamic leg swings" },
        { id: "fri-wu-2", name: "Hip circles" },
        { id: "fri-wu-3", name: "Light bounce" },
      ],
    },
    {
      id: "fri-kick-combos",
      title: "Kick Combos",
      type: "kicking",
      rounds: 4,
      duration: "2 minutes per round",
      rest: "45 seconds",
      xp: 25,
      required: true,
      exercises: [
        { id: "fri-kc-r1", name: "Round 1", detail: "Front kick resets" },
        { id: "fri-kc-r2", name: "Round 2", detail: "Lead front kick → Rear roundhouse" },
        { id: "fri-kc-r3", name: "Round 3", detail: "Front kick → Roundhouse → Side kick" },
        { id: "fri-kc-r4", name: "Round 4", detail: "Free kicking · Stance flow" },
      ],
    },
    {
      id: "fri-speed",
      title: "Speed / Agility",
      type: "footwork",
      xp: 15,
      required: true,
      exercises: [
        { id: "fri-sp-1", name: "Speed kick intervals", reps: "3 × 20 seconds / leg" },
        { id: "fri-sp-2", name: "Stance switches agility", reps: "4 × 1 minute" },
      ],
    },
    {
      id: "fri-reflex",
      title: "Reflex",
      type: "reflex",
      rounds: 3,
      duration: "2 minutes per round",
      xp: 15,
      required: true,
      exercises: [
        { id: "fri-rf-1", name: "Reflex sequence", detail: "Guard → Pivot → Slip → Counter Snap Kick" },
      ],
    },
    {
      id: "fri-flexibility",
      title: "Deep Flexibility",
      type: "flexibility",
      duration: "7–10 minutes",
      xp: 10,
      required: true,
      exercises: [
        { id: "fri-fl-1", name: "Frog stretch", reps: "3 × 45 seconds" },
        { id: "fri-fl-2", name: "Straddle stretch", reps: "3 × 45 seconds / side" },
        { id: "fri-fl-3", name: "Butterfly stretch", reps: "2 × 45 seconds" },
      ],
    },
  ],
};

// ─── Saturday ────────────────────────────────────────────────────────────────

const SATURDAY: TrainingDay = {
  id: "saturday",
  dayOfWeek: "saturday",
  label: "Saturday",
  short: "SAT",
  title: "Light Boxing & Dedicated Core",
  subtitle: "Light Shadowboxing · Core · Reflex",
  estimatedDuration: "35–40 min",
  categories: ["Boxing", "Strength"],
  hobbyLinks: ["MMA"],
  blocks: [
    {
      id: "sat-warmup",
      title: "Warm-Up",
      type: "warmup",
      duration: "5 minutes",
      xp: 10,
      required: true,
      exercises: [
        { id: "sat-wu-1", name: "Shoulder circles" },
        { id: "sat-wu-2", name: "Wrist circles" },
        { id: "sat-wu-3", name: "Hip circles" },
      ],
    },
    {
      id: "sat-shadowboxing",
      title: "Light Shadowboxing",
      type: "shadowboxing",
      rounds: 4,
      duration: "3 minutes per round",
      intensity: "~60%",
      xp: 20,
      required: true,
      exercises: [
        {
          id: "sat-sb-1",
          name: "Light rhythm shadowboxing",
          detail: "Stance · Footwork · Light jabs · Slipping · Relaxed rhythm",
        },
      ],
    },
    {
      id: "sat-core",
      title: "Core",
      type: "core",
      sets: 3,
      rest: "45–60 seconds",
      xp: 20,
      required: true,
      exercises: [
        { id: "sat-co-1", name: "Elbow plank", duration: "30–60 seconds" },
        { id: "sat-co-2", name: "Lying leg raises", reps: "10–15" },
        { id: "sat-co-3", name: "Bird-dog", reps: "8–12 / side", notes: "1 second pause" },
      ],
    },
    {
      id: "sat-reflex",
      title: "Reflex",
      type: "reflex",
      rounds: 3,
      duration: "2 minutes per round",
      xp: 15,
      required: true,
      exercises: [
        { id: "sat-rf-1", name: "Reflex sequence", detail: "Double Slip → Counter Jab → Step Back & Reset" },
      ],
    },
    {
      id: "sat-cooldown",
      title: "Cooldown",
      type: "cooldown",
      duration: "5 minutes",
      xp: 10,
      required: true,
      exercises: [
        { id: "sat-cd-1", name: "Cobra stretch", reps: "2 × 30 seconds" },
        { id: "sat-cd-2", name: "Child's pose", reps: "2 × 45 seconds" },
        { id: "sat-cd-3", name: "Gentle wrist stretch", reps: "2 × 20 seconds" },
      ],
    },
  ],
};

// ─── Sunday ──────────────────────────────────────────────────────────────────

const SUNDAY: TrainingDay = {
  id: "sunday",
  dayOfWeek: "sunday",
  label: "Sunday",
  short: "SUN",
  title: "Full Rest & Reset",
  subtitle: "Recovery · Nutrition · Hydration · Sleep",
  estimatedDuration: "—",
  categories: ["Rest"],
  hobbyLinks: [],
  isRestDay: true,
  restNote:
    "Intentional recovery day. Focus on high-protein meal prep (e.g. chicken breasts), hydration, and a proper sleep reset. Sunday does not count as a missed workout.",
  blocks: [],
};

// ─── Canonical Weekly Schedule ────────────────────────────────────────────────

export const WEEKLY_TRAINING_SCHEDULE: TrainingDay[] = [
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,
  SUNDAY,
];

// ─── Runtime Helpers ─────────────────────────────────────────────────────────

/** Returns total XP for all required blocks in a TrainingDay */
export function getTotalDayXp(day: TrainingDay): number {
  return day.blocks.filter((b) => b.required).reduce((sum, b) => sum + b.xp, 0);
}

/** Returns the TrainingDay for a given JS day index (0=Sun … 6=Sat) */
export function getTrainingDayByIndex(dayIndex: number): TrainingDay {
  const dayMap: Record<number, DayOfWeek> = {
    0: "sunday",
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday",
  };
  const dayId = dayMap[dayIndex] ?? "sunday";
  return WEEKLY_TRAINING_SCHEDULE.find((d) => d.id === dayId) ?? SUNDAY;
}

/** Returns today's TrainingDay */
export function getTodayTrainingDay(): TrainingDay {
  return getTrainingDayByIndex(new Date().getDay());
}

/** Returns the current YYYY-MM-DD date string */
export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}
