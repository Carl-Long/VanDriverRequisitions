using System.Linq.Expressions;
using VanDriverRequisitions.Application.Features.FeReasons.Dtos;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Application.Features.FeReasons.Mappings;

public static class FeReasonProjections
{
    public static Expression<Func<FeReason, FeReasonSummaryDto>> AsSummaryDto =>
        x => new FeReasonSummaryDto()
        {
            Id = x.Id,
            Reason = x.Reason,
            IsActive = x.IsActive,
            CreatedAtUtc = x.CreatedAtUtc,
            CreatedByNameSnapshot = x.CreatedByNameSnapshot,
            UpdatedAtUtc = x.UpdatedAtUtc,
            UpdatedByNameSnapshot = x.UpdatedByNameSnapshot
        };
}
