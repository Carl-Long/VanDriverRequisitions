using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Interfaces;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Interceptors;

public class AuditableEntityInterceptor(ICurrentUserService currentUser)
    : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        var context = eventData.Context;
        if (context is null)
            return result;

        var now = DateTime.UtcNow;
        var user = currentUser.User;

        foreach (var entry in context.ChangeTracker.Entries())
        {
            // -------------------------
            // AUDITING
            // -------------------------
            if (entry.Entity is AuditableEntity auditable)
            {
                if (entry.State == EntityState.Added)
                {
                    auditable.CreatedAtUtc = now;
                    auditable.CreatedById = user.Id;
                    auditable.CreatedByNameSnapshot = user.Name;
                }

                if (entry.State == EntityState.Modified)
                {
                    auditable.UpdatedAtUtc = now;
                    auditable.UpdatedById = user.Id;
                    auditable.UpdatedByNameSnapshot = user.Name;

                    entry.Property(nameof(AuditableEntity.CreatedAtUtc)).IsModified = false;
                    entry.Property(nameof(AuditableEntity.CreatedById)).IsModified = false;
                    entry.Property(nameof(AuditableEntity.CreatedByNameSnapshot)).IsModified = false;
                }
            }

            // -------------------------
            // SOFT DELETE
            // -------------------------
            if (entry.Entity is ISoftDeletable soft &&
                entry.State == EntityState.Deleted)
            {
                entry.State = EntityState.Modified;

                soft.DeletedAtUtc = now;
                soft.DeletedById = user.Id;
                soft.DeletedByNameSnapshot = user.Name;
            }
        }
        
        return result;
    }
}