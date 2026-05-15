using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework;

public class VanDriverDbContext(DbContextOptions<VanDriverDbContext> options)
    : DbContext(options)
{
    public DbSet<FeRequisition> Requisitions => Set<FeRequisition>();
    public DbSet<FeTaskType> FeTaskTypes => Set<FeTaskType>();
    public DbSet<FeReason> FeReasons => Set<FeReason>();
    public DbSet<LimitValue> LimitValues => Set<LimitValue>();
    public DbSet<SubmitWindow>  SubmitWindows => Set<SubmitWindow>();
    public DbSet<Shop> Shops => Set<Shop>();
    public DbSet<VanDriver> VanDrivers => Set<VanDriver>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(VanDriverDbContext).Assembly);
        
        modelBuilder.HasSequence<long>("FeRequisitionNumber")
            .StartsAt(1)
            .IncrementsBy(1);
    }
}