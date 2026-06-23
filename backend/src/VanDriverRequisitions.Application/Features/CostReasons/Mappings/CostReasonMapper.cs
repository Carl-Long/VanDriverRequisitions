using VanDriverRequisitions.Application.Features.CostReasons.Dtos;
using VanDriverRequisitions.Domain.Entities.Common;

namespace VanDriverRequisitions.Application.Features.CostReasons.Mappings;

public static class CostReasonMapper
{
    public static CostReasonSummaryDto ToSummaryDto(CostReason entity)
    {
        return new CostReasonSummaryDto
        {
            Id = entity.Id,
            Code = entity.Code,
            Reason = entity.Reason,
            Scope = entity.Scope,
            ScopeName = entity.Scope.ToString(),
            IsActive = entity.IsActive,
            CreatedAtUtc = entity.CreatedAtUtc,
            CreatedByNameSnapshot = entity.CreatedByNameSnapshot,
            UpdatedAtUtc = entity.UpdatedAtUtc,
            UpdatedByNameSnapshot = entity.UpdatedByNameSnapshot
        };
    }
}