# CLAUDE.md

## Commands

### Backend (.NET 10)
```bash
dotnet run --project API
dotnet build
dotnet ef migrations add <Name> -p Persistence -s API
dotnet ef database update -p Persistence -s API
dotnet ef migrations remove -p Persistence -s API
```

### Frontend (React + Vite) — run from `client/`
```bash
npm run dev         # https://localhost:3000 (needs the API running)
npm run dev:demo    # mocked backend — no API needed, see Demo mode below
npm run build
npm run build:demo  # what Vercel deploys
npm run lint
npm run test        # Vitest watch
npm run test:run    # Vitest single run (CI)
```

### Backend tests
```bash
dotnet test
dotnet test Tests.Unit
dotnet test Tests.Integration
dotnet test --filter "FullyQualifiedName~<ClassName>"
```

## Architecture

Cancer patient symptom tracker — daily check-ins (mood, pain, fatigue, nausea 1–10, optional weight in kg, optional free-text notes) + questions list for care team.

### Backend — 4 projects

**`Domain`** — plain C# entities: `CheckIn`, `AppUser`, `ShareLink`, `Medication`, `MedicationSchedule`, and `MedicationAdherence`. `AppUser` adds `ReminderEnabled` (bool) and `TouredPages` (string, comma-separated page names — exposed as `string[]` on `UserDto`). `Medication` has name, optional dosage, optional targetSymptom, isActive, and a collection of `MedicationSchedule` (dayOfWeek int + TimeOnly time). `MedicationAdherence` records one taken-dose row per (UserId, MedicationId, Date).

**`Persistence`** — EF Core + SQL Server. `AppDbContext` extends `IdentityDbContext<AppUser>`.

**`Application`** — all business logic. Key patterns:
- **CQRS via MediatR** — `Query`/`Command` + `Handler` in a single file per operation
- **`Result<T>`** — all handlers return `Result<T>`, never throw for expected failures
- **AutoMapper** — `Core/MappingProfiles.cs`. Use `ProjectTo<T>` in queries
- **FluentValidation** — `ValidationBehaviour<T>` runs validators automatically before every handler
- **EF Core concurrency** — never run multiple `ToListAsync` calls on the same `DbContext` concurrently (e.g. via `Task.WhenAll`). EF Core throws `InvalidOperationException`. Always await queries sequentially.
- **AI-suggested care team questions** — `Questions/Queries/GetQuestionSuggestions.Query` gathers the last 30 days of check-ins, active medications, and existing unasked questions, then calls `IAiService.GetQuestionSuggestionsAsync` (interface in `Application/Core/Interfaces`). `API/Services/ClaudeAiService.cs` implements it by calling the Anthropic Messages API directly over `HttpClient` (model `claude-haiku-4-5-20251001`), stripping markdown code fences before parsing the JSON array response. `GET /api/questions/suggestions` on `QuestionsController`.

**`API`** — ASP.NET Core host. Key points:
- `BaseApiController` provides `Mediator` and `HandleResult<T>()` — controllers are thin dispatchers
- `TokenService` generates JWTs with HMAC-SHA512 (`Jwt:Key` must be ≥ 64 chars)
- `AccountController` handles all account operations — most endpoints `[AllowAnonymous]`; data endpoints use `[Authorize]`
- Tour endpoints on `AccountController`: `POST /api/account/tours/{page}` (mark page toured, idempotent), `DELETE /api/account/tours` (reset all tours) — inline, no MediatR
- `ResendEmailService` sends password reset and email verification emails via Resend HTTP API
- Exception middleware catches `ValidationException` → structured `400`
- Rate limiting via built-in `AddRateLimiter`: `"auth"` policy (5 req/15 min) on login/register/reset-password, `"auth-strict"` (3 req/hr) on forgot-password, `"public-read"` (30 req/min) on the anonymous share-view endpoint. All disabled in the `Testing` environment.
- `UseForwardedHeaders` runs **first** in the pipeline — behind the ALB the connection IP is the load balancer's, so the real client IP is restored from `X-Forwarded-For` (trusted only from the VPC CIDR `172.31.0.0/16`, default `ForwardLimit=1` so client-spoofed values are ignored). Rate limiting depends on this — don't reorder.
- `GET /health` — anonymous 200, used by the ALB target group health check. Don't remove or rename without updating the target group.

### Authentication
JWT stored in `localStorage` under `"jwt"`. Axios interceptor in `agent.ts` attaches it to every request. A response interceptor catches 401s **that had a token attached** (expired/revoked), clears localStorage, and redirects to `/login`. On app load `useAccount` calls `GET /api/account` to rehydrate the current user — this returns 401 if the account's email is not verified.

