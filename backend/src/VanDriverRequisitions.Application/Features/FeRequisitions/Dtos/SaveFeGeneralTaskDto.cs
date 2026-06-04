namespace VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

public sealed class SaveFeGeneralTaskDto
{
    public Guid? Id { get; set; }
    public Guid DriverId { get; set; }
    public Guid FeTaskTypeId { get; init; }
    public DateOnly WeekEndingDate { get; init; }
    public required WeeklyQuantitiesDto Week { get; init; }
    public decimal? RatePerJob { get; init; }
}