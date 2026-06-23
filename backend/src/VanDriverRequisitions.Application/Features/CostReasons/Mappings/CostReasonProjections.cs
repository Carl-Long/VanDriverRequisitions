using System.Linq.Expressions;
using VanDriverRequisitions.Application.Features.CostReasons.Dtos;
using VanDriverRequisitions.Domain.Entities.Common;

namespace VanDriverRequisitions.Application.Features.CostReasons.Mappings;

public static class CostReasonProjections
{
    public static Expression<Func<CostReason, CostReasonSummaryDto>> AsSummaryDto =>
        x => new CostReasonSummaryDto
        {
            Id = x.Id,
            Code = x.Code,
            Reason = x.Reason,
            Scope = x.Scope,
            ScopeName = x.Scope.ToString(),
            IsActive = x.IsActive,
            CreatedAtUtc = x.CreatedAtUtc,
            CreatedByNameSnapshot = x.CreatedByNameSnapshot,
            UpdatedAtUtc = x.UpdatedAtUtc,
            UpdatedByNameSnapshot = x.UpdatedByNameSnapshot
        };

    public static Expression<Func<CostReason, CostReasonLookupDto>> AsLookupDto =>
        x => new CostReasonLookupDto
        {
            Id = x.Id,
            Code = x.Code,
            Reason = x.Reason
        };
}