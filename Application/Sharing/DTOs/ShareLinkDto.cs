namespace Application.Sharing.DTOs;

public class ShareLinkDto
{
    public string Id { get; set; } = "";
    public string Token { get; set; } = "";
    public string? Label { get; set; }
    public DateOnly CreatedAt { get; set; }
    public DateOnly? ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }
    public DateTimeOffset? LastViewedAt { get; set; }
}
