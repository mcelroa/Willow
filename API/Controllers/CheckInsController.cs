using Application.CheckIns.Commands;
using Application.CheckIns.DTOs;
using Application.CheckIns.Queries;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class CheckInsController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<List<CheckInDto>>> GetCheckIns()
    {
        return HandleResult(await Mediator.Send(new GetCheckInList.Query { }));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CheckInDto>> GetCheckIn(string id)
    {
        return HandleResult(await Mediator.Send(new GetCheckIn.Query { Id = id }));
    }

    [HttpPost]
    public async Task<ActionResult<string>> CreateCheckIn(SaveCheckInDto dto)
    {
        return HandleResult(await Mediator.Send(new CreateCheckIn.Command { CheckInDto = dto }));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> EditCheckIn(string id, SaveCheckInDto dto)
    {
        return HandleResult(await Mediator.Send(new EditCheckIn.Command { Id = id, CheckInDto = dto }));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCheckIn(string id)
    {
        return HandleResult(await Mediator.Send(new DeleteCheckIn.Command { Id = id }));
    }
}
