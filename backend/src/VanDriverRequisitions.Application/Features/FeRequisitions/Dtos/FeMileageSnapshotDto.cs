namespace VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

public sealed class FeMileageSnapshotDto
{
    public DateOnly WeekEndingDate { get; init; }
    public WeeklyQuantitiesSnapshotDto Week { get; init; } = null!;
    public int? TotalMiles { get; init; }
    public decimal? RatePerMile { get; init; }
    public decimal? TotalValue { get; init; }
}