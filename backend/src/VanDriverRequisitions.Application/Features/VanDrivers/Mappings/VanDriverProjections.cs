using System.Linq.Expressions;
using VanDriverRequisitions.Application.Features.VanDrivers.Dtos;
using VanDriverRequisitions.Domain.Entities.Common;

namespace VanDriverRequisitions.Application.Features.VanDrivers.Mappings;

public static class VanDriverProjections
{
    public static Expression<Func<VanDriver, VanDriverLookupDto>> AsLookupDto =>
     x => new VanDriverLookupDto
     {
         Id = x.Id,
         Code = x.Code,
         TradersName = x.TradersName,
         Address1 = x.Address1,
         Address2 = x.Address2,
         Town = x.Town,
         County = x.County,
         Postcode = x.Postcode,
         Phone = x.Phone,
         VatNumber = x.VatNumber,
         HasVat = x.HasVat,
         IsActive = x.IsActive,
     };
}
