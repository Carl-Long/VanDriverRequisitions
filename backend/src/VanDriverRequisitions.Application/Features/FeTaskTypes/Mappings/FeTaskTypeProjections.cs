using System.Linq.Expressions;
using VanDriverRequisitions.Application.Features.FeTaskTypes.Dtos;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Application.Features.FeTaskTypes.Mappings;

public static class FeTaskTypeProjections
{
    public static Expression<Func<FeTaskType, FeTaskTypeDto>> AsSummaryDto =>
        x => new FeTaskTypeDto
        {
            Id = x.Id,
            Name = x.Name,
            Code = x.Code,
            IsActive = x.IsActive,
            DailyQuantityLimitId = x.DailyQuantityLimitId,
            DailyQuantityMax = x.DailyQuantityLimit != null ? x.DailyQuantityLimit.NumericalLimit : null,
            RateLimitId = x.RateLimitId,
            RateMax = x.RateLimit != null ? x.RateLimit.CurrencyLimit : null,
            CreatedAtUtc = x.CreatedAtUtc,
            CreatedByNameSnapshot = x.CreatedByNameSnapshot,
            UpdatedAtUtc = x.UpdatedAtUtc,
            UpdatedByNameSnapshot = x.UpdatedByNameSnapshot
        };
}