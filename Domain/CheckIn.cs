namespace Domain;

public class CheckIn
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string? Notes { get; set; }
    public int Mood { get; set; }
    public int Pain { get; set; }
    public int Fatigue { get; set; }
    public int Nausea { get; set; }
    public required DateOnly Date { get; set; }

    public string UserId { get; set; } = "";
    public AppUser User { get; set; } = null!;
}
