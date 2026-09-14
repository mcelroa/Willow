/**
 * Demo-mode constants and flag.
 *
 * Kept separate from `src/mocks/` on purpose: UI code needs the flag and the
 * demo credentials, but importing them from the mocks would drag MSW and the
 * seed generator into the normal production bundle. Nothing here pulls in
 * either, so a non-demo build tree-shakes it down to a `false` check.
 */

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

export const DEMO_EMAIL = "demo@willow-health.pro";
export const DEMO_PASSWORD = "Demo123!";

/** Seeded share link, so /share/demo always resolves for a first-time visitor. */
export const DEMO_SHARE_TOKEN = "demo";

/** Wipes the demo store and reloads. Dynamically imported so mocks stay out of prod builds. */
export async function resetDemoData() {
   const { resetDb } = await import("@/mocks/db");
   resetDb();
   window.location.reload();
}
