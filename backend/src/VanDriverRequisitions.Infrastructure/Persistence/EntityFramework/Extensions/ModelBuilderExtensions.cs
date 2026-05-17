using System.Reflection;
using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Domain.Interfaces;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Extensions;

public static class ModelBuilderExtensions
{
    public static void ApplyGlobalQueryFilters(
        this ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyActivatableFilters();
        modelBuilder.ApplySoftDeleteFilters();
    }
}