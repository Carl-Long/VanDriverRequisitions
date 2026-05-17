using System.Reflection;
using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Domain.Interfaces;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Extensions;

public static class ActivatableQueryFilterExtensions
{
    public static void ApplyActivatableFilters(this ModelBuilder modelBuilder)
    {
        var activatableTypes = modelBuilder.Model
            .GetEntityTypes()
            .Where(t => typeof(IActivatable)
                .IsAssignableFrom(t.ClrType));

        foreach (var entityType in activatableTypes)
        {
            var method = typeof(ActivatableQueryFilterExtensions)
                .GetMethod(
                    nameof(SetActivatableFilter),
                    BindingFlags.NonPublic | BindingFlags.Static)!
                .MakeGenericMethod(entityType.ClrType);

            method.Invoke(null, [modelBuilder]);
        }
    }

    private static void SetActivatableFilter<TEntity>(ModelBuilder modelBuilder) where TEntity : class, IActivatable
    {
        modelBuilder.Entity<TEntity>().HasQueryFilter(x => x.IsActive);
    }
}