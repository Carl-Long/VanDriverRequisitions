using VanDriverRequisitions.Application.Features.Shops.Dtos;
using VanDriverRequisitions.Application.Features.VanDrivers.Dtos;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.STD;

namespace VanDriverRequisitions.Application.Common.Interfaces;

public interface IRequisitionLookupLoader
{
    Task<VanDriverLookupDto> LoadDriverLookupAsync(Guid vanDriverId, CancellationToken cancellationToken,
        bool includeInactive = false);

    Task<ShopRequisitionSnapshotDto> LoadShopRequisitionSnapshotAsync(Guid shopId, CancellationToken cancellationToken,
        bool includeInactive = false);

    Task<Dictionary<Guid, ShopRequisitionSnapshotDto>> LoadShopRequisitionSnapshotMapAsync(IEnumerable<Guid> shopIds,
        CancellationToken cancellationToken,
        bool includeInactive = false);

    Task<Dictionary<Guid, FeTaskType>> LoadFeTaskTypeMapAsync(IEnumerable<Guid> taskTypeIds,
        CancellationToken cancellationToken,
        bool includeInactive = false);

    Task<Dictionary<Guid, CostReason>> LoadCostReasonMapAsync(IEnumerable<Guid> reasonIds,
        CancellationToken cancellationToken,
        bool includeInactive = false);

    Task<Dictionary<Guid, StdCollectionType>> LoadStdCollectionTypeMapAsync(IEnumerable<Guid> collectionTypeIds,
        CancellationToken cancellationToken,
        bool includeInactive = false);

    Task<Dictionary<Guid, StdLocation>> LoadStdLocationMapAsync(IEnumerable<Guid> locationIds,
        CancellationToken cancellationToken,
        bool includeInactive = false);

    Task<decimal?> LoadStdVanPackRateAsync(CancellationToken cancellationToken);

    Task<bool> IsShopActiveAsync(Guid shopId, CancellationToken cancellationToken);
}