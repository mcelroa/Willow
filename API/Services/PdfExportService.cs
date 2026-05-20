using Application.Export.DtOs;
using QuestPDF.Helpers;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace API.Services;

public class PdfExportService
{
    public byte[] Generate(ExportDto data)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(t => t.FontSize(11));

                page.Content().Column(col =>
                {
                    col.Spacing(20);

                    // Header
                    col.Item().Text("Willow Health Export")
                        .FontSize(22).Bold();
                    col.Item().Text($"Generated {DateTime.UtcNow:dd MMM yyyy}")
                        .FontSize(10).FontColor(Colors.Grey.Medium);

                    // Averages section
                    if (data.Averages is not null)
                    {
                        col.Item().Text("Overall Averages")
                            .FontSize(14).Bold();

                        col.Item().Row(row =>
                        {
                            foreach (var (label, value) in new[]
                            {
                                ("Mood", data.Averages.Mood),
                                ("Pain", data.Averages.Pain),
                                ("Fatigue", data.Averages.Fatigue),
                                ("Nausea", data.Averages.Nausea),
                            })
                            {
                                row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten2)
                                    .Padding(8).Column(c =>
                                    {
                                        c.Item().Text(label).FontSize(9).FontColor(Colors.Grey.Medium);
                                        c.Item().Text(value.ToString("F1")).FontSize(18).Bold();
                                    });
                            }
                        });
                    }

                    // Check-ins section
                    col.Item().Text("Check-in history")
                        .FontSize(14).Bold();

                    if (data.CheckIns.Count == 0)
                    {
                        col.Item().Text("No check-ins recorded.")
                            .FontColor(Colors.Grey.Medium);
                    }
                    else
                    {
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(cols =>
                            {
                                cols.RelativeColumn(2); // Date
                                cols.RelativeColumn(); // Mood
                                cols.RelativeColumn(); // Pain
                                cols.RelativeColumn(); // Fatigue
                                cols.RelativeColumn(); // Nausea
                                cols.RelativeColumn(3); // Notes
                            });

                            // Header row
                            table.Header(header =>
                            {
                                foreach (var heading in new[] { "Date", "Mood", "Pain", "Fatigue", "Nausea", "Notes" })
                                {
                                    header.Cell().Text(heading).Bold();
                                }
                            });

                            // Data rows
                            foreach (var checkIn in data.CheckIns)
                            {
                                table.Cell().Text(checkIn.Date.ToString("dd MMM yyyy"));
                                table.Cell().Text(checkIn.Mood.ToString());
                                table.Cell().Text(checkIn.Pain.ToString());
                                table.Cell().Text(checkIn.Fatigue.ToString());
                                table.Cell().Text(checkIn.Nausea.ToString());
                                table.Cell().Text(checkIn.Notes ?? "");
                            }
                        });
                    }

                    // Pending questions section
                    col.Item().Text("Questions for Care Team")
                        .FontSize(14).Bold();

                    if (data.PendingQuestions.Count == 0)
                    {
                        col.Item().Text("No pending questions.")
                            .FontColor(Colors.Grey.Medium);
                    }
                    else
                    {
                        col.Item().Column(qCol =>
                        {
                            qCol.Spacing(6);
                            foreach (var (q, i) in data.PendingQuestions.Select((q, i) => (q, i + 1)))
                            {
                                qCol.Item().Text($"{i}. {q.Text}");
                            }
                        });
                    }
                });
            });
        }).GeneratePdf();
    }
}