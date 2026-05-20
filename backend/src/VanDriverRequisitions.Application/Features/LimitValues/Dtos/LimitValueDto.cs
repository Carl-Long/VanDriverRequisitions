using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.LimitValues.Dtos;

public class LimitValueDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string NameOfValue { get; init; } = string.Empty;
    public Fascia? Fascia { get; init; }
    public LimitationType TypeOfLimitation { get; init; }
    public int? NumericalLimit { get; init; }
    public decimal? CurrencyLimit { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAtUtc { get; init; }
    public string CreatedByNameSnapshot { get; init; } = string.Empty;
    public DateTime? UpdatedAtUtc { get; init; }
    public string? UpdatedByNameSnapshot { get; init; }
}
