namespace Application.Medications.DTOs;

public class MedicationDto
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string? Dosage { get; set; }
    public string? TargetSymptom { get; set; }
    public bool IsActive { get; set; }
    public List<MedicationScheduleDto> Schedules { get; set; } = [];
}

public class MedicationScheduleDto
{
    public int DayOfWeek { get; set; }
    public string Time { get; set; } = "";
}

public class SaveMedicationDto
{
    public string Name { get; set; } = "";
    public string? Dosage { get; set; }
    public string? TargetSymptom { get; set; }
    public bool IsActive { get; set; } = true;
    public List<SaveScheduleDto> Schedules { get; set; } = [];
}

public class SaveScheduleDto
{
    public int DayOfWeek { get; set; }
    public string Time { get; set; } = "";
}
