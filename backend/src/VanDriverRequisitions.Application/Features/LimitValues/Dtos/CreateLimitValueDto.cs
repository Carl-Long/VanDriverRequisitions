using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.LimitValues.Dtos;

public class CreateLimitValueDto
{
    public string Title { get; init; } = string.Empty;
    public string NameOfValue { get; init; } = string.Empty;
    public Fascia? Fascia { get; init; }
    public LimitationType TypeOfLimitation { get; init; }
    public int? NumericalLimit { get; init; }
    public decimal? CurrencyLimit { get; init; }
}
