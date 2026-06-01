namespace Domain;

public class ShareLink
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public required string Token { get; set; }
    public string? Label { get; set; }
    public DateOnly CreatedAt { get; set; }
    public DateOnly? ExpiresAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    public DateTimeOffset? LastViewedAt { get; set; }

    public string UserId { get; set; } = "";
    public AppUser User { get; set; } = null!;
}
