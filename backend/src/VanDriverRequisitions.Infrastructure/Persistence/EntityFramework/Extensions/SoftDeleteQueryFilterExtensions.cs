using System.Reflection;
using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Domain.Interfaces;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Extensions;

public static class SoftDeleteQueryFilterExtensions
{
    public static void ApplySoftDeleteFilters(this ModelBuilder modelBuilder)
    {
        var softDeleteTypes = modelBuilder.Model
            .GetEntityTypes()
            .Where(t => typeof(ISoftDeletable)
                .IsAssignableFrom(t.ClrType));

        foreach (var entityType in softDeleteTypes)
        {
            var method = typeof(SoftDeleteQueryFilterExtensions)
                .GetMethod(
                    nameof(SetSoftDeleteFilter),
                    BindingFlags.NonPublic | BindingFlags.Static)!
                .MakeGenericMethod(entityType.ClrType);

            method.Invoke(null, [modelBuilder]);
        }
    }

    private static void SetSoftDeleteFilter<TEntity>(ModelBuilder modelBuilder) where TEntity : class, ISoftDeletable
    {
        modelBuilder.Entity<TEntity>().HasQueryFilter(x => x.DeletedAtUtc == null);
    }
}