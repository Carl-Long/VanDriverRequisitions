using VanDriverRequisitions.Application.Features.Shops.Dtos;
using VanDriverRequisitions.Application.Features.VanDrivers.Dtos;

namespace VanDriverRequisitions.Application.Common.Interfaces;

public interface IRequisitionLookupLoader
{
    Task<VanDriverLookupDto> LoadDriverLookupAsync(Guid vanDriverId, CancellationToken cancellationToken, bool includeInactive = false);
    Task<ShopRequisitionSnapshotDto> LoadShopRequisitionSnapshotAsync(Guid shopId, CancellationToken cancellationToken, bool includeInactive = false);
    Task<Dictionary<Guid, ShopRequisitionSnapshotDto>> LoadShopRequisitionSnapshotMapAsync(IEnumerable<Guid> shopIds, CancellationToken cancellationToken, bool includeInactive = false);
    Task<bool> IsShopActiveAsync(Guid shopId, CancellationToken cancellationToken);
}