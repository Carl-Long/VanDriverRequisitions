namespace VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

public sealed class FeMileageDetailDto
{
    public Guid Id { get; init; }
    public DateOnly WeekEndingDate { get; init; }
    public required WeeklyQuantitiesDto Week { get; init; }
    public int? TotalMiles { get; init; }
    public decimal? RatePerMile { get; init; }
    public decimal? TotalValue { get; init; }
}