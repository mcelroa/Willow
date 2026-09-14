/**
 * MSW request handlers — the demo-mode "backend".
 *
 * One handler per entry in `lib/api/agent.ts`. Reads and writes go through
 * `db.ts`, so mutations persist and feed back into every other screen.
 *
 * Handler order matters: MSW matches in registration order, so literal paths
 * must be registered before the parameterised ones they'd otherwise collide
 * with (e.g. DELETE /sharing/revoked before DELETE /sharing/:id).
 */

import { http, HttpResponse, delay } from "msw";
import { DEMO_JWT, loadDb, newId, resetDb, toUserDto, update } from "./db";
import { buildDemoPdf } from "./pdf";

/** Small latency so loading states actually render instead of flashing. */
const LATENCY = 140;

const noContent = () => new HttpResponse(null, { status: 204 });

/** Mirrors the API's `[Authorize]` attribute. Returns a 401 response, or null when authorised. */
function unauthorised(request: Request): Response | null {
   const header = request.headers.get("Authorization");
   if (header === `Bearer ${DEMO_JWT}`) return null;
   return HttpResponse.json({ message: "Unauthorised" }, { status: 401 });
}

const toIsoDate = (d: Date) => d.toISOString().split("T")[0];

function averages(checkIns: CheckIn[]): MetricAverages | undefined {
   if (checkIns.length === 0) return undefined;
   const mean = (key: "mood" | "pain" | "fatigue" | "nausea") =>
      Math.round((checkIns.reduce((s, c) => s + c[key], 0) / checkIns.length) * 10) / 10;

   return {
      mood: mean("mood"),
      pain: mean("pain"),
      fatigue: mean("fatigue"),
      nausea: mean("nausea"),
   };
}

const byDateDesc = (a: CheckIn, b: CheckIn) => b.date.localeCompare(a.date);

// ---------------------------------------------------------------- account

const accountHandlers = [
   http.post("*/api/account/login", async ({ request }) => {
      await delay(LATENCY);
      const { email, password } = (await request.json()) as LoginDto;
      const db = loadDb();

      // Checked properly rather than waved through, so the error path is
      // demonstrable — the login form is prefilled with the demo credentials.
      const matches =
         email.trim().toLowerCase() === db.user.email.toLowerCase() &&
         password === db.user.password;

      if (!matches) {
         return HttpResponse.json({ message: "Invalid email or password" }, { status: 401 });
      }

      return HttpResponse.json(toUserDto(db));
   }),

   http.post("*/api/account/register", async ({ request }) => {
      await delay(LATENCY);
      const { username, email, password } = (await request.json()) as RegisterDto;

      // There's only ever one demo account — registering rebinds it to the
      // details just entered, so the visitor can sign in with their own.
      update((db) => {
         db.user.username = username;
         db.user.email = email;
         db.user.password = password;
      });

      return noContent();
   }),

   http.get("*/api/account", async ({ request }) => {
      await delay(LATENCY);
      const denied = unauthorised(request);
      if (denied) return denied;

      return HttpResponse.json(toUserDto(loadDb()));
   }),

   // No mailbox in demo mode — these succeed so the flows aren't dead ends.
   http.post("*/api/account/forgot-password", async () => {
      await delay(LATENCY);
      return noContent();
   }),

   http.post("*/api/account/reset-password", async ({ request }) => {
      await delay(LATENCY);
      const { newPassword } = (await request.json()) as { newPassword: string };
      update((db) => {
         db.user.password = newPassword;
      });
      return noContent();
   }),

   http.get("*/api/account/verify-email", async () => {
      await delay(LATENCY);
      return noContent();
   }),

   http.post("*/api/account/change-password", async ({ request }) => {
      await delay(LATENCY);
      const denied = unauthorised(request);
      if (denied) return denied;

      const { currentPassword, newPassword } = (await request.json()) as {
         currentPassword: string;
         newPassword: string;
      };

      const ok = update((db) => {
         if (db.user.password !== currentPassword) return false;
         db.user.password = newPassword;
         return true;
      });

      if (!ok) {
         return HttpResponse.json({ message: "Current password is incorrect" }, { status: 400 });
      }
      return noContent();
   }),

   http.delete("*/api/account", async ({ request }) => {
      await delay(LATENCY);
      const denied = unauthorised(request);
      if (denied) return denied;

      // Nothing to really delete — wipe back to the seed so the demo stays usable.
      resetDb();
      return noContent();
   }),

   http.patch("*/api/account/settings", async ({ request }) => {
      await delay(LATENCY);
      const denied = unauthorised(request);
      if (denied) return denied;

      const { reminderEnabled } = (await request.json()) as { reminderEnabled: boolean };
      const dto = update((db) => {
         db.user.reminderEnabled = reminderEnabled;
         return toUserDto(db);
      });

      return HttpResponse.json(dto);
   }),

   http.delete("*/api/account/tours", async ({ request }) => {
      const denied = unauthorised(request);
      if (denied) return denied;

      update((db) => {
         db.user.touredPages = [];
      });
      return noContent();
   }),

   http.post("*/api/account/tours/:page", async ({ request, params }) => {
      const denied = unauthorised(request);
      if (denied) return denied;

      const page = String(params.page);
      update((db) => {
         if (!db.user.touredPages.includes(page)) db.user.touredPages.push(page);
      });
      return noContent();
   }),
];

