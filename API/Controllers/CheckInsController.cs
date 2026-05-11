using Application.CheckIns.Commands;
using Application.CheckIns.DTOs;
using Application.CheckIns.Queries;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace API.Controllers;

public class CheckInsController(AppDbContext context) : BaseApiController
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
    public async Task<ActionResult<string>> CreateCheckIn(CreateCheckInDto dto)
    {
        return HandleResult(await Mediator.Send(new CreateCheckIn.Command { CheckInDto = dto }));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCheckIn(string id, CheckIn checkIn)
    {
        if (id != checkIn.Id) return BadRequest();
        context.Entry(checkIn).State = EntityState.Modified;
        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCheckIn(string id)
    {
        var checkIn = await context.CheckIns.FindAsync(id);
        if (checkIn == null) return NotFound();
        context.CheckIns.Remove(checkIn);
        await context.SaveChangesAsync();
        return NoContent();
    }
}
