using Application.Sharing.Commands;
using Application.Sharing.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace API.Controllers;

[Authorize]
public class SharingController : BaseApiController
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateShareLink.Command command) =>
        HandleResult(await Mediator.Send(command));

    [HttpGet]
    public async Task<IActionResult> List() =>
        HandleResult(await Mediator.Send(new GetShareLinks.Query()));

    [HttpDelete("{id}")]
    public async Task<IActionResult> Revoke(string id) =>
        HandleResult(await Mediator.Send(new RevokeShareLink.Command { Id = id }));

    [AllowAnonymous]
    [EnableRateLimiting("public-read")]
    [HttpGet("view/{token}")]
    public async Task<IActionResult> View(string token) =>
        HandleResult(await Mediator.Send(new GetSharedView.Query { Token = token }));
}
