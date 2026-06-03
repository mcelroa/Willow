namespace Domain;

public class MedicationSchedule
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public int DayOfWeek { get; set; }
    public TimeOnly Time { get; set; }

    public string MedicationId { get; set; } = "";
    public Medication Medication { get; set; } = null!;
}
