namespace VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

public sealed class SaveFeMileageDto
{
    public Guid? Id { get; set; }
    public DateOnly WeekEndingDate { get; init; }
    public required WeeklyQuantitiesDto Week { get; init; }
    public decimal? RatePerMile { get; init; }
}