using Application.CheckIns.DTOs;
using Application.Core.Interfaces;
using Application.Medications.DTOs;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace API.Services;

public class ClaudeAiService(IHttpClientFactory httpClientFactory, IConfiguration config) : IAiService
{
    private const string ApiUrl = "https://api.anthropic.com/v1/messages";
    private const string Model = "claude-haiku-4-5-20251001";

    public async Task<List<string>> GetQuestionSuggestionsAsync(
        List<CheckInDto> recentCheckIns,
        List<MedicationDto> medications,
        List<string> existingQuestions,
        CancellationToken cancellationToken = default)
    {
        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Add("x-api-key", config["Anthropic:ApiKey"]);
        client.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");

        var requestBody = new
        {
            model = Model,
            max_tokens = 512,
            system = """
                You are a clinical assistant helping cancer patients prepare for their oncology appointments.
                Analyse the patient's recent symptom data and medications, then suggest 3-5 specific questions
                they should ask their care team at their next appointment.

                Rules:
                - Return ONLY a valid JSON array of strings, with no surrounding text or markdown
                - Each question must be specific to the patient's actual symptom trends or medications
                - Do not duplicate any of the patient's existing questions
                - Focus on concerning trends, unexplained changes, or potential medication side effects
                - Keep questions concise and appropriate to ask a care team
                """,
            messages = new[]
            {
                new { role = "user", content = BuildUserMessage(recentCheckIns, medications, existingQuestions) }
            }
        };

        var response = await client.PostAsJsonAsync(ApiUrl, requestBody, cancellationToken);
        response.EnsureSuccessStatusCode();

        using var doc = await JsonDocument.ParseAsync(
            await response.Content.ReadAsStreamAsync(cancellationToken),
            cancellationToken: cancellationToken);

        var text = doc.RootElement
            .GetProperty("content")[0]
            .GetProperty("text")
            .GetString() ?? "[]";

        return JsonSerializer.Deserialize<List<string>>(text) ?? [];
    }

    private static string BuildUserMessage(
        List<CheckInDto> checkIns,
        List<MedicationDto> medications,
        List<string> existingQuestions)
    {
        var sb = new StringBuilder();

        sb.AppendLine("My recent symptom check-ins (last 30 days, most recent first):");
        sb.AppendLine();

        if (checkIns.Count == 0)
        {
            sb.AppendLine("No check-ins recorded yet.");
        }
        else
        {
            foreach (var c in checkIns.Take(14))
            {
                sb.Append($"- {c.Date:MMM d}: Mood {c.Mood}/10, Pain {c.Pain}/10, Fatigue {c.Fatigue}/10, Nausea {c.Nausea}/10");
                if (c.Weight.HasValue) sb.Append($", Weight {c.Weight}kg");
                if (!string.IsNullOrWhiteSpace(c.Notes)) sb.Append($" — Notes: \"{c.Notes}\"");
                sb.AppendLine();
            }
        }

        sb.AppendLine();
        sb.AppendLine("My current medications:");

        if (medications.Count == 0)
        {
            sb.AppendLine("None listed.");
        }
        else
        {
            foreach (var m in medications)
            {
                sb.Append($"- {m.Name}");
                if (!string.IsNullOrWhiteSpace(m.Dosage)) sb.Append($" {m.Dosage}");
                if (!string.IsNullOrWhiteSpace(m.TargetSymptom)) sb.Append($" (for {m.TargetSymptom})");
                sb.AppendLine();
            }
        }

        if (existingQuestions.Count > 0)
        {
            sb.AppendLine();
            sb.AppendLine("Questions I already have (do not duplicate these):");
            foreach (var q in existingQuestions)
                sb.AppendLine($"- {q}");
        }

        sb.AppendLine();
        sb.AppendLine("Suggest 3-5 specific questions I should ask my care team. Return only a JSON array of strings.");

        return sb.ToString();
    }
}
