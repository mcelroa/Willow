using System;

namespace Application.CheckIns.DTOs;

public class CheckInDto
{
    public string Id { get; set; } = "";
    public string? Notes { get; set; }
    public int Mood { get; set; }
    public int Pain { get; set; }
    public int Fatigue { get; set; }
    public int Nausea { get; set; }
    public decimal? Weight { get; set; }
    public DateOnly Date { get; set; }
}
