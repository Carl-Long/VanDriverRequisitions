using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Extensions;

public static class ModelBuilderExtensions
{
    public static void ApplyGlobalQueryFilters(
        this ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyActivatableFilters();
        modelBuilder.ApplySoftDeleteFilters();
    }
    
    public static void ApplySequentialGuidKeys(this ModelBuilder modelBuilder)
    {
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            var idProperty = entityType.FindProperty("Id");

            if (idProperty?.ClrType != typeof(Guid))
                continue;

            idProperty.SetDefaultValueSql("NEWSEQUENTIALID()");
            idProperty.ValueGenerated = ValueGenerated.OnAdd;
        }
    }
}