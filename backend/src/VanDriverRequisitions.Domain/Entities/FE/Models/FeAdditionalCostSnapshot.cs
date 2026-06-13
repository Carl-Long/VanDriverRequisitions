using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Domain.Entities.FE.Models;

public sealed class FeAdditionalCostSnapshot
{
    public DateOnly WeekEndingDate { get; init; }

    public Guid ReasonId { get; init; }
    public string ReasonText { get; init; } = string.Empty;

    public ChargingOption ChargingOption { get; init; }

    public int? TotalNumber { get; init; }
    public decimal? RatePerJob { get; init; }

    public int? Miles { get; init; }
    public decimal? RatePerMile { get; init; }

    public decimal? TotalValue { get; init; }
}