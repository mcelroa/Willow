using API.Services;
using Application.Export.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class ExportController(PdfExportService pdfExportService) : BaseApiController
{
    [HttpGet("pdf")]
    public async Task<IActionResult> ExportPdf()
    {
        var result = await Mediator.Send(new GetExportData.Query());

        if (!result.IsSuccess) return BadRequest(result.Error);

        var pdf = pdfExportService.Generate(result.Value!);

        return File(pdf, "application/pdf", "willow-export.pdf");
    }
}