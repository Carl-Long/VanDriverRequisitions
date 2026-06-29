using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.Shops.Dtos;
using VanDriverRequisitions.Application.Features.Shops.Mappings;
using VanDriverRequisitions.Application.Features.VanDrivers.Dtos;
using VanDriverRequisitions.Application.Features.VanDrivers.Mappings;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Common.Requisitions;

public sealed class RequisitionLookupLoader(IApplicationDbContext context) : IRequisitionLookupLoader
{
    public async Task<VanDriverLookupDto> LoadDriverLookupAsync(
        Guid vanDriverId,
        CancellationToken cancellationToken,
        bool includeInactive = false)
    {
        var query = QueryVanDrivers(includeInactive);

        var driver = await query
            .Where(x => x.Id == vanDriverId)
            .Select(VanDriverProjections.AsLookupDto)
            .SingleOrDefaultAsync(cancellationToken);

        return driver ?? throw new NotFoundException($"Van driver '{vanDriverId}' was not found.");
    }

    public async Task<ShopRequisitionSnapshotDto> LoadShopRequisitionSnapshotAsync(
        Guid shopId,
        CancellationToken cancellationToken,
        bool includeInactive = false)
    {
        var query = QueryShops(includeInactive);

        var shop = await query
            .Where(x => x.Id == shopId)
            .Select(ShopProjections.AsRequisitionSnapshotDto)
            .SingleOrDefaultAsync(cancellationToken);

        return shop ?? throw new NotFoundException($"Shop '{shopId}' was not found.");
    }

    public async Task<Dictionary<Guid, ShopRequisitionSnapshotDto>> LoadShopRequisitionSnapshotMapAsync(
        IEnumerable<Guid> shopIds,
        CancellationToken cancellationToken,
        bool includeInactive = false)
    {
        var ids = shopIds.Distinct().ToList();

        if (ids.Count == 0)
        {
            return [];
        }

        var query = QueryShops(includeInactive);

        return await query
            .Where(x => ids.Contains(x.Id))
            .Select(ShopProjections.AsRequisitionSnapshotDto)
            .ToDictionaryAsync(x => x.Id, cancellationToken);
    }

    public async Task<Dictionary<Guid, FeTaskType>> LoadFeTaskTypeMapAsync(
        IEnumerable<Guid> taskTypeIds,
        CancellationToken cancellationToken,
        bool includeInactive = false)
    {
        var ids = taskTypeIds.Distinct().ToList();

        if (ids.Count == 0)
        {
            return [];
        }

        var query = QueryFeTaskTypes(includeInactive);

        return await query
            .Where(x => ids.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, cancellationToken);
    }

    public async Task<Dictionary<Guid, CostReason>> LoadCostReasonMapAsync(
        IEnumerable<Guid> reasonIds,
        CancellationToken cancellationToken,
        bool includeInactive = false)
    {
        var ids = reasonIds.Distinct().ToList();

        if (ids.Count == 0)
        {
            return [];
        }

        var query = QueryCostReasons(includeInactive);

        return await query
            .Where(x => ids.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, cancellationToken);
    }

    public async Task<Dictionary<Guid, StdCollectionType>> LoadStdCollectionTypeMapAsync(
        IEnumerable<Guid> collectionTypeIds,
        CancellationToken cancellationToken,
        bool includeInactive = false)
    {
        var ids = collectionTypeIds.Distinct().ToList();

        if (ids.Count == 0)
        {
            return [];
        }

        var query = QueryStdCollectionTypes(includeInactive);

        return await query
            .Where(x => ids.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, cancellationToken);
    }

    public async Task<Dictionary<Guid, StdLocation>> LoadStdLocationMapAsync(
        IEnumerable<Guid> locationIds,
        CancellationToken cancellationToken,
        bool includeInactive = false)
    {
        var ids = locationIds.Distinct().ToList();

        if (ids.Count == 0)
        {
            return [];
        }

        var query = QueryStdLocations(includeInactive);

        return await query
            .Where(x => ids.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, cancellationToken);
    }

    public async Task<decimal?> LoadStdVanPackRateAsync(CancellationToken cancellationToken)
    {
        return await context.RequisitionLimitRules
            .AsNoTracking()
            .Where(x => x.Fascia == Fascia.Std &&
                        x.Category == RequisitionRowCategory.VanPack)
            .Select(x => (decimal?)x.MaxRate)
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<bool> IsShopActiveAsync(Guid shopId, CancellationToken cancellationToken)
    {
        var isActive = await QueryShops(includeInactive: true)
            .Where(x => x.Id == shopId)
            .Select(x => (bool?)x.IsActive)
            .SingleOrDefaultAsync(cancellationToken);

        return isActive ?? throw new NotFoundException($"Shop '{shopId}' was not found.");
    }

    private IQueryable<VanDriver> QueryVanDrivers(bool includeInactive)
    {
        var query = context.VanDrivers.AsQueryable();

        if (includeInactive)
        {
            query = query.IgnoreQueryFilters();
        }

        return query.AsNoTracking();
    }

    private IQueryable<Shop> QueryShops(bool includeInactive)
    {
        var query = context.Shops.AsQueryable();

        if (includeInactive)
        {
            query = query.IgnoreQueryFilters();
        }

        return query.AsNoTracking();
    }

    private IQueryable<FeTaskType> QueryFeTaskTypes(bool includeInactive)
    {
        var query = context.FeTaskTypes.AsQueryable();

        if (includeInactive)
        {
            query = query.IgnoreQueryFilters();
        }

        return query.AsNoTracking();
    }

    private IQueryable<CostReason> QueryCostReasons(bool includeInactive)
    {
        var query = context.CostReasons.AsQueryable();

        if (includeInactive)
        {
            query = query.IgnoreQueryFilters();
        }

        return query.AsNoTracking();
    }

    private IQueryable<StdCollectionType> QueryStdCollectionTypes(bool includeInactive)
    {
        var query = context.StdCollectionTypes.AsQueryable();

        if (includeInactive)
        {
            query = query.IgnoreQueryFilters();
        }

        return query.AsNoTracking();
    }

    private IQueryable<StdLocation> QueryStdLocations(bool includeInactive)
    {
        var query = context.StdLocations.AsQueryable();

        if (includeInactive)
        {
            query = query.IgnoreQueryFilters();
        }

        return query.AsNoTracking();
    }
}