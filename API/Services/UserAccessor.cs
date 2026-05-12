using System.Security.Claims;
using Application.Core.Interfaces;

namespace API.Services;

public class UserAccessor(IHttpContextAccessor httpContextAccessor) : IUserAccessor
{
    public string GetUserId()
    {
        return httpContextAccessor.HttpContext?
            .User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException();
    }
}
