using System.Linq.Expressions;
using VanDriverRequisitions.Application.Features.Shops.Dtos;
using VanDriverRequisitions.Domain.Entities.Common;

namespace VanDriverRequisitions.Application.Features.Shops.Mappings;

public static class ShopProjections
{
    public static Expression<Func<Shop, ShopLookupDto>> AsLookupDto =>
        x => new ShopLookupDto
        {
            Id = x.Id,
            Code = x.Code,
            Name = x.Name,
        };
    
    public static Expression<Func<Shop, ShopRequisitionSnapshotDto>> AsRequisitionSnapshotDto =>
        x => new ShopRequisitionSnapshotDto
        {
            Id = x.Id,
            Code = x.Code,
            Name = x.Name,
            IsActive = x.IsActive
        };
}
