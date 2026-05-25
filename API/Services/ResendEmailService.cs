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
}
