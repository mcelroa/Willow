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
    public async Task<ActionResult<List<CheckIn>>> GetCheckIns()
    {
        return await Mediator.Send(new GetCheckInList.Query());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CheckIn>> GetCheckIn(string id)
    {
        var checkIn = await context.CheckIns.FindAsync(id);
        if (checkIn == null) return NotFound();
        return checkIn;
    }

    [HttpPost]
    public async Task<ActionResult<CheckIn>> CreateCheckIn(CheckIn checkIn)
    {
        context.CheckIns.Add(checkIn);
        await context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetCheckIn), new { id = checkIn.Id }, checkIn);
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
