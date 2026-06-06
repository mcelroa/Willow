# Contributing to Willow

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for Postgres)

---

## First-time setup

### 1. Start the database

```bash
docker compose up postgres -d
```

### 2. Configure the backend

Create `API/appsettings.Development.json` (gitignored):

```json
{
   "ConnectionStrings": {
      "DefaultConnection": "Host=localhost;Port=5432;Database=willow;Username=postgres;Password=postgres"
   },
   "Jwt": {
      "Key": "<any random string that is at least 64 characters long>"
   },
   "ClientUrl": "https://localhost:3000",
   "Resend": {
      "ApiKey": "",
      "FromEmail": "noreply@willow-health.pro"
   }
}
```

### 3. Apply migrations and run

```bash
dotnet ef database update -p Persistence -s API
dotnet run --project API
```

### 4. Run the frontend

```bash
cd client
npm install
npm run dev
```

The app runs at `https://localhost:3000`. The API runs at `https://localhost:5001`. Accept the self-signed cert in your browser on first visit.

---

## Running tests

```bash
# Backend
dotnet test

# Frontend (watch mode)
cd client && npm run test

# Frontend (single run)
cd client && npm run test:run
```

---

## How to add a new feature

The **Questions** feature is the simplest complete example in the codebase — read it alongside this guide. Files:

- `Domain/Question.cs`
- `Application/Questions/` (Commands, Queries, Validators, DTOs)
- `Application/Core/MappingProfiles.cs` (search "Question")
- `API/Controllers/QuestionsController.cs`
- `client/src/lib/types/index.d.ts` (search "Question")
- `client/src/lib/api/agent.ts` (search "Questions")
- `client/src/lib/hooks/useQuestion.ts`
- `client/src/features/question/Questions.tsx`

### Step 1 — Domain entity

Add a plain C# class to `Domain/`. No base class required.

```csharp
// Domain/Widget.cs
public class Widget
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public required string Name { get; set; }
    public bool IsActive { get; set; } = true;
    public DateOnly CreatedAt { get; set; }
    public required string UserId { get; set; }
    public AppUser User { get; set; } = null!;
}
```

### Step 2 — Register with EF Core and migrate

Add a `DbSet` to `Persistence/AppDbContext.cs`:

```csharp
public DbSet<Widget> Widgets => Set<Widget>();
```

Then create and apply a migration:

```bash
dotnet ef migrations add AddWidget -p Persistence -s API
dotnet ef database update -p Persistence -s API
```

### Step 3 — Application layer (CQRS)

Each operation is a self-contained file in `Application/Widgets/`. The pattern is always: a nested `Query` or `Command` record, a nested `Handler` class, and optionally a nested `Validator`.

**DTO** (`Application/Widgets/DTOs/WidgetDto.cs`):

```csharp
public class WidgetDto
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public bool IsActive { get; set; }
    public DateOnly CreatedAt { get; set; }
}
```

**Query** (`Application/Widgets/Queries/GetWidgetList.cs`):

```csharp
public class GetWidgetList
{
    public class Query : IRequest<Result<List<WidgetDto>>> { }

    public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Query, Result<List<WidgetDto>>>
    {
        public async Task<Result<List<WidgetDto>>> Handle(Query request, CancellationToken ct)
        {
            var widgets = await context.Widgets
                .Where(w => w.UserId == userAccessor.GetUserId())
                .OrderByDescending(w => w.CreatedAt)
                .ProjectTo<WidgetDto>(mapper.ConfigurationProvider)
                .ToListAsync(ct);

            return Result<List<WidgetDto>>.Success(widgets);
        }
    }
}
```

**Command** (`Application/Widgets/Commands/CreateWidget.cs`):

```csharp
public class CreateWidget
{
    public class Command : IRequest<Result<string>>
    {
        public required CreateWidgetDto Dto { get; set; }
    }

    public class CommandValidator : AbstractValidator<Command>
    {
        public CommandValidator()
        {
            RuleFor(x => x.Dto.Name).NotEmpty();
        }
    }

    public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Command, Result<string>>
    {
        public async Task<Result<string>> Handle(Command request, CancellationToken ct)
        {
            var widget = mapper.Map<Widget>(request.Dto);
            widget.UserId = userAccessor.GetUserId();
            widget.CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow);

            context.Widgets.Add(widget);
            await context.SaveChangesAsync(ct);

            return Result<string>.Success(widget.Id);
        }
    }
}
```

**Delete command** (`Application/Widgets/Commands/DeleteWidget.cs`):

```csharp
public class DeleteWidget
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string Id { get; set; }
    }

    public class Handler(AppDbContext context, IUserAccessor userAccessor)
        : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken ct)
        {
            var widget = await context.Widgets
                .FirstOrDefaultAsync(w => w.Id == request.Id && w.UserId == userAccessor.GetUserId(), ct);

            if (widget is null) return Result<Unit>.Failure("Widget not found", 404);

            context.Widgets.Remove(widget);
            await context.SaveChangesAsync(ct);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
```

