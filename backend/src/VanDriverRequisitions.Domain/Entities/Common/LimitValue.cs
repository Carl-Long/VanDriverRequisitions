using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Domain.Entities.Common;

public class LimitValue : AuditableEntity
{
    public required string Title { get; init; }
    public required string NameOfValue { get; init; }
    public Fascia? Fascia { get; init; }
    public LimitationType TypeOfLimitation { get; init; }
    public int? NumericalLimit { get; init; }
    public decimal? CurrencyLimit { get; init; }
}