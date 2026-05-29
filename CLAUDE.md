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
npm run dev       # https://localhost:3000
npm run build
npm run lint
npm run test      # Vitest watch
npm run test:run  # Vitest single run (CI)
```

### Backend tests
```bash
dotnet test
dotnet test Tests.Unit
dotnet test Tests.Integration
dotnet test --filter "FullyQualifiedName~<ClassName>"
```

## Architecture

Cancer patient symptom tracker — daily check-ins (mood, pain, fatigue, nausea 1–10) + questions list for care team.

### Backend — 4 projects

**`Domain`** — plain C# entities. `CheckIn` and `AppUser`.

**`Persistence`** — EF Core + PostgreSQL. `AppDbContext` extends `IdentityDbContext<AppUser>`.

**`Application`** — all business logic. Key patterns:
- **CQRS via MediatR** — `Query`/`Command` + `Handler` in a single file per operation
- **`Result<T>`** — all handlers return `Result<T>`, never throw for expected failures
- **AutoMapper** — `Core/MappingProfiles.cs`. Use `ProjectTo<T>` in queries
- **FluentValidation** — `ValidationBehaviour<T>` runs validators automatically before every handler

**`API`** — ASP.NET Core host. Key points:
- `BaseApiController` provides `Mediator` and `HandleResult<T>()` — controllers are thin dispatchers
- `TokenService` generates JWTs with HMAC-SHA512 (`Jwt:Key` must be ≥ 64 chars)
- `AccountController` endpoints are `[AllowAnonymous]`; all others use `[Authorize]`
- `ResendEmailService` sends password reset emails via Resend HTTP API
- Exception middleware catches `ValidationException` → structured `400`

### Authentication
JWT stored in `localStorage` under `"jwt"`. Axios interceptor in `agent.ts` attaches it to every request. On app load `useAccount` calls `GET /api/account` to rehydrate the current user.

### Frontend — React 19 + Vite (`client/`)
- **React Router v7** — `src/app/AppRouter.tsx`
- **TanStack React Query** — all server state
- **React Hook Form + Zod** — schemas in `src/lib/schemas/`
- **axios** — `src/lib/api/agent.ts` with Bearer interceptor
- **shadcn/ui + Tailwind CSS v4**

### Folder structure
```
src/
  app/
    AppRouter.tsx
    layout/         # Layout.tsx, NavBar.tsx, RequireAuth.tsx
  features/
    account/        # Login, Register, ForgotPassword, ResetPassword
    checkIn/        # CheckIn, EditCheckIn, History, Trends
    export/         # Summary.tsx (stats + PDF export)
    question/       # Questions.tsx
  lib/
    api/agent.ts    # all API methods
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

### Config (`appsettings.Development.json` — gitignored)
```json
{
  "ConnectionStrings": { "DefaultConnection": "Host=localhost;Port=5432;..." },
  "Jwt": { "Key": "<≥64 chars>" },
  "ClientUrl": "https://localhost:3000",
  "Resend": { "ApiKey": "", "FromEmail": "noreply@willow-health.pro" }
}
```
Start local Postgres: `docker compose up postgres -d`

## Testing

### Backend — xUnit
- `Tests.Unit` — handler-level, EF Core InMemory + Moq
- `Tests.Integration` — full HTTP via `WebApplicationFactory`. Uses `UseInternalServiceProvider` to avoid Npgsql/InMemory conflict in EF Core 10
- `HandleResult(Result<Unit>)` returns **204 NoContent** — assert `HttpStatusCode.NoContent` for delete/patch
- Plain-string response: `ReadAsStringAsync().Trim('"')` — `Ok(string)` returns `text/plain`

### Frontend — Vitest + Testing Library
- Config: `client/vitest.config.ts`, setup at `client/src/test/setup.ts`
- Tests in `__tests__/` subdirectories alongside the code
- Forms must have `noValidate` — browser validation blocks RHF/Zod otherwise
- Mock hooks with `vi.mock('@/lib/hooks/useX', ...)`, wrap routed components in `<MemoryRouter>`
