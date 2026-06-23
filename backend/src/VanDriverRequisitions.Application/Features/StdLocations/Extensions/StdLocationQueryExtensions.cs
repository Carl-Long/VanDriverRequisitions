using VanDriverRequisitions.Application.Features.StdLocations.Dtos;
using VanDriverRequisitions.Domain.Entities.STD;

namespace VanDriverRequisitions.Application.Features.StdLocations.Extensions;

public static class StdLocationQueryExtensions
{
    public static IQueryable<StdLocation> ApplyAdminFilters(this IQueryable<StdLocation> query, StdLocationAdminQueryDto filters)
    {
        if (!filters.IncludeInactive)
        {
            query = query.Where(x => x.IsActive);
        }

        if (filters.ShopId.HasValue)
        {
            query = query.Where(x => x.ShopId == filters.ShopId.Value);
        }

        if (filters.CollectionTypeId.HasValue)
        {
            query = query.Where(x => x.CollectionTypeId == filters.CollectionTypeId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filters.Search))
        {
            var search = filters.Search.Trim();

            query = query.Where(x =>
                x.LocationName.Contains(search) ||
                x.PostCode.Contains(search));
        }

        return query;
    }

    public static IOrderedQueryable<StdLocation> ApplyAdminOrdering(this IQueryable<StdLocation> query)
    {
        return query
            .OrderBy(x => x.Shop.Code)
            .ThenBy(x => x.CollectionType.Code)
            .ThenBy(x => x.LocationName)
            .ThenBy(x => x.PostCode);
    }
}