// ---------------------------------------------------------------- check-ins

const checkInHandlers = [
   http.get("*/api/checkins", async ({ request }) => {
      await delay(LATENCY);
      const denied = unauthorised(request);
      if (denied) return denied;

      return HttpResponse.json([...loadDb().checkIns].sort(byDateDesc));
   }),

   http.post("*/api/checkins", async ({ request }) => {
      await delay(LATENCY);
      const denied = unauthorised(request);
      if (denied) return denied;

      const dto = (await request.json()) as SaveCheckInDto;

      const result = update((db) => {
         if (db.checkIns.some((c) => c.date === dto.date)) return null;
         const created: CheckIn = { id: newId(), ...dto };
         db.checkIns.push(created);
         return created;
      });

      if (!result) {
         return HttpResponse.json(
            { message: "A check-in already exists for that date" },
            { status: 400 },
         );
      }
      return HttpResponse.json(result);
   }),

   http.get("*/api/checkins/:id", async ({ request, params }) => {
      await delay(LATENCY);
      const denied = unauthorised(request);
      if (denied) return denied;

      const found = loadDb().checkIns.find((c) => c.id === params.id);
      return found ? HttpResponse.json(found) : new HttpResponse(null, { status: 404 });
   }),

   http.put("*/api/checkins/:id", async ({ request, params }) => {
      await delay(LATENCY);
      const denied = unauthorised(request);
      if (denied) return denied;

      const dto = (await request.json()) as SaveCheckInDto;

      const updated = update((db) => {
         const target = db.checkIns.find((c) => c.id === params.id);
         if (!target) return null;
         Object.assign(target, dto);
         return target;
      });

      return updated ? HttpResponse.json(updated) : new HttpResponse(null, { status: 404 });
   }),

   http.delete("*/api/checkins/:id", async ({ request, params }) => {
      await delay(LATENCY);
      const denied = unauthorised(request);
      if (denied) return denied;

      update((db) => {
         db.checkIns = db.checkIns.filter((c) => c.id !== params.id);
      });
      return noContent();
   }),
];

// ---------------------------------------------------------------- questions

const SUGGESTIONS = [
   "My fatigue scores have stayed above 6 for the past fortnight - is that expected at this point in the cycle?",
   "The pins and needles in my fingertips are becoming more frequent. Should this be reviewed before the next cycle?",
   "My nausea is well controlled in the mornings but worse at night. Could the Ondansetron timing be adjusted?",
   "My weight has risen by about 3 kg over the last month. Is that a normal part of recovery?",
   "On days when pain scores hit 7 or higher, is it safe to take an extra dose of paracetamol?",
];

