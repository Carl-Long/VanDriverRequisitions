using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.STD;

namespace VanDriverRequisitions.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<FeRequisition> FeRequisitions { get; }
    DbSet<FeRequisitionSubmission> FeRequisitionSubmissions { get; }
    DbSet<FeTaskType> FeTaskTypes { get; }
    DbSet<CostReason> CostReasons { get; }

    DbSet<StdRequisition> StdRequisitions { get; }
    DbSet<StdRequisitionSubmission> StdRequisitionSubmissions { get; }
    DbSet<StdCollectionType> StdCollectionTypes { get; }
    DbSet<StdLocation> StdLocations { get; }
    
    DbSet<RequisitionLimitRule> RequisitionLimitRules { get; }
    DbSet<SubmitWindow> SubmitWindows { get; }
    DbSet<Shop> Shops { get; }
    DbSet<VanDriver> VanDrivers { get; }
    
    EntityEntry Entry(object entity);
    
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);

    Task<string> NextFeRequisitionNumberAsync(CancellationToken cancellationToken);
    Task<string> NextStdRequisitionNumberAsync(CancellationToken cancellationToken);
}