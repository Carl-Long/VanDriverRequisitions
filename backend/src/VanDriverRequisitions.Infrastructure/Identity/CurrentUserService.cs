using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Models;

namespace VanDriverRequisitions.Infrastructure.Identity;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor)
    : ICurrentUserService
{
    private ClaimsPrincipal UserPrincipal =>
        httpContextAccessor.HttpContext?.User
        ?? throw new UnauthorizedAccessException("No HTTP context user.");

    public LoggedInUser User
    {
        get
        {
            var oid = UserPrincipal.FindFirstValue("oid")
                      ?? throw new UnauthorizedAccessException("Missing 'oid' claim.");

            if (!Guid.TryParse(oid, out var id))
                throw new UnauthorizedAccessException("Invalid 'oid' claim format.");

            var name =
                UserPrincipal.FindFirstValue("name")
                ?? UserPrincipal.FindFirstValue("preferred_username")
                ?? throw new UnauthorizedAccessException("Missing user name claim.");

            return new LoggedInUser(id, name);
        }
    }
}