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
- `AccountController` is `[AllowAnonymous]`, all other controllers use `[Authorize]`
- Exception middleware in `Program.cs` catches `ValidationException` and returns structured `400`

### Authentication flow
1. POST `/api/account/register` or `/api/account/login` → returns `UserDto` with JWT
2. Client sends `Authorization: Bearer <token>` on subsequent requests
3. JWT middleware validates signature, populates `HttpContext.User` with claims (Id, Email, UserName)

### Frontend — React 19 + Vite

Located in `client/`. Uses:
- **React Router v7** — routing in `AppRouter.tsx`
- **shadcn/ui** — component library, components in `src/components/ui/`
- **Tailwind CSS v4**
- **`@tabler/icons-react`** and **`lucide-react`** for icons

Frontend is early-stage — currently has a stubbed `CheckIn` form component with no API integration yet.

### Adding a new feature

1. Add domain entity to `Domain/`
2. Add `DbSet` to `AppDbContext`, create migration
3. Add feature folder under `Application/<Feature>/` with `Commands/`, `Queries/`, `Validators/`, `DTOs/`
4. Add mappings to `Application/Core/MappingProfiles.cs`
5. Add controller in `API/Controllers/` extending `BaseApiController`
6. Add frontend hook in `client/src/features/<feature>/`

### Config
- SQLite DB connection string lives in `appsettings.Development.json` (`Data Source=willow.db`)
- JWT key lives in `appsettings.Development.json` under `Jwt:Key` — must be ≥ 64 characters for HMAC-SHA512