### Frontend — React 19 + Vite (`client/`)
- **React Router v7** — `src/app/AppRouter.tsx`
- **TanStack React Query** — all server state
- **React Hook Form + Zod** — schemas in `src/lib/schemas/`
- **axios** — `src/lib/api/agent.ts` with Bearer interceptor
- **shadcn/ui + Tailwind CSS v4**
- **Range inputs** — `Input` strips box-model classes when `type="range"`; track + thumb styled via pseudo-elements in `index.css`. Pass `style={{ "--range-fill": `${(value - 1) / 9 * 100}%` } as React.CSSProperties}` to get the primary-colored fill up to the thumb position.
- **Fonts** — Figtree (body), JetBrains Mono (mono), Inter, Geist loaded via `@fontsource-variable/`. Lora (serif, display headings on landing page) loaded via Google Fonts CDN in `index.html`.

### UI design system

The app uses a **structured clinical** design language established on the check-in pages. Apply these patterns consistently across all pages:

- **Page container** — `max-w-xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-5` (use `max-w-2xl` for data-heavy pages like History/Trends)
- **Custom page headers** — For pages where context matters (e.g. showing today's date on CheckIn), use a two-line header instead of `PageHeader`: a small-caps dateline above a bold `h1`. Use `PageHeader` for generic list/settings pages.
- **Sectioned form containers** — Group form fields into a single `rounded-2xl border bg-card overflow-hidden divide-y` block. Each section gets `px-6 py-5` padding. Never wrap forms in a generic `<Card>`.
- **Section labels** — `text-xs font-semibold tracking-widest uppercase text-muted-foreground` above each group of fields. Optional detail (e.g. "optional, kg") goes inline as `<span className="normal-case font-normal tracking-normal">`.
- **Symptom slider rows** — Horizontal layout: `label (w-16 shrink-0) | flex-1 slider | value (w-6 text-right font-bold tabular-nums)`. Score numbers are neutral foreground — no semantic color coding (green/red) since symptoms like mood and pain have opposite polarity.
- **Submit buttons** — Full-width `w-full h-11 font-semibold`, placed below the sectioned container with `mt-4`. Warnings (e.g. duplicate entry) go in a rounded amber box above the button.
- **History / list cards** — `rounded-2xl border bg-card overflow-hidden` with a `border-b` header row (`px-5 py-3.5`) for date + actions, a content area for metrics, and an optional `border-t` footer for notes/weight. The header is two-line: weekday in `text-xs font-semibold tracking-widest uppercase text-muted-foreground` above the full date in `font-semibold text-sm`.
- **Metric grids** — Use `grid grid-cols-4` with centered columns: small-caps label above a `text-2xl font-bold tabular-nums` score. Add a thin proportional fill bar beneath each score (`h-1 rounded-full bg-border` track with `bg-primary/50` fill at `width: (score/10)*100%`) to give instant visual weight to the number.
- **Trends stat cards** — `rounded-2xl border bg-card px-5 py-4` (no Card component). Each shows: small-caps metric label, large `text-3xl font-bold` average with `/ 10` suffix, then a row with an inline SVG sparkline (`text-muted-foreground/40`) on the left and a trend-direction icon (`TrendingUp` / `TrendingDown` / `Minus`) on the right. Trend is calculated by comparing the mean of the first half of the period against the second half (threshold ±0.5).
- **Trends chart** — Use `AreaChart` + `Area` from recharts (not `LineChart`/`Line`) for the symptoms chart. Set `fillOpacity={0.08}` on each area for subtle depth. Chart containers use the sectioned-container pattern (`rounded-2xl border bg-card overflow-hidden` with `border-b` header) — never a bare `Card` component.
- **Back navigation** — Small-caps link with `ArrowLeft` icon: `text-xs font-semibold tracking-widest uppercase text-muted-foreground hover:text-foreground`.
- **Auth pages** (Login, Register, ForgotPassword, ResetPassword, VerifyEmail) — standalone (no Layout wrapper). Shell: `flex min-h-screen items-center justify-center bg-background px-4 py-12` → `w-full max-w-sm flex flex-col gap-6`. Header: `WillowMark size={44}` + small-caps "Willow" dateline + bold `h1`. Form uses the sectioned container pattern. Success/error states reuse the same card shell with a dateline + title + body paragraph. Footer: `text-sm text-center text-muted-foreground` with an underlined link.
- **SharedView** (public /share/:token) — also standalone (no Layout wrapper). Uses the sectioned-container pattern with `border-b` headers. Uses `AreaChart` + `Area` (not `LineChart`/`Line`) with `fillOpacity={0.08}`. Metric averages use the 4-column metric grid with fill bars. WillowMark appears as `text-muted-foreground/30` watermark in the page header.
- **Generic list/feature cards** (Medications, Questions, Sharing active links) — `rounded-2xl border bg-card overflow-hidden` with a `border-b` header row (`px-5 py-3.5`) showing status/label dateline above name/title, and a body row for secondary info (schedule, meta). Actions (Edit/Delete, Copy/Revoke) sit in the header row or a separate `border-t` footer row.

### Folder structure
```
src/
  app/
    AppRouter.tsx
    layout/         # Layout.tsx, NavBar.tsx, RequireAuth.tsx
  features/
    account/        # Login, Register, ForgotPassword, ResetPassword, VerifyEmail, ChangePassword
    checkIn/        # CheckIn, EditCheckIn, History (paginated client-side, 5/page), Trends
    errors/         # NotFound.tsx (catch-all 404)
    export/         # Summary.tsx (stats + PDF export, includes avg weight card when readings exist)
    landing/        # LandingPage.tsx (standalone — no Layout wrapper; own nav + deep-green/cream design), PrivacyPolicy.tsx, landing.css (keyframe animations)
    medications/    # Medications.tsx (CRUD + schedule builder)
    question/       # Questions.tsx
    sharing/        # Sharing.tsx (management, behind auth), SharedView.tsx (public /share/:token)
  mocks/            # demo mode only — MSW handlers, localStorage store, seed data, PDF writer
  components/
    DemoBanner.tsx    # floating "Demo mode" notice + reset button; renders null outside demo mode
    PageHeader.tsx    # shared page header: title (text-2xl font-bold tracking-tight), optional description, optional action slot
    LoadingSpinner.tsx # centered Loader2 spinner for loading states
    EmptyState.tsx    # icon + title + optional description + optional action; used for empty lists/no-data states
    TourGuide.tsx     # react-joyride v3 wrapper; auto-starts on first visit, marks page toured on finish/skip
    WillowMark.tsx    # brand SVG mark; variant="full" (7 fronds, 72px+) or variant="small" (3 fronds, nav-sized); uses currentColor so wrap in a colored element or pass className. Favicon (client/public/favicon.svg) mirrors the small variant with hardcoded #2e7d5c (hex approx of primary oklch).
  lib/
    api/agent.ts    # all API methods
    demo.ts         # isDemoMode flag + demo credentials; deliberately imports nothing from mocks/
    hooks/          # one React Query hook file per feature
    schemas/        # Zod schemas
    types/index.d.ts
```

### Adding a new feature
1. Domain entity → `Domain/`
2. `DbSet` in `AppDbContext`, create migration
3. Feature folder in `Application/<Feature>/` with `Commands/`, `Queries/`, `Validators/`, `DTOs/`
4. Mappings in `Application/Core/MappingProfiles.cs`
5. Controller in `API/Controllers/` extending `BaseApiController`
6. Types in `src/lib/types/index.d.ts`, API methods in `agent.ts`, Zod schema, React Query hook
7. Page component in `src/features/<feature>/`, route in `AppRouter.tsx`
8. **Add a matching MSW handler in `src/mocks/handlers.ts`** (plus seed data in `seed.ts` if the feature needs any). Easy to forget, because everything still works locally against the real API — but the live demo is the only deployed build, so a missing handler means the new page hangs or errors in production while passing every test.

### Config (`appsettings.Development.json` — gitignored)
```json
{
  "ConnectionStrings": { "DefaultConnection": "Server=localhost,1433;Database=willow;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=true" },
  "Jwt": { "Key": "<≥64 chars>" },
  "ClientUrl": "https://localhost:3000",
  "Resend": { "ApiKey": "", "FromEmail": "noreply@willow-health.pro" },
  "Anthropic": { "ApiKey": "" }
}
```
Start local SQL Server: `docker compose up mssql -d`

## Deployment — demo mode on Vercel

The Azure infrastructure (App Service, Azure SQL, Static Web Apps) was **torn down in September 2026** to stop the hosting spend. There is no deployed backend. What's live is a **frontend-only demo** on Vercel that serves mocked data from the browser.

The backend is fully intact in the repo and still runs locally (`dotnet run --project API` + `docker compose up mssql -d`). Don't delete it — demo mode is a build flag, not a replacement.

### Demo mode

Driven by `VITE_DEMO_MODE=true` (set in the committed `client/.env.demo`, applied via `--mode demo`):

```bash
npm run dev:demo     # dev server with mocks
npm run build:demo   # production demo build — what Vercel runs
```

- **MSW** (`msw` v2) intercepts `/api/*` at the service worker layer, below axios. `agent.ts` and every React Query hook are **unchanged** — the real client code path still runs.
- `main.tsx` **awaits** `worker.start()` before rendering. This matters: service worker activation is async, and rendering first lets the initial `GET /api/account` escape to the network, 401, and bounce the user to `/login`.
- The MSW import is **dynamic**, so a normal `npm run build` tree-shakes MSW out entirely (verified: normal bundle contains no MSW; demo build splits it into a separate ~278 kB chunk).
- `client/public/mockServiceWorker.js` is generated by `npx msw init public/ --save` and **must stay committed** — it's served as a static asset.

### `client/src/mocks/`
- `seed.ts` — deterministic seed (fixed-seed mulberry32 PRNG) so every visitor sees identical data. ~90 days of check-ins on a recovery arc, 5 medications, 5 questions, adherence history, 2 share links. Dates are generated relative to *today*, so the demo never looks stale.
- `db.ts` — localStorage store under `willow:demo`, wrapped in a **versioned envelope**. Bump `SCHEMA_VERSION` whenever the seed shape changes, or stored blobs from older builds will be missing fields and crash the UI. Falls back to in-memory when storage is blocked (Safari private mode).
- `handlers.ts` — one handler per `agent.ts` endpoint, reading/writing through `db.ts` so mutations genuinely persist. **Handler order matters** — MSW matches in registration order, so literal paths must precede parameterised ones (`DELETE /sharing/revoked` before `DELETE /sharing/:id`; `GET /questions/suggestions` before the `:id` routes). Paths are registered as `*/api/...` so they match regardless of how `VITE_API_URL` is configured.
- `pdf.ts` — minimal hand-rolled PDF writer. The real export is server-side QuestPDF, which can't run in a static deploy; this builds a valid multi-page document from live store data so the download isn't stale. The xref table stores byte offsets, so **all output must stay ASCII** — `escapeText` strips non-ASCII to keep string length equal to byte length.
- `browser.ts` — `setupWorker(...handlers)`.

### Features that differ in demo mode
- **AI question suggestions** — canned array (can't ship an Anthropic key to a browser), with a 900 ms delay so the loading state is visible.
- **Emails** (verify, password reset, reminders) — no mailbox. Endpoints return success; `Register.tsx` shows "Account created" instead of "Check your email".
- **Auth** — login validates against the seeded credentials properly, so the error path still works. `Login.tsx` prefills them in demo mode. Register rebinds the single demo account to the details entered.
- **Share links** — work fully, but only within that browser's storage. `/share/demo` is seeded so a first-time visitor always has a working public link.

### Vercel setup
- `client/vercel.json` — `buildCommand: npm run build:demo`, SPA catch-all rewrite, and `no-store` cache headers on `mockServiceWorker.js` so a stale worker can't survive a deploy. Vercel checks the filesystem *before* applying rewrites, so the worker isn't swallowed by the SPA fallback.
- **Vercel project root directory must be set to `client`.**
- `.github/workflows/ci.yml` runs tests + build only. Vercel deploys via its own GitHub integration — no deploy job in CI.

## Testing

### Backend — xUnit
- `Tests.Unit` — handler-level, EF Core InMemory + Moq
- `Tests.Integration` — full HTTP via `WebApplicationFactory`. Uses `UseInternalServiceProvider` to avoid SqlServer/InMemory provider conflict in EF Core 10. Controllers covered: `AccountController`, `CheckInsController`, `QuestionsController`, `SharingController`. `MedicationsController` has no integration tests yet.
- `HandleResult(Result<Unit>)` returns **204 NoContent** — assert `HttpStatusCode.NoContent` for delete/patch
- Plain-string response: `ReadAsStringAsync().Trim('"')` — `Ok(string)` returns `text/plain`
- Rate limiting is disabled in `Testing` environment — no need to work around it in tests
- `RegisterAndGetTokenAsync` helper: register → confirm email via `UserManager` directly → login to get JWT (register no longer returns a token)
- Anonymous endpoints (e.g. `GET /api/sharing/view/{token}`) are tested using `_factory.CreateClient()` with no auth header alongside the authenticated tests in the same class

### Frontend — Vitest + Testing Library
- Config: `client/vitest.config.ts`, setup at `client/src/test/setup.ts`
- Tests in `__tests__/` subdirectories alongside the code
- Forms must have `noValidate` — browser validation blocks RHF/Zod otherwise
- Mock hooks with `vi.mock('@/lib/hooks/useX', ...)`, wrap routed components in `<MemoryRouter>`
- **Mock/demo tests** — `src/mocks/__tests__/`. `handlers.test.ts` drives the MSW handlers through `setupServer` from `msw/node` with plain `fetch`, covering auth, CRUD round trips, cascade deletes, and the route-ordering traps. `pdf.test.ts` validates the generated PDF's xref byte offsets and stream lengths against the actual output. Call `localStorage.clear()` in `beforeEach` so each test starts from a fresh seed.
- **Hook tests** — use `renderHook` + a `QueryClientProvider` wrapper (`retry: false` to avoid retries on errors); mock `agent` with `vi.mock('@/lib/api/agent', ...)`; use `waitFor` to await query/mutation state; use `vi.hoisted` to create spies that are safe to reference inside `vi.mock` factories (needed for `mockNavigate` in `useAccount` tests)
