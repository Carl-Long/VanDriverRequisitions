using VanDriverRequisitions.Application.Features.LimitValues.Dtos;
using VanDriverRequisitions.Domain.Entities.Common;

namespace VanDriverRequisitions.Application.Features.LimitValues.Mappings;

public static class LimitValueMapper
{
    public static LimitValueDto ToSummaryDto(LimitValue entity)
    {
        return new LimitValueDto
        {
            Id = entity.Id,
            Title = entity.Title,
            NameOfValue = entity.NameOfValue,
            Fascia = entity.Fascia,
            TypeOfLimitation = entity.TypeOfLimitation,
            NumericalLimit = entity.NumericalLimit,
            CurrencyLimit = entity.CurrencyLimit,
            IsActive = entity.IsActive,
            CreatedAtUtc = entity.CreatedAtUtc,
            CreatedByNameSnapshot = entity.CreatedByNameSnapshot,
            UpdatedAtUtc = entity.UpdatedAtUtc,
            UpdatedByNameSnapshot = entity.UpdatedByNameSnapshot
        };
    }
}
