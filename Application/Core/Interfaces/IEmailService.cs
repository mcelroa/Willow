namespace Application.Core.Interfaces;

public interface IEmailService
{
    Task SendPasswordResetAsync(string toEmail, string resetLink);
    Task SendEmailVerificationAsync(string toEmail, string verifyLink);
    Task SendReminderAsync(string toEmail, string displayName);
}
