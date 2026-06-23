using System.Linq.Expressions;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Domain.Entities.STD;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Mappings;

public static class StdRequisitionProjections
{
    public static Expression<Func<StdRequisition, StdRequisitionSummaryDto>> AsSummaryDto =>
        x => new StdRequisitionSummaryDto
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
            UpdatedAtUtc = x.UpdatedAtUtc,
            UpdatedByNameSnapshot = x.UpdatedByNameSnapshot
        };
}