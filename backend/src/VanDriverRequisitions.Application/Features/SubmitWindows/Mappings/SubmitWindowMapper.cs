using VanDriverRequisitions.Application.Features.SubmitWindows.Dtos;
using VanDriverRequisitions.Domain.Entities.Common;

namespace VanDriverRequisitions.Application.Features.SubmitWindows.Mappings;

public static class SubmitWindowMapper
{
    public static SubmitWindowDto ToSummaryDto(SubmitWindow entity)
    {
        return new SubmitWindowDto
        {
            Id = entity.Id,
            OpenFrom = entity.OpenFrom,
            OpenTo = entity.OpenTo,
            IsDeleted = entity.DeletedAtUtc != null,
            CreatedAtUtc = entity.CreatedAtUtc,
            CreatedByNameSnapshot = entity.CreatedByNameSnapshot,
            UpdatedAtUtc = entity.UpdatedAtUtc,
            UpdatedByNameSnapshot = entity.UpdatedByNameSnapshot
        };
    }
}
