using Application.Medications.Commands;
using Application.Medications.DTOs;
using Application.Medications.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class MedicationsController : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> List() =>
        HandleResult(await Mediator.Send(new GetMedications.Query()));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SaveMedicationDto dto) =>
        HandleResult(await Mediator.Send(new CreateMedication.Command { Dto = dto }));

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] SaveMedicationDto dto) =>
        HandleResult(await Mediator.Send(new UpdateMedication.Command { Id = id, Dto = dto }));

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id) =>
        HandleResult(await Mediator.Send(new DeleteMedication.Command { Id = id }));
}