const questionHandlers = [
   // Registered before /questions/:id so "suggestions" isn't matched as an id.
   http.get("*/api/questions/suggestions", async ({ request }) => {
      const denied = unauthorised(request);
      if (denied) return denied;

      // Longer pause — the real endpoint calls out to Claude, and the UI has a
      // loading state worth showing off.
      await delay(900);
      return HttpResponse.json(SUGGESTIONS);
   }),

   http.get("*/api/questions", async ({ request }) => {
      await delay(LATENCY);
      const denied = unauthorised(request);
      if (denied) return denied;

      const questions = [...loadDb().questions].sort((a, b) =>
         b.createdAt.localeCompare(a.createdAt),
      );
      return HttpResponse.json(questions);
   }),

   http.post("*/api/questions", async ({ request }) => {
      await delay(LATENCY);
      const denied = unauthorised(request);
      if (denied) return denied;

      const { text } = (await request.json()) as CreateQuestionDto;

      const id = update((db) => {
         const created: QuestionDto = {
            id: newId(),
            text,
            isAsked: false,
            createdAt: new Date().toISOString(),
         };
         db.questions.push(created);
         return created.id;
      });

      // The real controller returns Ok(string) — text/plain, not JSON.
      return HttpResponse.text(id);
   }),

   http.patch("*/api/questions/:id/mark-asked", async ({ request, params }) => {
      await delay(LATENCY);
      const denied = unauthorised(request);
      if (denied) return denied;

      update((db) => {
         const q = db.questions.find((x) => x.id === params.id);
         if (q) q.isAsked = true;
      });
      return noContent();
   }),

   http.delete("*/api/questions/:id", async ({ request, params }) => {
      await delay(LATENCY);
      const denied = unauthorised(request);
      if (denied) return denied;

      update((db) => {
         db.questions = db.questions.filter((q) => q.id !== params.id);
      });
      return noContent();
   }),
];

// ---------------------------------------------------------------- export

const exportHandlers = [
   http.get("*/api/export/pdf", async ({ request }) => {
      await delay(400);
      const denied = unauthorised(request);
      if (denied) return denied;

      return new HttpResponse(buildDemoPdf(loadDb()), {
         headers: { "Content-Type": "application/pdf" },
      });
   }),
];

// ---------------------------------------------------------------- medications

const medicationHandlers = [
   http.get("*/api/medications", async ({ request }) => {
      await delay(LATENCY);
      const denied = unauthorised(request);
      if (denied) return denied;

      return HttpResponse.json(loadDb().medications);
   }),

   http.post("*/api/medications", async ({ request }) => {
      await delay(LATENCY);
      const denied = unauthorised(request);
      if (denied) return denied;

      const dto = (await request.json()) as SaveMedicationDto;
      const created = update((db) => {
         const med: Medication = { id: newId(), ...dto };
         db.medications.push(med);
         return med;
      });

      return HttpResponse.json(created);
   }),

   http.put("*/api/medications/:id", async ({ request, params }) => {
      await delay(LATENCY);
      const denied = unauthorised(request);
      if (denied) return denied;

      const dto = (await request.json()) as SaveMedicationDto;
      const updated = update((db) => {
         const med = db.medications.find((m) => m.id === params.id);
         if (!med) return null;
         Object.assign(med, dto);
         return med;
      });

      return updated ? HttpResponse.json(updated) : new HttpResponse(null, { status: 404 });
   }),

   http.delete("*/api/medications/:id", async ({ request, params }) => {
      await delay(LATENCY);
      const denied = unauthorised(request);
      if (denied) return denied;

      update((db) => {
         db.medications = db.medications.filter((m) => m.id !== params.id);
         // Mirrors the cascade delete on Medication -> MedicationAdherence.
         db.adherence = db.adherence.filter((a) => a.medicationId !== params.id);
      });
      return noContent();
   }),
];

// ---------------------------------------------------------------- adherence

