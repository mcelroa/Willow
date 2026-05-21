using Application.CheckIns.Queries;
using Application.CheckIns.Validators;
using Application.Core;
using Microsoft.EntityFrameworkCore;
using Persistence;

using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Domain;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Application.Core.Interfaces;

var builder = WebApplication.CreateBuilder(args);

QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;

builder.Services.AddControllers();

var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(connectionString)
);
builder.Services.AddCors();
builder.Services.AddMediatR(x =>
{
    x.RegisterServicesFromAssemblyContaining<GetCheckInList.Handler>();
    x.AddOpenBehavior(typeof(ValidationBehaviour<,>));
}
);
builder.Services.AddAutoMapper(typeof(MappingProfiles).Assembly);
builder.Services.AddValidatorsFromAssemblyContaining<CreateCheckInValidator>();
builder.Services.AddIdentityCore<AppUser>(opt =>
{
    opt.Password.RequireNonAlphanumeric = false;
})
    .AddEntityFrameworkStores<AppDbContext>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!));

        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = key,
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<PdfExportService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserAccessor, UserAccessor>();


var app = builder.Build();

app.UseExceptionHandler(errorApp => errorApp.Run(async context =>
{
    var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;

    if (exception is ValidationException validationException)
    {
        context.Response.StatusCode = 400;
        context.Response.ContentType = "application/json";
        var errors = validationException.Errors.Select(e => new { e.PropertyName, e.ErrorMessage });
        await context.Response.WriteAsJsonAsync(errors);
        return;
    }

    context.Response.StatusCode = 500;
}));
var allowedOrigins = new List<string> { "http://localhost:3000", "https://localhost:3000" };
var corsOrigin = builder.Configuration["CORS_ORIGIN"];
if (!string.IsNullOrEmpty(corsOrigin)) allowedOrigins.Add(corsOrigin);

app.UseCors(x =>
    x.AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials()
    .WithOrigins([.. allowedOrigins])
);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

if (!app.Environment.IsEnvironment("Testing"))
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await context.Database.MigrateAsync();
}

app.Run();