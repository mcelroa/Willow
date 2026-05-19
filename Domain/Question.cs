using System;

namespace Domain;

public class Question
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public required string Text { get; set; }
    public bool IsAsked { get; set; } = false;
    public DateOnly CreatedAt { get; set; }
    public required string UserId { get; set; }
    public AppUser User { get; set; } = null!;
}
