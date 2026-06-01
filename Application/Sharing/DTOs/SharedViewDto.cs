using Application.CheckIns.DTOs;
using Application.Export.DtOs;
using Application.Questions.DTOs;

namespace Application.Sharing.DTOs;

public class SharedViewDto
{
    public string OwnerName { get; set; } = "";
    public DateOnly? EarliestDate { get; set; }
    public DateOnly? LatestDate { get; set; }
    public List<CheckInDto> CheckIns { get; set; } = [];
    public List<QuestionDto> PendingQuestions { get; set; } = [];
    public MetricAverages? Averages { get; set; }
}
