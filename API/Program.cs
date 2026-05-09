using Domain;
using Microsoft.EntityFrameworkCore;
using Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"))
);
builder.Services.AddCors();


var app = builder.Build();

app.UseCors(x =>
    x.AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials()
    .WithOrigins("http://localhost:3000", "https://localhost:3000")
);
app.MapControllers();

using var scope = app.Services.CreateScope();
var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
await context.Database.MigrateAsync();
await DbInitializer.SeedData(context);

app.Run();