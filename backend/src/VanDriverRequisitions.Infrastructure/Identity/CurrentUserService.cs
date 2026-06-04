using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Models;

namespace VanDriverRequisitions.Infrastructure.Identity;

public sealed class CurrentUserService(IHttpContextAccessor httpContextAccessor)
    : ICurrentUserService
{
    public LoggedInUser? TryGetUser()
    {
        var principal = httpContextAccessor.HttpContext?.User;

        if (principal?.Identity?.IsAuthenticated != true)
            return null;

        var oid = principal.FindFirstValue("oid");
        if (!Guid.TryParse(oid, out var id))
            return null;

        var name =
            principal.FindFirstValue("name")
            ?? principal.FindFirstValue("preferred_username")
            ?? "unknown";

        return new LoggedInUser(id, name);
    }

    public LoggedInUser User =>
        TryGetUser() ?? LoggedInUser.System;
}