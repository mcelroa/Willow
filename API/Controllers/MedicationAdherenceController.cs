using Application.Adherence.Commands;
using Application.Adherence.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
[Route("api/medication-adherence")]
public class MedicationAdherenceController : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetDaily([FromQuery] DateOnly date) =>
        HandleResult(await Mediator.Send(new GetDailyAdherence.Query { Date = date }));

    [HttpGet("summary")]
    public async Task<IActionResult> Summary([FromQuery] int days = 30) =>
        HandleResult(await Mediator.Send(new GetAdherenceSummary.Query { Days = days }));

    [HttpPost]
    public async Task<IActionResult> Mark([FromBody] MarkAdherence.Command command) =>
        HandleResult(await Mediator.Send(command));

    [HttpDelete("{medicationId}")]
    public async Task<IActionResult> Unmark(string medicationId, [FromQuery] DateOnly date) =>
        HandleResult(await Mediator.Send(new UnmarkAdherence.Command { MedicationId = medicationId, Date = date }));
}
