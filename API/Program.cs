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
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.HttpOverrides;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;

builder.Services.AddControllers();

// Behind Azure App Service's proxy the connection IP is the load balancer's, not the client's.
// Clear all network restrictions so the middleware trusts X-Forwarded-For from
// Azure's proxy (whose IP range is not fixed). Safe because the container is
// not directly reachable from the internet — Azure's infrastructure always sits in front.
builder.Services.Configure<ForwardedHeadersOptions>(opt =>
{
    opt.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    opt.KnownIPNetworks.Clear();
    opt.KnownProxies.Clear();
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(connectionString)
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
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();
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

if (!builder.Environment.IsEnvironment("Testing") && !builder.Environment.IsDevelopment())
{
    builder.Services.AddRateLimiter(options =>
    {
        // login, register, reset-password: 5 attempts per 15 minutes per IP
        options.AddPolicy("auth", context =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                factory: _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 5,
                    Window = TimeSpan.FromMinutes(15),
                    QueueLimit = 0
                }));

        // forgot-password: 3 per hour per IP to prevent email bombing
        options.AddPolicy("auth-strict", context =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                factory: _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 3,
                    Window = TimeSpan.FromHours(1),
                    QueueLimit = 0
                }));

        // public shared-view endpoint: 30 per minute per IP
        options.AddPolicy("public-read", context =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                factory: _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 30,
                    Window = TimeSpan.FromMinutes(1),
                    QueueLimit = 0
                }));

        options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    });
}

builder.Services.AddHttpClient();
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<IEmailService, ResendEmailService>();
builder.Services.AddScoped<PdfExportService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserAccessor, UserAccessor>();
builder.Services.AddHostedService<ReminderBackgroundService>();


var app = builder.Build();

app.UseForwardedHeaders();

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
if (!app.Environment.IsEnvironment("Testing") && !app.Environment.IsDevelopment()) app.UseRateLimiter();
app.MapGet("/health", () => Results.Ok("healthy"));
app.MapControllers();

if (!app.Environment.IsEnvironment("Testing"))
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await context.Database.MigrateAsync();
}

app.Run();