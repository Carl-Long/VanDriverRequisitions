using System.Linq.Expressions;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Mappings;

public static class FeRequisitionProjections
{
    public static Expression<Func<FeRequisition, FeRequisitionSummaryDto>> AsSummaryDto =>
        x => new FeRequisitionSummaryDto
        {
            Id = x.Id,
            RequisitionNumber = x.RequisitionNumber,
            RequisitionDate = x.RequisitionDate,
            VanDriverCode = x.VanDriverCode,
            VanDriverName = x.VanDriverName,
            TradersName = x.TradersName,
            ShopCode = x.ShopCode,
            ShopName = x.ShopName,
            Status = x.Status.ToString(),
            Subtotal = x.Subtotal,
            CreatedAtUtc = x.CreatedAtUtc,
            CreatedById = x.CreatedById,
            CreatedByNameSnapshot = x.CreatedByNameSnapshot,
        };
}