const adherenceHandlers = [
   http.get("*/api/medication-adherence/summary", async ({ request }) => {
      await delay(LATENCY);
      const denied = unauthorised(request);
      if (denied) return denied;

      const days = Number(new URL(request.url).searchParams.get("days") ?? 30);
      const db = loadDb();

      // Walk the window once, counting scheduled days per medication.
      const scheduled = new Map<string, number>();
      for (let i = 0; i < days; i++) {
         const d = new Date();
         d.setHours(12, 0, 0, 0);
         d.setDate(d.getDate() - i);
         const dow = d.getDay();

         for (const med of db.medications) {
            if (!med.isActive) continue;
            if (!med.schedules.some((s) => s.dayOfWeek === dow)) continue;
            scheduled.set(med.id, (scheduled.get(med.id) ?? 0) + 1);
         }
      }

      const earliest = new Date();
      earliest.setHours(12, 0, 0, 0);
      earliest.setDate(earliest.getDate() - (days - 1));
      const cutoff = toIsoDate(earliest);

      const summary: AdherenceSummary[] = db.medications
         .filter((m) => m.isActive)
         .map((m) => ({
            medicationId: m.id,
            takenDays: db.adherence.filter(
               (a) => a.medicationId === m.id && a.date >= cutoff,
            ).length,
            scheduledDays: scheduled.get(m.id) ?? 0,
         }));

      return HttpResponse.json(summary);
   }),

   http.get("*/api/medication-adherence", async ({ request }) => {
      await delay(LATENCY);
      const denied = unauthorised(request);
      if (denied) return denied;

      const date = new URL(request.url).searchParams.get("date") ?? "";
      const taken = loadDb()
         .adherence.filter((a) => a.date === date)
         .map((a) => a.medicationId);

      return HttpResponse.json(taken);
   }),

   http.post("*/api/medication-adherence", async ({ request }) => {
      await delay(LATENCY);
      const denied = unauthorised(request);
      if (denied) return denied;

      const { medicationId, date } = (await request.json()) as {
         medicationId: string;
         date: string;
      };

      update((db) => {
         const exists = db.adherence.some(
            (a) => a.medicationId === medicationId && a.date === date,
         );
         if (!exists) db.adherence.push({ medicationId, date });
      });

      return noContent();
   }),

   http.delete("*/api/medication-adherence/:medicationId", async ({ request, params }) => {
      await delay(LATENCY);
      const denied = unauthorised(request);
      if (denied) return denied;

      const date = new URL(request.url).searchParams.get("date") ?? "";
      update((db) => {
         db.adherence = db.adherence.filter(
            (a) => !(a.medicationId === params.medicationId && a.date === date),
         );
      });

      return noContent();
   }),
];

// ---------------------------------------------------------------- sharing

const sharingHandlers = [
   // Anonymous, like the real [AllowAnonymous] endpoint.
   http.get("*/api/sharing/view/:token", async ({ params }) => {
      await delay(LATENCY);
      const db = loadDb();
      const link = db.shareLinks.find((l) => l.token === params.token);

      if (!link || link.isRevoked) return new HttpResponse(null, { status: 404 });
      if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
         return new HttpResponse(null, { status: 404 });
      }

      update((d) => {
         const stored = d.shareLinks.find((l) => l.token === params.token);
         if (stored) stored.lastViewedAt = new Date().toISOString();
      });

      const checkIns = [...db.checkIns].sort(byDateDesc);
      const view: SharedView = {
         ownerName: db.user.username,
         earliestDate: checkIns.at(-1)?.date,
         latestDate: checkIns[0]?.date,
         checkIns,
         pendingQuestions: db.questions.filter((q) => !q.isAsked),
         averages: averages(checkIns),
      };

      return HttpResponse.json(view);
   }),

   http.get("*/api/sharing", async ({ request }) => {
      await delay(LATENCY);
      const denied = unauthorised(request);
      if (denied) return denied;

      return HttpResponse.json(loadDb().shareLinks);
   }),

   http.post("*/api/sharing", async ({ request }) => {
      await delay(LATENCY);
      const denied = unauthorised(request);
      if (denied) return denied;

      const dto = (await request.json()) as CreateShareLinkDto;
      const created = update((db) => {
         const link: ShareLink = {
            id: newId(),
            // Stand-in for the server's 32-byte base64url token.
            token: newId().replace(/-/g, ""),
            label: dto.label,
            createdAt: new Date().toISOString(),
            expiresAt: dto.expiresAt,
            isRevoked: false,
         };
         db.shareLinks.push(link);
         return link;
      });

      return HttpResponse.json(created);
   }),

   // Must precede /sharing/:id — both are DELETE.
   http.delete("*/api/sharing/revoked", async ({ request }) => {
      await delay(LATENCY);
      const denied = unauthorised(request);
      if (denied) return denied;

      update((db) => {
         db.shareLinks = db.shareLinks.filter((l) => !l.isRevoked);
      });
      return noContent();
   }),

   http.delete("*/api/sharing/:id", async ({ request, params }) => {
      await delay(LATENCY);
      const denied = unauthorised(request);
      if (denied) return denied;

      update((db) => {
         const link = db.shareLinks.find((l) => l.id === params.id);
         if (link) link.isRevoked = true;
      });
      return noContent();
   }),
];

export const handlers = [
   ...accountHandlers,
   ...checkInHandlers,
   ...questionHandlers,
   ...exportHandlers,
   ...medicationHandlers,
   ...adherenceHandlers,
   ...sharingHandlers,
];
