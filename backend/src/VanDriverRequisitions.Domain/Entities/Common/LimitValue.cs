using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Domain.Entities.Common;

public class LimitValue : AuditableEntity
{
    public required string Title { get; set; }
    public required string NameOfValue { get; set; }
    public Fascia? Fascia { get; set; }
    public LimitationType TypeOfLimitation { get; set; }
    public int? NumericalLimit { get; set; }
    public decimal? CurrencyLimit { get; set; }
}