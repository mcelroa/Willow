using Application.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace API.Services;

public class ReminderBackgroundService(
    IServiceScopeFactory scopeFactory,
    IConfiguration config,
    ILogger<ReminderBackgroundService> logger)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);

            var sendHour = config.GetValue<int>("Reminders:SendHourUtc", 18);
            if (DateTime.UtcNow.Hour != sendHour)
                continue;

            await SendRemindersAsync(stoppingToken);
        }
    }

    private async Task SendRemindersAsync(CancellationToken stoppingToken)
    {
        using var scope = scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var users = await context.Users
            .Where(u => u.ReminderEnabled && !context.CheckIns.Any(c => c.UserId == u.Id && c.Date == today))
            .Select(u => new { u.Email, u.UserName })
            .ToListAsync(stoppingToken);

        logger.LogInformation("Sending {Count} check-in reminders for {Date}", users.Count, today);

        foreach (var user in users)
        {
            try
            {
                await emailService.SendReminderAsync(user.Email!, user.UserName ?? user.Email!);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send reminder to {Email}", user.Email);
            }
        }
    }
}
