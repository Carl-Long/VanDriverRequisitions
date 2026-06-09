using VanDriverRequisitions.Application.Features.FeReasons.Dtos;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Application.Features.FeReasons.Mappings;

public static class FeReasonMapper
{
    public static FeReasonSummaryDto ToSummaryDto(FeReason entity)
    {
        return new FeReasonSummaryDto
        {
            Id = entity.Id,
            Reason = entity.Reason,
            IsActive = entity.IsActive,
            CreatedAtUtc = entity.CreatedAtUtc,
            CreatedByNameSnapshot = entity.CreatedByNameSnapshot,
            UpdatedAtUtc = entity.UpdatedAtUtc,
            UpdatedByNameSnapshot = entity.UpdatedByNameSnapshot
        };
    }
}
