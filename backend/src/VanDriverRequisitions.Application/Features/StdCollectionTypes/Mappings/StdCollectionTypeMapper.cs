using VanDriverRequisitions.Application.Features.StdCollectionTypes.Dtos;
using VanDriverRequisitions.Domain.Entities.STD;

namespace VanDriverRequisitions.Application.Features.StdCollectionTypes.Mappings;

public static class StdCollectionTypeMapper
{
    public static StdCollectionTypeSummaryDto ToSummaryDto(StdCollectionType entity)
    {
        return new StdCollectionTypeSummaryDto
        {
            Id = entity.Id,
            Code = entity.Code,
            Name = entity.Name,
            IsActive = entity.IsActive,
            CreatedAtUtc = entity.CreatedAtUtc,
            CreatedByNameSnapshot = entity.CreatedByNameSnapshot,
            UpdatedAtUtc = entity.UpdatedAtUtc,
            UpdatedByNameSnapshot = entity.UpdatedByNameSnapshot
        };
    }
}