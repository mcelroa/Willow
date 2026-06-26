using Application.CheckIns.DTOs;
using Application.Medications.DTOs;

namespace Application.Core.Interfaces;

public interface IAiService
{
    Task<List<string>> GetQuestionSuggestionsAsync(
        List<CheckInDto> recentCheckIns,
        List<MedicationDto> medications,
        List<string> existingQuestions,
        CancellationToken cancellationToken = default);
}
