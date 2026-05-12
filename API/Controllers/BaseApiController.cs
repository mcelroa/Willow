using Application.Core;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BaseApiController : ControllerBase
{
    private IMediator? _mediator;

    protected IMediator Mediator =>
        _mediator ??= HttpContext.RequestServices.GetService<IMediator>()
        ?? throw new InvalidOperationException("IMediator service is unavailable");

    protected ActionResult HandleResult<T>(Result<T> result)
    {
        if (!result.IsSuccess) return result.Code switch
        {
            404 => NotFound(result.Error),
            403 => Forbid(),
            _ => BadRequest(result.Error)
        };

        if (result.Value != null) return Ok(result.Value);

        return BadRequest("Result returned no value");
    }

    protected ActionResult HandleResult(Result<Unit> result)
    {
        if (!result.IsSuccess) return result.Code switch
        {
            404 => NotFound(result.Error),
            403 => Forbid(),
            _ => BadRequest(result.Error)
        };

        return NoContent();
    }
}
