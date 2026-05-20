namespace VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

public class FeMileageDto
{
    public Guid? Id { get; init; }
    public DateOnly WeekEndingDate { get; init; }
    public WeeklyQuantitiesDto Week { get; init; } = new();
    public decimal? RatePerMile { get; init; }
    public int? TotalMiles { get; init; }
    public decimal? TotalValue { get; init; }
}
