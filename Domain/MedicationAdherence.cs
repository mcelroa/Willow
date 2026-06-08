namespace Domain;

public class MedicationAdherence
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public DateOnly Date { get; set; }

    public string MedicationId { get; set; } = "";
    public Medication Medication { get; set; } = null!;

    public string UserId { get; set; } = "";
    public AppUser User { get; set; } = null!;
}
