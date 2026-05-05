using System;
using Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace API.Controllers;

public class CheckInsController : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<List<CheckIn>>> GetCheckIns(AppDbContext context)
    {
        return await context.CheckIns.ToListAsync();
    }
}
