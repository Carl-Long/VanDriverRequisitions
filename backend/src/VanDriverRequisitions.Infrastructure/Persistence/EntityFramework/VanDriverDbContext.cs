using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Interfaces;
using VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Constants;
using VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Extensions;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework;

public class VanDriverDbContext(DbContextOptions<VanDriverDbContext> options)
    : DbContext(options), IApplicationDbContext
{
    public DbSet<FeRequisition> FeRequisitions => Set<FeRequisition>();
    public DbSet<FeGeneralTask> FeGeneralTasks => Set<FeGeneralTask>();
    public DbSet<FeRequisitionSubmission> FeRequisitionSubmissions => Set<FeRequisitionSubmission>();
    public DbSet<FeTaskType> FeTaskTypes => Set<FeTaskType>();
    public DbSet<FeReason> FeReasons => Set<FeReason>();
    public DbSet<RequisitionLimitRule> RequisitionLimitRules => Set<RequisitionLimitRule>();
    public DbSet<SubmitWindow> SubmitWindows => Set<SubmitWindow>();
    public DbSet<Shop> Shops => Set<Shop>();
    public DbSet<VanDriver> VanDrivers => Set<VanDriver>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(VanDriverDbContext).Assembly);
        modelBuilder.ApplySequences();

        // Applies filters to mean only active and non-deleted items returned by default:
        // - IActivatable => IsActive == true
        // - ISoftDeletable => DeletedAtUtc == null
        modelBuilder.ApplyGlobalQueryFilters();
        modelBuilder.ApplySequentialGuidKeys();
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(ISoftDeletable).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType)
                    .Property(nameof(ISoftDeletable.DeletedByNameSnapshot))
                    .HasMaxLength(200);
            }
        }
    }

    public new EntityEntry Entry(object entity)
    {
        return base.Entry(entity);
    }

    public async Task<string> NextFeRequisitionNumberAsync(CancellationToken cancellationToken)
    {
        var result = await Database
            .SqlQueryRaw<long>($"SELECT NEXT VALUE FOR {DbSequences.FeRequisitionNumber} AS Value")
            .ToListAsync(cancellationToken);

        return $"F{result[0]:D9}";
    }

    public async Task<string> NextPoNumberAsync(CancellationToken cancellationToken)
    {
        var result = await Database
            .SqlQueryRaw<long>(
                $"SELECT NEXT VALUE FOR {DbSequences.PoNumber} AS Value")
            .ToListAsync(cancellationToken);

        var year = DateTime.UtcNow.ToString("yy");

        return $"PO{year}-{result[0]:D6}";
    }
}