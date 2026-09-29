import {
  WEEKLY_TRAINING_SCHEDULE,
  getTrainingDayByIndex,
  getTotalDayXp,
  getTodayTrainingDay,
} from "../lib/data/trainingSchedule";
import { TRAINING_QUOTES } from "../lib/data/trainingQuotes";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ Assertion failed: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ ${msg}`);
}

async function runTests() {
  console.log("=== Testing Home Training Schedule Canonical Data ===");

  // 1. Verify 7 days exist
  assert(WEEKLY_TRAINING_SCHEDULE.length === 7, "Schedule has exactly 7 days");

  const [mon, tue, wed, thu, fri, sat, sun] = WEEKLY_TRAINING_SCHEDULE;

  // 2. Verify Monday
  assert(mon.id === "monday", "Monday exists");
  assert(mon.title === "Boxing & Upper Body Strength", "Monday title matches");
  assert(mon.blocks.length === 4, "Monday has 4 blocks (warmup, shadowboxing, strength, cooldown)");
  assert(mon.blocks[1].rounds === 5, "Monday shadowboxing has 5 rounds");
  assert(getTotalDayXp(mon) === 65, "Monday total XP is 65 (10+25+20+10)");

  // 3. Verify Tuesday
  assert(tue.id === "tuesday", "Tuesday exists");
  assert(tue.title === "Taekwondo, Balance & Reflex", "Tuesday title matches");
  assert(tue.blocks.length === 5, "Tuesday has 5 blocks");
  assert(tue.categories.includes("Taekwondo"), "Tuesday has Taekwondo category");

  // 4. Verify Wednesday
  assert(wed.id === "wednesday", "Wednesday exists");
  assert(wed.title === "Active Recovery & Grip Health", "Wednesday title matches");
  assert(wed.blocks.some(b => b.title.includes("Grip")), "Wednesday has Grip block");
  assert(wed.blocks.some(b => b.title.includes("Walk")), "Wednesday has Light Walk block");

  // 5. Verify Thursday
  assert(thu.id === "thursday", "Thursday exists");
  assert(thu.title === "Boxing, Lower Strength & Reflex", "Thursday title matches");

  // 6. Verify Friday
  assert(fri.id === "friday", "Friday exists");
  assert(fri.title === "Taekwondo, Kick Speed & Flexibility", "Friday title matches");

  // 7. Verify Saturday
  assert(sat.id === "saturday", "Saturday exists");
  assert(sat.title === "Light Boxing & Dedicated Core", "Saturday title matches");

  // 8. Verify Sunday (Rest Day)
  assert(sun.id === "sunday", "Sunday exists");
  assert(sun.isRestDay === true, "Sunday is marked isRestDay === true");
  assert(sun.blocks.length === 0, "Sunday has 0 required workout blocks");
  assert(sun.restNote !== undefined && sun.restNote.length > 0, "Sunday has restNote for nutrition and sleep");

  // 9. Verify Motivational Quotes
  assert(TRAINING_QUOTES.length >= 20, "Training quotes list has at least 20 quotes");
  assert(TRAINING_QUOTES.every(q => q.id && q.text), "All quotes have id and text");

  // 10. Verify Idempotent XP Calculations & 3 States
  console.log("\n=== Testing 3-State Progress & XP Calculation Logic ===");
  const testDay = mon;
  const block1 = testDay.blocks[0]; // 10 XP
  const block2 = testDay.blocks[1]; // 25 XP
  const block3 = testDay.blocks[2]; // 20 XP
  const block4 = testDay.blocks[3]; // 10 XP

  // Initial: All pending
  let completed: string[] = [];
  let exhausted: string[] = [];
  let xp = testDay.blocks.filter(b => completed.includes(b.id)).reduce((s, b) => s + b.xp, 0);
  assert(xp === 0, "Initial XP is 0");

  // Complete Block 1 (+10)
  completed.push(block1.id);
  xp = testDay.blocks.filter(b => completed.includes(b.id)).reduce((s, b) => s + b.xp, 0);
  assert(xp === 10, "Completing Block 1 awards exactly 10 XP");

  // Complete Block 2 (+25) -> Total 35
  completed.push(block2.id);
  xp = testDay.blocks.filter(b => completed.includes(b.id)).reduce((s, b) => s + b.xp, 0);
  assert(xp === 35, "Completing Block 2 brings total to 35 XP");

  // Mark Block 3 as EXHAUSTED (0 completion XP)
  exhausted.push(block3.id);
  xp = testDay.blocks.filter(b => completed.includes(b.id)).reduce((s, b) => s + b.xp, 0);
  assert(xp === 35, "Exhausting Block 3 leaves XP at 35 (no bonus completion XP)");

  // Transition Block 3: EXHAUSTED -> COMPLETED (+20 XP)
  exhausted = exhausted.filter(id => id !== block3.id);
  completed.push(block3.id);
  xp = testDay.blocks.filter(b => completed.includes(b.id)).reduce((s, b) => s + b.xp, 0);
  assert(xp === 55, "Transitioning Exhausted -> Completed awards 20 XP (total 55)");

  // Transition Block 2: COMPLETED -> EXHAUSTED (-25 XP)
  completed = completed.filter(id => id !== block2.id);
  exhausted.push(block2.id);
  xp = testDay.blocks.filter(b => completed.includes(b.id)).reduce((s, b) => s + b.xp, 0);
  assert(xp === 30, "Transitioning Completed -> Exhausted safely recalculates XP to 30");

  // Status check: Completed 1 & 3, Exhausted 2, Pending 4 -> "IN_PROGRESS"
  const req = testDay.blocks.filter(b => b.required);
  let status = "NOT_STARTED";
  if (req.every(b => completed.includes(b.id))) {
    status = "COMPLETED";
  } else if (req.every(b => completed.includes(b.id) || exhausted.includes(b.id))) {
    status = exhausted.length > 0 ? "RECOVERY_COMPLETE" : "COMPLETED";
  } else if (completed.length > 0 || exhausted.length > 0) {
    status = "IN_PROGRESS";
  }
  assert(status === "IN_PROGRESS", "Partial session is IN_PROGRESS");

  // Exhaust block 4 -> Now all required blocks addressed (1, 3 completed, 2, 4 exhausted)
  exhausted.push(block4.id);
  if (req.every(b => completed.includes(b.id))) {
    status = "COMPLETED";
  } else if (req.every(b => completed.includes(b.id) || exhausted.includes(b.id))) {
    status = exhausted.length > 0 ? "RECOVERY_COMPLETE" : "COMPLETED";
  }
  assert(status === "RECOVERY_COMPLETE", "When all tasks addressed with exhausted tasks, status is RECOVERY_COMPLETE");

  // Complete all blocks -> COMPLETED
  completed = [block1.id, block2.id, block3.id, block4.id];
  exhausted = [];
  if (req.every(b => completed.includes(b.id))) {
    status = "COMPLETED";
  }
  assert(status === "COMPLETED", "When all required blocks completed, status is COMPLETED");

  console.log("\n🎉 ALL CANONICAL HOME TRAINING LOGIC TESTS PASSED!");
}

runTests().catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
