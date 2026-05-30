using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<FeRequisition> FeRequisitions { get; }
    DbSet<FeGeneralTask> FeGeneralTasks { get; }
    DbSet<FeTaskType> FeTaskTypes { get; }
    DbSet<FeReason> FeReasons { get; }
    DbSet<RequisitionLimitRule> RequisitionLimitRules { get; }
    DbSet<SubmitWindow> SubmitWindows { get; }
    DbSet<Shop> Shops { get; }
    DbSet<VanDriver> VanDrivers { get; }

    Task<int> SaveChangesAsync(
        CancellationToken cancellationToken);

    Task<string> NextFeRequisitionNumberAsync(CancellationToken cancellationToken);
}