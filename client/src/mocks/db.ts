/**
 * localStorage-backed store for demo mode.
 *
 * The MSW handlers read and write through here, so mutations behave like a real
 * API: create a check-in and it shows up in History, survives a refresh, and
 * feeds into Trends. Everything lives in one versioned JSON blob.
 *
 * Why versioned: when the seed shape changes, a stored blob from an older build
 * would be missing fields and crash the UI on load. Bumping SCHEMA_VERSION
 * discards stale data and reseeds instead of failing.
 */

import { buildSeedDb, type DemoDb } from "./seed";

const STORAGE_KEY = "willow:demo";
const SCHEMA_VERSION = 1;

/** The fake bearer token handed out on login. */
export const DEMO_JWT = "demo-token";

type Envelope = { version: number; data: DemoDb };

/**
 * Fallback for when localStorage is unavailable (Safari private mode, blocked
 * third-party storage). The demo still works fully — it just won't persist.
 */
let memoryFallback: DemoDb | null = null;
let usingFallback = false;

function readStorage(): DemoDb | null {
   if (usingFallback) return memoryFallback;

   try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as Envelope;
      if (parsed?.version !== SCHEMA_VERSION || !parsed.data) return null;

      return parsed.data;
   } catch {
      // Corrupt JSON or storage disabled — treat as empty and reseed.
      return null;
   }
}

function writeStorage(data: DemoDb) {
   memoryFallback = data;

   if (usingFallback) return;

   try {
      const envelope: Envelope = { version: SCHEMA_VERSION, data };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
   } catch {
      // Quota exceeded or storage blocked — degrade to in-memory for this session.
      usingFallback = true;
   }
}

export function loadDb(): DemoDb {
   const existing = readStorage();
   if (existing) return existing;

   const seeded = buildSeedDb();
   writeStorage(seeded);
   return seeded;
}

/** Applies a mutation and persists the result. Returns whatever the mutator returns. */
export function update<T>(mutator: (db: DemoDb) => T): T {
   const db = loadDb();
   const result = mutator(db);
   writeStorage(db);
   return result;
}

/** Wipes stored data and rebuilds from the seed. Backs the "Reset demo data" button. */
export function resetDb(): DemoDb {
   const seeded = buildSeedDb();
   writeStorage(seeded);
   return seeded;
}

export function newId(): string {
   return crypto.randomUUID();
}

/** Shapes the stored user into the DTO the API returns. */
export function toUserDto(db: DemoDb): UserDto {
   return {
      username: db.user.username,
      email: db.user.email,
      token: DEMO_JWT,
      reminderEnabled: db.user.reminderEnabled,
      touredPages: [...db.user.touredPages],
   };
}
