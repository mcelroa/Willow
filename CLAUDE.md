# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (.NET 10)
```bash
# Run the API (from repo root)
dotnet run --project API

# Build solution
dotnet build

# Add a migration (run from repo root)
dotnet ef migrations add <MigrationName> -p Persistence -s API

# Apply migrations
dotnet ef database update -p Persistence -s API

# Remove last migration
dotnet ef migrations remove -p Persistence -s API
```

### Frontend (React + Vite)
```bash
# From the client/ directory
npm run dev       # dev server on http://localhost:3000
npm run build     # type-check + production build
npm run lint      # ESLint
npm run test      # Vitest watch mode
npm run test:run  # Vitest single run (used in CI)
```

### Backend tests
```bash
dotnet test                                               # run all tests
dotnet test Tests.Unit                                    # unit tests only
dotnet test Tests.Integration                             # integration tests only
dotnet test --filter "FullyQualifiedName~<ClassName>"     # single class
```

## Architecture

This is a health tracking app with a Clean Architecture .NET backend and a React frontend.

### Backend — 4 projects

**`Domain`** — plain C# entities only. No dependencies. `CheckIn` and `AppUser` live here.

**`Persistence`** — EF Core + SQLite. `AppDbContext` extends `IdentityDbContext<AppUser>`. Only project that knows about the database. Seeds data via `DbInitializer` on startup.

**`Application`** — all business logic. Depends on Domain and Persistence. Key patterns:
- **CQRS via MediatR** — each operation is a nested `Query`/`Command` + `Handler` class inside a single file (e.g. `GetCheckInList.cs`)
- **`Result<T>`** in `Core/Result.cs` — all handlers return `Result<T>`, never throw for expected failures
- **AutoMapper** — `Core/MappingProfiles.cs` maps between domain entities and DTOs. Use `ProjectTo<T>` in queries for SQL-level mapping
- **FluentValidation** — validators in `CheckIns/Validators/`. `ValidationBehaviour<T>` pipeline runs validators automatically before every handler via async `ValidateAsync`
- **DTOs** — `SaveCheckInDto` is used for both create and edit. `CheckInDto` is the read/response shape

**`API`** — ASP.NET Core web host. Depends only on Application (not Persistence directly). Key points:
- `BaseApiController` provides `Mediator` (lazy-loaded from `HttpContext.RequestServices`) and `HandleResult<T>()` / `HandleResult(Result<Unit>)` overloads that map `Result<T>` to HTTP responses
- Controllers are thin — they dispatch to MediatR and return `HandleResult(...)`
- `TokenService` in `API/Services/` generates JWTs signed with `Jwt:Key` from config using HMAC-SHA512 (key must be ≥ 64 characters)
- `AccountController` has `[AllowAnonymous]` per method on login/register; `GET /api/account` is `[Authorize]` and returns the current user from JWT claims
- All other controllers use `[Authorize]`
- Exception middleware in `Program.cs` catches `ValidationException` and returns structured `400`

### Authentication flow
1. POST `/api/account/register` or `/api/account/login` → returns `UserDto` with JWT
2. Client stores JWT in `localStorage` under key `"jwt"`
3. Axios interceptor in `agent.ts` attaches `Authorization: Bearer <token>` to every request
4. JWT middleware validates signature, populates `HttpContext.User` with claims
5. On app load, `useAccount` calls `GET /api/account` to rehydrate the current user if a token exists

### Frontend — React 19 + Vite

Located in `client/`. Key libraries:
- **React Router v7** — routing in `src/app/AppRouter.tsx`
- **TanStack React Query** — all server state and data fetching
- **React Hook Form + Zod** — form state and validation. Schemas live in `src/lib/schemas/`
- **axios** — HTTP client. Single named instance in `src/lib/api/agent.ts` with Bearer token interceptor
- **shadcn/ui** — component library in `src/components/ui/`
- **Tailwind CSS v4**

### Frontend folder structure

```
src/
  app/
    AppRouter.tsx          # all routes — public and protected
    layout/
      Layout.tsx           # NavBar + Outlet wrapper for protected pages
      NavBar.tsx           # hamburger on mobile/tablet (<lg), full nav on desktop
      RequireAuth.tsx      # redirects to /login if no current user
  features/
    account/               # Login.tsx, Register.tsx + __tests__/Login.test.tsx
    checkIn/               # CheckIn.tsx, EditCheckIn.tsx, History.tsx, Trends.tsx
    export/                # Export.tsx
    question/              # Questions.tsx
  lib/
    api/agent.ts           # axios instance, interceptor, all API methods grouped by resource
    hooks/                 # one React Query hook file per feature
    schemas/               # Zod schemas + __tests__/schemas.test.ts
    types/index.d.ts       # global TypeScript types matching backend DTOs
  test/
    setup.ts               # imports @testing-library/jest-dom
```

### Adding a new feature

1. Add domain entity to `Domain/`
2. Add `DbSet` to `AppDbContext`, create migration
3. Add feature folder under `Application/<Feature>/` with `Commands/`, `Queries/`, `Validators/`, `DTOs/`
4. Add mappings to `Application/Core/MappingProfiles.cs`
5. Add controller in `API/Controllers/` extending `BaseApiController`
6. Add frontend types to `src/lib/types/index.d.ts`
7. Add API methods to the relevant group in `src/lib/api/agent.ts`
8. Add Zod schema in `src/lib/schemas/`
9. Add React Query hook in `src/lib/hooks/`
10. Add page component in `src/features/<feature>/` and wire up route in `AppRouter.tsx`

### Config
- PostgreSQL connection string in `appsettings.Development.json` (`Host=localhost;Port=5432;Database=willow;Username=postgres;Password=postgres`)
- JWT key lives in `appsettings.Development.json` under `Jwt:Key` — must be ≥ 64 characters for HMAC-SHA512
- Start local Postgres: `docker compose up postgres -d`

## Testing

### Backend — xUnit
- `Tests.Unit` — handler-level tests using EF Core InMemory + Moq. One file per handler class under `Tests.Unit/CheckIns/` and `Tests.Unit/Questions/`
- `Tests.Integration` — full HTTP tests via `WebApplicationFactory`. `WillowWebApplicationFactory` swaps Postgres for EF InMemory using `UseInternalServiceProvider` (required to avoid Npgsql/InMemory provider conflict in EF Core 10)
- `HandleResult(Result<Unit>)` returns **204 NoContent**, not 200 — assert `HttpStatusCode.NoContent` for delete/patch endpoints
- Reading a plain-string response body: use `ReadAsStringAsync()` then `.Trim('"')` — `Ok(string)` returns `text/plain`, not JSON

### Frontend — Vitest + Testing Library
- Config: `client/vitest.config.ts` — jsdom environment, setup file at `client/src/test/setup.ts`
- Test files live in `__tests__/` subdirectories alongside the code they test
- Forms that use React Hook Form must have `noValidate` — without it, browser native constraint validation blocks the submit event before RHF/Zod runs, breaking both the UX and tests
- Mock hooks with `vi.mock('@/lib/hooks/useX', ...)`, wrap components that use routing in `<MemoryRouter>`
