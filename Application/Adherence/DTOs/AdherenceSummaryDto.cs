namespace Application.Adherence.DTOs;

public class AdherenceSummaryDto
{
    public string MedicationId { get; set; } = "";
    public int TakenDays { get; set; }
    public int ScheduledDays { get; set; }
}
