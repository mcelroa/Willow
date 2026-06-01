using Application.CheckIns.DTOs;
using Application.Questions.DTOs;

namespace Application.Export.DtOs;

public class MetricAverages
{
    public double Mood { get; set; }
    public double Pain { get; set; }
    public double Fatigue { get; set; }
    public double Nausea { get; set; }
    public double? AverageWeight { get; set; }
}

public class ExportDto
{
    public List<CheckInDto> CheckIns { get; set; } = [];
    public List<QuestionDto> PendingQuestions { get; set; } = [];
    public MetricAverages? Averages { get; set; }
}