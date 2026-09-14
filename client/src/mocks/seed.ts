/**
 * Deterministic seed data for demo mode.
 *
 * Everything here is generated from a fixed PRNG seed so that every visitor
 * sees the same history. That keeps screenshots stable and means a bug report
 * ("the March 3rd entry looks wrong") is reproducible.
 *
 * Dates are generated relative to *today*, so the demo never looks stale.
 */

// Re-exported so the mocks have a single import site, but defined in lib/demo
// where the UI can reach them without pulling MSW into the bundle.
export { DEMO_EMAIL, DEMO_PASSWORD, DEMO_SHARE_TOKEN } from "@/lib/demo";
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_SHARE_TOKEN } from "@/lib/demo";

const HISTORY_DAYS = 90;
const ADHERENCE_DAYS = 30;

export type DemoUser = {
   username: string;
   email: string;
   password: string;
   reminderEnabled: boolean;
   touredPages: string[];
};

export type DemoAdherence = {
   medicationId: string;
   date: string;
};

export type DemoDb = {
   user: DemoUser;
   checkIns: CheckIn[];
   questions: QuestionDto[];
   medications: Medication[];
   adherence: DemoAdherence[];
   shareLinks: ShareLink[];
};

/** mulberry32 — small, fast, deterministic. Good enough for plausible-looking data. */
function makeRng(seed: number) {
   let a = seed;
   return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
   };
}

const toIsoDate = (d: Date) => d.toISOString().split("T")[0];

function daysAgo(n: number): Date {
   const d = new Date();
   d.setHours(12, 0, 0, 0); // midday avoids DST edges shifting the date string
   d.setDate(d.getDate() - n);
   return d;
}

/**
 * Interpolates from `start` to `end` across the period, with noise.
 * `t` runs 0 (oldest) → 1 (today).
 */
function trend(start: number, end: number, t: number, noise: number, rng: () => number) {
   const base = start + (end - start) * t;
   const jitter = (rng() - 0.5) * 2 * noise;
   return Math.max(1, Math.min(10, Math.round(base + jitter)));
}

const NOTES = [
   "Slept right through for the first time in a while.",
   "Nausea eased about an hour after the anti-sickness tablet.",
   "Short walk around the block — glad I went.",
   "Tired, but managed a full meal today.",
   "Rough start, much better by the afternoon.",
   "Bloods were stable at today's appointment.",
   "Headache for most of the day. Kept the curtains shut.",
   "Good energy — got out into the garden.",
   "Appetite is slowly coming back.",
   "Needed an afternoon nap, felt human afterwards.",
   "Pins and needles in my fingertips again.",
   "Quiet day. Read a bit, watched the birds.",
];

function buildCheckIns(rng: () => number): CheckIn[] {
   const checkIns: CheckIn[] = [];
   let weight = 61.4;

   for (let i = HISTORY_DAYS - 1; i >= 0; i--) {
      // Occasional gaps — nobody logs every single day.
      if (rng() < 0.14) continue;

      const t = (HISTORY_DAYS - 1 - i) / (HISTORY_DAYS - 1);
      const date = toIsoDate(daysAgo(i));

      // A gentle recovery arc: mood up, symptoms down.
      const mood = trend(4, 7, t, 1.4, rng);
      const pain = trend(7, 3, t, 1.5, rng);
      const fatigue = trend(8, 4, t, 1.3, rng);
      const nausea = trend(6, 2, t, 1.6, rng);

      weight = Math.min(66, weight + (rng() - 0.32) * 0.22);

      checkIns.push({
         id: `checkin-${date}`,
         date,
         mood,
         pain,
         fatigue,
         nausea,
         ...(rng() < 0.42 ? { weight: Math.round(weight * 10) / 10 } : {}),
         ...(rng() < 0.22 ? { notes: NOTES[Math.floor(rng() * NOTES.length)] } : {}),
      });
   }

   // Newest first — matches the backend's OrderByDescending(x => x.Date).
   return checkIns.reverse();
}

