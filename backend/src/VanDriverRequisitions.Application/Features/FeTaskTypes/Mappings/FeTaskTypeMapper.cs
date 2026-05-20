using VanDriverRequisitions.Application.Features.FeTaskTypes.Dtos;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Application.Features.FeTaskTypes.Mappings;

public static class FeTaskTypeMapper
{
    public static FeTaskTypeDto ToSummaryDto(FeTaskType entity)
    {
        return new FeTaskTypeDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Code = entity.Code,
            IsActive = entity.IsActive,
            DailyQuantityLimitId = entity.DailyQuantityLimitId,
            DailyQuantityMax = entity.DailyQuantityLimit?.NumericalLimit,
            RateLimitId = entity.RateLimitId,
            RateMax = entity.RateLimit?.CurrencyLimit,
            CreatedAtUtc = entity.CreatedAtUtc,
            CreatedByNameSnapshot = entity.CreatedByNameSnapshot,
            UpdatedAtUtc = entity.UpdatedAtUtc,
            UpdatedByNameSnapshot = entity.UpdatedByNameSnapshot
        };
    }
}