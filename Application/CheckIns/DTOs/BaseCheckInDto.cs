using System;

namespace Application.CheckIns.DTOs;

public class BaseCheckInDto
{
    public string? Notes { get; set; }
    public int Mood { get; set; }
    public int Pain { get; set; }
    public int Fatigue { get; set; }
    public int Nausea { get; set; }
    public DateOnly Date { get; set; }
}
