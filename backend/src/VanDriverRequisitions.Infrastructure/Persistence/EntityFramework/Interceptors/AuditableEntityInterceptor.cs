using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Domain.Entities;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Interceptors;

public class AuditableEntityInterceptor(ICurrentUserService currentUser) : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        var context = eventData.Context;
        if (context == null) return result;

        var entries = context.ChangeTracker
            .Entries<AuditableEntity>();

        var now = DateTimeOffset.UtcNow;

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedById = currentUser.UserId;
                entry.Entity.CreatedByNameSnapshot = currentUser.UserName;
                entry.Entity.CreatedAtUtc = now;
            }

            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedById = currentUser.UserId;
                entry.Entity.UpdatedByNameSnapshot = currentUser.UserName;
                entry.Entity.UpdatedAtUtc = now;
            }
        }

        return result;
    }
}