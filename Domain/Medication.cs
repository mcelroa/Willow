namespace Domain;

public class Medication
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public required string Name { get; set; }
    public string? Dosage { get; set; }
    public string? TargetSymptom { get; set; }
    public bool IsActive { get; set; } = true;

    public string UserId { get; set; } = "";
    public AppUser User { get; set; } = null!;
    public ICollection<MedicationSchedule> Schedules { get; set; } = [];
}
