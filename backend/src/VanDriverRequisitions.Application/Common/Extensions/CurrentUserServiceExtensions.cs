using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Application.Common.Extensions;

public static class CurrentUserServiceExtensions
{
    public static AuditUser RequireAuditUser(this ICurrentUserService currentUserService)
    {
        var user = currentUserService.RequireUser();
        return new AuditUser(user.Id, user.Name);
    }
}