const MEDICATIONS: Medication[] = [
   {
      id: "med-ondansetron",
      name: "Ondansetron",
      dosage: "8 mg",
      targetSymptom: "nausea",
      isActive: true,
      schedules: [0, 1, 2, 3, 4, 5, 6].flatMap((dayOfWeek) => [
         { dayOfWeek, time: "08:00" },
         { dayOfWeek, time: "20:00" },
      ]),
   },
   {
      id: "med-paracetamol",
      name: "Paracetamol",
      dosage: "1 g",
      targetSymptom: "pain",
      isActive: true,
      schedules: [0, 1, 2, 3, 4, 5, 6].flatMap((dayOfWeek) => [
         { dayOfWeek, time: "08:00" },
         { dayOfWeek, time: "14:00" },
         { dayOfWeek, time: "22:00" },
      ]),
   },
   {
      id: "med-lansoprazole",
      name: "Lansoprazole",
      dosage: "30 mg",
      isActive: true,
      schedules: [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({ dayOfWeek, time: "07:30" })),
   },
   {
      id: "med-filgrastim",
      name: "Filgrastim",
      dosage: "300 mcg",
      targetSymptom: "fatigue",
      isActive: true,
      // Only on treatment days — exercises the day-of-week filtering on CheckIn.
      schedules: [
         { dayOfWeek: 1, time: "09:00" },
         { dayOfWeek: 4, time: "09:00" },
      ],
   },
   {
      id: "med-zopiclone",
      name: "Zopiclone",
      dosage: "3.75 mg",
      isActive: false, // shows the inactive state on the Medications list
      schedules: [{ dayOfWeek: 0, time: "22:30" }],
   },
];

function buildAdherence(rng: () => number): DemoAdherence[] {
   const rows: DemoAdherence[] = [];

   for (let i = ADHERENCE_DAYS - 1; i >= 0; i--) {
      const day = daysAgo(i);
      const date = toIsoDate(day);
      const dow = day.getDay();

      for (const med of MEDICATIONS) {
         if (!med.isActive) continue;
         if (!med.schedules.some((s) => s.dayOfWeek === dow)) continue;
         // Good but imperfect adherence — a perfect 100% looks fake.
         if (rng() < 0.83) rows.push({ medicationId: med.id, date });
      }
   }

   return rows;
}

function buildQuestions(): QuestionDto[] {
   const q = (id: string, text: string, isAsked: boolean, agoDays: number): QuestionDto => ({
      id,
      text,
      isAsked,
      createdAt: daysAgo(agoDays).toISOString(),
   });

   return [
      q("q-1", "Is the new anti-sickness medication safe to take alongside the painkillers?", false, 2),
      q("q-2", "Should I be worried about the pins and needles in my fingertips?", false, 5),
      q("q-3", "How long should the fatigue last after this cycle finishes?", false, 9),
      q("q-4", "Can I travel abroad between treatment cycles?", true, 21),
      q("q-5", "What should I do if my temperature goes above 37.5°C?", true, 34),
   ];
}

function buildShareLinks(): ShareLink[] {
   return [
      {
         id: "share-1",
         token: DEMO_SHARE_TOKEN,
         label: "Dr. Whitfield (oncology)",
         createdAt: daysAgo(24).toISOString(),
         isRevoked: false,
         lastViewedAt: daysAgo(3).toISOString(),
      },
      {
         id: "share-2",
         token: "expired-demo-link",
         label: "Mum",
         createdAt: daysAgo(60).toISOString(),
         isRevoked: true,
      },
   ];
}

export function buildSeedDb(): DemoDb {
   const rng = makeRng(20260914);

   return {
      user: {
         username: "Demo User",
         email: DEMO_EMAIL,
         password: DEMO_PASSWORD,
         reminderEnabled: true,
         touredPages: [],
      },
      checkIns: buildCheckIns(rng),
      questions: buildQuestions(),
      medications: MEDICATIONS.map((m) => ({ ...m, schedules: [...m.schedules] })),
      adherence: buildAdherence(rng),
      shareLinks: buildShareLinks(),
   };
}
