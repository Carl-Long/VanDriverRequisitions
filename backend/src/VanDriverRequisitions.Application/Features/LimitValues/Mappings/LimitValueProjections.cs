using System.Linq.Expressions;
using VanDriverRequisitions.Application.Features.LimitValues.Dtos;
using VanDriverRequisitions.Domain.Entities.Common;

namespace VanDriverRequisitions.Application.Features.LimitValues.Mappings;

public static class LimitValueProjections
{
    public static Expression<Func<LimitValue, LimitValueDto>> AsSummaryDto =>
        x => new LimitValueDto
        {
            Id = x.Id,
            Title = x.Title,
            NameOfValue = x.NameOfValue,
            Fascia = x.Fascia,
            TypeOfLimitation = x.TypeOfLimitation,
            NumericalLimit = x.NumericalLimit,
            CurrencyLimit = x.CurrencyLimit,
            IsActive = x.IsActive,
            CreatedAtUtc = x.CreatedAtUtc,
            CreatedByNameSnapshot = x.CreatedByNameSnapshot,
            UpdatedAtUtc = x.UpdatedAtUtc,
            UpdatedByNameSnapshot = x.UpdatedByNameSnapshot
        };
}
