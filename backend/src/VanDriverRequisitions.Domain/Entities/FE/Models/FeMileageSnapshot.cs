namespace VanDriverRequisitions.Domain.Entities.FE.Models;

public sealed class FeMileageSnapshot
{
    public DateOnly WeekEndingDate { get; init; }
    public WeeklyQuantitiesSnapshot Week { get; init; } = null!;
    public int TotalMiles { get; init; }
    public decimal RatePerMile { get; init; }
    public decimal TotalValue { get; init; }
}