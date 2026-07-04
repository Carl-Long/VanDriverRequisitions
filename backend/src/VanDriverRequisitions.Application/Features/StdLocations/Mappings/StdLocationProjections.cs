using System.Linq.Expressions;
using VanDriverRequisitions.Application.Features.StdLocations.Dtos;
using VanDriverRequisitions.Domain.Entities.STD;

namespace VanDriverRequisitions.Application.Features.StdLocations.Mappings;

public static class StdLocationProjections
{
    public static Expression<Func<StdLocation, StdLocationLookupDto>> AsLookupDto =>
        x => new StdLocationLookupDto
        {
            Id = x.Id,
            ShopId = x.ShopId,
            CollectionTypeId = x.CollectionTypeId,
            LocationName = x.LocationName,
            PostCode = x.PostCode
        };

    public static Expression<Func<StdLocation, StdLocationSummaryDto>> AsSummaryDto =>
        x => new StdLocationSummaryDto
        {
            Id = x.Id,

            ShopId = x.ShopId,
            ShopCode = x.Shop.Code,
            ShopName = x.Shop.Name,
            IsShopActive = x.Shop.IsActive,

            CollectionTypeId = x.CollectionTypeId,
            CollectionTypeCode = x.CollectionType.Code,
            CollectionTypeName = x.CollectionType.Name,
            IsCollectionTypeActive = x.CollectionType.IsActive,

            LocationName = x.LocationName,
            PostCode = x.PostCode,

            IsActive = x.IsActive,

            CreatedAtUtc = x.CreatedAtUtc,
            CreatedByNameSnapshot = x.CreatedByNameSnapshot,
            UpdatedAtUtc = x.UpdatedAtUtc,
            UpdatedByNameSnapshot = x.UpdatedByNameSnapshot
        };
}