import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { handlers } from "../handlers";
import { DEMO_JWT } from "../db";
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_SHARE_TOKEN } from "../seed";

const server = setupServer(...handlers);

const BASE = "http://localhost/api";
const auth = { Authorization: `Bearer ${DEMO_JWT}` };
const json = { "Content-Type": "application/json", ...auth };

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

// Each test starts from a freshly seeded store.
beforeEach(() => localStorage.clear());

const get = (path: string, headers: HeadersInit = auth) => fetch(`${BASE}${path}`, { headers });

const send = (method: string, path: string, body?: unknown) =>
   fetch(`${BASE}${path}`, {
      method,
      headers: body === undefined ? auth : json,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
   });

describe("auth", () => {
   it("rejects protected endpoints without a token", async () => {
      const res = await fetch(`${BASE}/checkins`);
      expect(res.status).toBe(401);
   });

   it("rejects a login with the wrong password", async () => {
      const res = await send("POST", "/account/login", {
         email: DEMO_EMAIL,
         password: "wrong",
      });
      expect(res.status).toBe(401);
   });

   it("accepts the seeded demo credentials", async () => {
      const res = await send("POST", "/account/login", {
         email: DEMO_EMAIL,
         password: DEMO_PASSWORD,
      });

      expect(res.status).toBe(200);
      const user = (await res.json()) as UserDto;
      expect(user.token).toBe(DEMO_JWT);
      expect(user.email).toBe(DEMO_EMAIL);
   });

   it("rebinds the demo account on register so the new details work", async () => {
      await send("POST", "/account/register", {
         username: "Ada",
         email: "ada@example.com",
         password: "Str0ng!pass",
      });

      const res = await send("POST", "/account/login", {
         email: "ada@example.com",
         password: "Str0ng!pass",
      });

      expect(res.status).toBe(200);
      expect(((await res.json()) as UserDto).username).toBe("Ada");
   });

   it("rejects a password change when the current password is wrong", async () => {
      const res = await send("POST", "/account/change-password", {
         currentPassword: "nope",
         newPassword: "Str0ng!pass",
      });
      expect(res.status).toBe(400);
   });
});

describe("check-ins", () => {
   it("returns seeded history newest first", async () => {
      const checkIns = (await (await get("/checkins")).json()) as CheckIn[];

      expect(checkIns.length).toBeGreaterThan(50);
      const dates = checkIns.map((c) => c.date);
      expect([...dates].sort((a, b) => b.localeCompare(a))).toEqual(dates);
   });

   it("persists a created check-in so it appears in the list", async () => {
      const created = (await (
         await send("POST", "/checkins", {
            date: "2020-01-01",
            mood: 5,
            pain: 4,
            fatigue: 3,
            nausea: 2,
            notes: "hello",
         })
      ).json()) as CheckIn;

      expect(created.id).toBeTruthy();

      const checkIns = (await (await get("/checkins")).json()) as CheckIn[];
      expect(checkIns.find((c) => c.id === created.id)?.notes).toBe("hello");
   });

   it("rejects a second check-in on the same date", async () => {
      const body = { date: "2020-01-02", mood: 5, pain: 5, fatigue: 5, nausea: 5 };
      expect((await send("POST", "/checkins", body)).status).toBe(200);
      expect((await send("POST", "/checkins", body)).status).toBe(400);
   });

   it("applies an update and a delete", async () => {
      const created = (await (
         await send("POST", "/checkins", {
            date: "2020-01-03",
            mood: 5,
            pain: 5,
            fatigue: 5,
            nausea: 5,
         })
      ).json()) as CheckIn;

      const updated = (await (
         await send("PUT", `/checkins/${created.id}`, {
            date: "2020-01-03",
            mood: 9,
            pain: 1,
            fatigue: 1,
            nausea: 1,
         })
      ).json()) as CheckIn;
      expect(updated.mood).toBe(9);

      expect((await send("DELETE", `/checkins/${created.id}`)).status).toBe(204);
      expect((await get(`/checkins/${created.id}`)).status).toBe(404);
   });
});

describe("questions", () => {
   it("does not treat /suggestions as an id", async () => {
      const res = await get("/questions/suggestions");
      expect(res.status).toBe(200);

      const suggestions = (await res.json()) as string[];
      expect(suggestions.length).toBeGreaterThan(0);
   });

   it("creates, marks asked, and deletes", async () => {
      const id = await (await send("POST", "/questions", { text: "Is this ok?" })).text();
      expect(id).toBeTruthy();

      expect((await send("PATCH", `/questions/${id}/mark-asked`)).status).toBe(204);

      let questions = (await (await get("/questions")).json()) as QuestionDto[];
      expect(questions.find((q) => q.id === id)?.isAsked).toBe(true);

      expect((await send("DELETE", `/questions/${id}`)).status).toBe(204);
      questions = (await (await get("/questions")).json()) as QuestionDto[];
      expect(questions.find((q) => q.id === id)).toBeUndefined();
   });
});

