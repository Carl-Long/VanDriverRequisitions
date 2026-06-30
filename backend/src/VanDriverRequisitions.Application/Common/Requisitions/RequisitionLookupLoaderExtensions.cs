using VanDriverRequisitions.Application.Common.Interfaces;

namespace VanDriverRequisitions.Application.Common.Requisitions;

public static class RequisitionLookupLoaderExtensions
{
    public static async Task<Dictionary<Guid, bool>> LoadShopActiveMapAsync(
        this IRequisitionLookupLoader lookupLoader,
        IEnumerable<Guid> shopIds,
        CancellationToken cancellationToken)
    {
        var ids = shopIds
            .Distinct()
            .ToList();

        if (ids.Count == 0)
        {
            return [];
        }

        var shopMap = await lookupLoader.LoadShopRequisitionSnapshotMapAsync(
            ids,
            cancellationToken,
            includeInactive: true);

        return shopMap.ToDictionary(
            x => x.Key,
            x => x.Value.IsActive);
    }

    public static async Task<Dictionary<Guid, bool>> LoadCostReasonActiveMapAsync(
        this IRequisitionLookupLoader lookupLoader,
        IEnumerable<Guid> reasonIds,
        CancellationToken cancellationToken)
    {
        var ids = reasonIds
            .Distinct()
            .ToList();

        if (ids.Count == 0)
        {
            return [];
        }

        var reasonMap = await lookupLoader.LoadCostReasonMapAsync(
            ids,
            cancellationToken,
            includeInactive: true);

        return reasonMap.ToDictionary(
            x => x.Key,
            x => x.Value.IsActive);
    }

    public static async Task<Dictionary<Guid, bool>> LoadStdCollectionTypeActiveMapAsync(
        this IRequisitionLookupLoader lookupLoader,
        IEnumerable<Guid> collectionTypeIds,
        CancellationToken cancellationToken)
    {
        var ids = collectionTypeIds
            .Distinct()
            .ToList();

        if (ids.Count == 0)
        {
            return [];
        }

        var collectionTypeMap = await lookupLoader.LoadStdCollectionTypeMapAsync(
            ids,
            cancellationToken,
            includeInactive: true);

        return collectionTypeMap.ToDictionary(
            x => x.Key,
            x => x.Value.IsActive);
    }

    public static async Task<Dictionary<Guid, bool>> LoadStdLocationActiveMapAsync(
        this IRequisitionLookupLoader lookupLoader,
        IEnumerable<Guid> locationIds,
        CancellationToken cancellationToken)
    {
        var ids = locationIds
            .Distinct()
            .ToList();

        if (ids.Count == 0)
        {
            return [];
        }

        var locationMap = await lookupLoader.LoadStdLocationMapAsync(
            ids,
            cancellationToken,
            includeInactive: true);

        return locationMap.ToDictionary(
            x => x.Key,
            x => x.Value.IsActive);
    }
}