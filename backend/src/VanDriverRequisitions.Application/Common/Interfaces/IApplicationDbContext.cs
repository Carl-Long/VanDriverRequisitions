using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<FeRequisition> Requisitions { get; }
    DbSet<FeTaskType> FeTaskTypes { get; }
    DbSet<FeReason> FeReasons { get; }
    DbSet<LimitValue> LimitValues { get; }
    DbSet<SubmitWindow> SubmitWindows { get; }
    DbSet<Shop> Shops { get; }
    DbSet<VanDriver> VanDrivers { get; }

    Task<int> SaveChangesAsync(
        CancellationToken cancellationToken);

    Task<string> NextFeRequisitionNumberAsync(CancellationToken cancellationToken);
}