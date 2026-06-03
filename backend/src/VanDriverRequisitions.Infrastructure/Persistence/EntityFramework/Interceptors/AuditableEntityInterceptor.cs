using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Interfaces;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Interceptors;

public class AuditableEntityInterceptor(ICurrentUserService currentUser)
    : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        ApplyChanges(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        ApplyChanges(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void ApplyChanges(DbContext? context)
    {
        if (context is null) return;

        var now = DateTime.UtcNow;
        var user = currentUser.User ?? LoggedInUser.System;

        ApplyAuditing(context, now, user);
        TouchRequisitionParents(context, now, user);
    }

    private static void ApplyAuditing(DbContext context, DateTime now, LoggedInUser user)
    {
        foreach (var entry in context.ChangeTracker.Entries<AuditableEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                if (entry.Entity.CreatedAtUtc == default)
                {
                    entry.Entity.CreatedAtUtc = now;
                }

                if (entry.Entity.CreatedById == Guid.Empty)
                {
                    entry.Entity.CreatedById = user.Id;
                }

                if (string.IsNullOrWhiteSpace(entry.Entity.CreatedByNameSnapshot))
                {
                    entry.Entity.CreatedByNameSnapshot = user.Name;
                }
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAtUtc = now;
                entry.Entity.UpdatedById = user.Id;
                entry.Entity.UpdatedByNameSnapshot = user.Name;

                entry.Property(x => x.CreatedAtUtc).IsModified = false;
                entry.Property(x => x.CreatedById).IsModified = false;
                entry.Property(x => x.CreatedByNameSnapshot).IsModified = false;
            }
        }

        foreach (var entry in context.ChangeTracker.Entries<ISoftDeletable>())
        {
            if (entry.State == EntityState.Deleted)
            {
                entry.State = EntityState.Modified;

                entry.Entity.DeletedAtUtc = now;
                entry.Entity.DeletedById = user.Id;
                entry.Entity.DeletedByNameSnapshot = user.Name;
            }
        }
    }

    private static void TouchRequisitionParents(DbContext context, DateTime now, LoggedInUser user)
    {
        var affectedRequisitionIds = context.ChangeTracker
            .Entries<IFeRequisitionChild>()
            .Where(e => e.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
            .Select(e => e.Entity.FeRequisitionId)
            .Distinct()
            .ToList();

        if (affectedRequisitionIds.Count == 0)
            return;

        var requisitions = context.ChangeTracker
            .Entries<FeRequisition>()
            .Where(e => affectedRequisitionIds.Contains(e.Entity.Id))
            .ToList();

        foreach (var entry in requisitions)
        {
            entry.Entity.UpdatedAtUtc = now;
            entry.Entity.UpdatedById = user.Id;
            entry.Entity.UpdatedByNameSnapshot = user.Name;

            entry.Property(x => x.UpdatedAtUtc).IsModified = true;
            entry.Property(x => x.UpdatedById).IsModified = true;
            entry.Property(x => x.UpdatedByNameSnapshot).IsModified = true;
        }
    }
}