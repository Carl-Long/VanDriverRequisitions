using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

public class FeAdditionalCostDto
{
    public Guid? Id { get; init; }
    public DateOnly WeekEndingDate { get; init; }
    public Guid ReasonId { get; init; }
    public string ReasonText { get; init; } = string.Empty;
    public ChargingOption ChargingOption { get; init; }

    // Job mode
    public int? TotalNumber { get; init; }
    public decimal? RatePerJob { get; init; }

    // Mileage mode
    public int? Miles { get; init; }
    public decimal? RatePerMile { get; init; }

    public decimal? TotalValue { get; init; }
}