> `Result<Unit>` is the return type for operations with no response body (delete, toggle). `HandleResult(Result<Unit>)` in the base controller returns **204 No Content**.

### Step 4 — AutoMapper

Add mappings to `Application/Core/MappingProfiles.cs`:

```csharp
CreateMap<Widget, WidgetDto>();
CreateMap<CreateWidgetDto, Widget>();
```

### Step 5 — API controller

```csharp
// API/Controllers/WidgetsController.cs
[Authorize]
public class WidgetsController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<List<WidgetDto>>> GetWidgets() =>
        HandleResult(await Mediator.Send(new GetWidgetList.Query()));

    [HttpPost]
    public async Task<ActionResult<string>> CreateWidget(CreateWidgetDto dto) =>
        HandleResult(await Mediator.Send(new CreateWidget.Command { Dto = dto }));

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteWidget(string id) =>
        HandleResult(await Mediator.Send(new DeleteWidget.Command { Id = id }));
}
```

`HandleResult` maps `Result<T>` to HTTP:

- `IsSuccess = true` with a value → `200 OK`
- `IsSuccess = true` with `Unit` → `204 No Content`
- `Code = 404` → `404 Not Found`
- Anything else failed → `400 Bad Request`

### Step 6 — Frontend types

Add to `client/src/lib/types/index.d.ts`:

```ts
type WidgetDto = {
   id: string;
   name: string;
   isActive: boolean;
   createdAt: string;
};

type CreateWidgetDto = {
   name: string;
};
```

### Step 7 — API client

Add to the `agent` object in `client/src/lib/api/agent.ts`:

```ts
Widgets: {
  list: () => requests.get<WidgetDto[]>("/widgets"),
  create: (dto: CreateWidgetDto) => requests.post<string>("/widgets", dto),
  delete: (id: string) => requests.delete<void>(`/widgets/${id}`),
},
```

### Step 8 — Zod schema

Create `client/src/lib/schemas/widgetSchema.ts`:

```ts
import { z } from "zod";

export const widgetSchema = z.object({
   name: z.string().min(1, "Name is required"),
});

export type WidgetFormValues = z.infer<typeof widgetSchema>;
```

### Step 9 — React Query hook

Create `client/src/lib/hooks/useWidgets.ts`:

```ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "@/lib/api/agent";

export const useWidgets = () => {
   const queryClient = useQueryClient();

   const { data: widgets = [], isLoading } = useQuery({
      queryKey: ["widgets"],
      queryFn: () => agent.Widgets.list(),
   });

   const createWidget = useMutation({
      mutationFn: (dto: CreateWidgetDto) => agent.Widgets.create(dto),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["widgets"] }),
   });

   const deleteWidget = useMutation({
      mutationFn: (id: string) => agent.Widgets.delete(id),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["widgets"] }),
   });

   return { widgets, isLoading, createWidget, deleteWidget };
};
```

> `onSuccess` invalidates the query cache, which causes React Query to automatically refetch the list. You don't need to manually update the cache.

### Step 10 — Page component and route

Create `client/src/features/widgets/Widgets.tsx` following the design system conventions in CLAUDE.md. Then register the route in `client/src/app/AppRouter.tsx`.

---

## Key things to know

### Never query the DB concurrently in a handler

EF Core throws if you run two `ToListAsync` calls on the same `DbContext` at the same time. Always `await` queries sequentially — no `Task.WhenAll` with EF queries.

### Validation runs automatically

`FluentValidation` validators are picked up by `ValidationBehaviour<T>` (a MediatR pipeline behaviour). If you name your validator `CommandValidator` and nest it inside the command class, it is registered automatically. A validation failure returns a structured `400` before your handler even runs.

### User isolation is your responsibility

The backend has no row-level security. Every handler that reads or writes user data must filter by `userAccessor.GetUserId()`. Forgetting this is a data-leak bug.

### `Result<Unit>` vs `Result<T>`

- Return `Result<Unit>` for commands that have no meaningful response body (delete, toggle, update).
- Return `Result<T>` with a concrete type when the caller needs data back (create returning the new ID, queries returning DTOs).

### Forms need `noValidate`

Add `noValidate` to every `<form>` element. Without it, the browser's native validation fires before React Hook Form / Zod, breaking your custom error messages.

---

## Folder conventions at a glance

```
Application/
  Widgets/
    Commands/
      CreateWidget.cs     # Command + Validator + Handler
      DeleteWidget.cs
    Queries/
      GetWidgetList.cs    # Query + Handler
    DTOs/
      WidgetDto.cs
      CreateWidgetDto.cs

API/Controllers/
  WidgetsController.cs

client/src/
  lib/
    types/index.d.ts      # WidgetDto, CreateWidgetDto
    api/agent.ts          # Widgets: { list, create, delete }
    schemas/widgetSchema.ts
    hooks/useWidgets.ts
  features/
    widgets/
      Widgets.tsx
      __tests__/
        Widgets.test.tsx
```