describe("medications and adherence", () => {
   it("cascades adherence rows when a medication is deleted", async () => {
      const meds = (await (await get("/medications")).json()) as Medication[];
      const target = meds.find((m) => m.isActive)!;
      const date = new Date().toISOString().split("T")[0];

      await send("POST", "/medication-adherence", { medicationId: target.id, date });

      let taken = (await (await get(`/medication-adherence?date=${date}`)).json()) as string[];
      expect(taken).toContain(target.id);

      await send("DELETE", `/medications/${target.id}`);

      taken = (await (await get(`/medication-adherence?date=${date}`)).json()) as string[];
      expect(taken).not.toContain(target.id);
   });

   it("marks and unmarks a dose idempotently", async () => {
      const meds = (await (await get("/medications")).json()) as Medication[];
      const id = meds[0].id;
      const date = "2020-02-02";

      await send("POST", "/medication-adherence", { medicationId: id, date });
      await send("POST", "/medication-adherence", { medicationId: id, date });

      let taken = (await (await get(`/medication-adherence?date=${date}`)).json()) as string[];
      expect(taken.filter((x) => x === id)).toHaveLength(1);

      await send("DELETE", `/medication-adherence/${id}?date=${date}`);
      taken = (await (await get(`/medication-adherence?date=${date}`)).json()) as string[];
      expect(taken).not.toContain(id);
   });

   it("reports adherence never exceeding scheduled days", async () => {
      const summary = (await (
         await get("/medication-adherence/summary?days=30")
      ).json()) as AdherenceSummary[];

      expect(summary.length).toBeGreaterThan(0);
      for (const row of summary) {
         expect(row.scheduledDays).toBeGreaterThan(0);
         expect(row.takenDays).toBeLessThanOrEqual(row.scheduledDays);
      }
   });
});

describe("sharing", () => {
   it("serves the seeded public view without a token", async () => {
      const res = await fetch(`${BASE}/sharing/view/${DEMO_SHARE_TOKEN}`);
      expect(res.status).toBe(200);

      const view = (await res.json()) as SharedView;
      expect(view.checkIns.length).toBeGreaterThan(0);
      expect(view.averages?.mood).toBeGreaterThan(0);
      expect(view.latestDate).toBe(view.checkIns[0].date);
   });

   it("404s a revoked link", async () => {
      const res = await fetch(`${BASE}/sharing/view/expired-demo-link`);
      expect(res.status).toBe(404);
   });

   it("routes DELETE /sharing/revoked to the bulk handler, not /sharing/:id", async () => {
      expect((await send("DELETE", "/sharing/revoked")).status).toBe(204);

      const links = (await (await get("/sharing")).json()) as ShareLink[];
      expect(links.every((l) => !l.isRevoked)).toBe(true);
      // The active link must survive — proof the :id handler didn't catch it.
      expect(links.some((l) => l.token === DEMO_SHARE_TOKEN)).toBe(true);
   });

   it("revokes a link by id", async () => {
      const created = (await (
         await send("POST", "/sharing", { label: "Test" })
      ).json()) as ShareLink;

      await send("DELETE", `/sharing/${created.id}`);

      const links = (await (await get("/sharing")).json()) as ShareLink[];
      expect(links.find((l) => l.id === created.id)?.isRevoked).toBe(true);
   });
});

describe("tours and settings", () => {
   it("marks a page toured idempotently and resets", async () => {
      await send("POST", "/account/tours/checkin");
      await send("POST", "/account/tours/checkin");

      let user = (await (await get("/account")).json()) as UserDto;
      expect(user.touredPages).toEqual(["checkin"]);

      await send("DELETE", "/account/tours");
      user = (await (await get("/account")).json()) as UserDto;
      expect(user.touredPages).toEqual([]);
   });

   it("persists the reminder toggle", async () => {
      const res = await send("PATCH", "/account/settings", { reminderEnabled: false });
      expect(((await res.json()) as UserDto).reminderEnabled).toBe(false);

      const user = (await (await get("/account")).json()) as UserDto;
      expect(user.reminderEnabled).toBe(false);
   });
});
