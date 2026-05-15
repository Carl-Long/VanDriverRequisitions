using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using VanDriverRequisitions.Application.Common.Interfaces;

namespace VanDriverRequisitions.Infrastructure.Identity;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    private ClaimsPrincipal? User => httpContextAccessor.HttpContext?.User;

    public bool IsAuthenticated =>
        User?.Identity?.IsAuthenticated ?? false;

    public Guid UserId =>
        Guid.Parse(User?.FindFirstValue("oid")
                   ?? throw new UnauthorizedAccessException("Missing Entra ID 'oid' claim"));

    public string UserName =>
        User?.FindFirstValue("preferred_username")
        ?? User?.FindFirstValue("name")
        ?? "unknown";
    
    public IEnumerable<string> Roles =>
        User?.FindAll("roles").Select(c => c.Value)
        ?? Enumerable.Empty<string>();

    public bool IsInRole(string role)
    {
        return Roles.Contains(role, StringComparer.OrdinalIgnoreCase);
    }
}