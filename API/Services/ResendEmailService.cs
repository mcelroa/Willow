using Application.Core.Interfaces;

namespace API.Services;

public class ResendEmailService(IHttpClientFactory httpClientFactory, IConfiguration config) : IEmailService
{
    public async Task SendPasswordResetAsync(string toEmail, string resetLink)
    {
        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", config["Resend:ApiKey"]);

        var body = new
        {
            from = config["Resend:FromEmail"],
            to = new[] { toEmail },
            subject = "Reset your Willow password",
            html = $"""
                <p>You requested a password reset for your Willow account.</p>
                <p><a href="{resetLink}">Reset your password</a></p>
                <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
                """
        };

        await client.PostAsJsonAsync("https://api.resend.com/emails", body);
    }

    public async Task SendEmailVerificationAsync(string toEmail, string verifyLink)
    {
        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", config["Resend:ApiKey"]);

        var body = new
        {
            from = config["Resend:FromEmail"],
            to = new[] { toEmail },
            subject = "Verify your Willow email address",
            html = $"""
                <p>Thanks for signing up for Willow.</p>
                <p><a href="{verifyLink}">Verify your email address</a></p>
                <p>If you didn't create an account, you can ignore this email.</p>
                """
        };

        await client.PostAsJsonAsync("https://api.resend.com/emails", body);
    }

    public async Task SendReminderAsync(string toEmail, string displayName)
    {
        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", config["Resend:ApiKey"]);

        var clientUrl = config["ClientUrl"];
        var body = new
        {
            from = config["Resend:FromEmail"],
            to = new[] { toEmail },
            subject = "Don't forget your Willow check-in today",
            html = $"""
                <p>Hi {displayName},</p>
                <p>You haven't logged your symptoms today. Taking a moment to check in helps you and your care team track how you're doing.</p>
                <p><a href="{clientUrl}/checkin">Log today's check-in</a></p>
                <p style="font-size:0.85em;color:#888;">You can turn off these reminders in your <a href="{clientUrl}/account/settings">account settings</a>.</p>
                """
        };

        await client.PostAsJsonAsync("https://api.resend.com/emails", body);
    }
}
