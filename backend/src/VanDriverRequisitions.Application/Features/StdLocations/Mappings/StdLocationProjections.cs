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
}