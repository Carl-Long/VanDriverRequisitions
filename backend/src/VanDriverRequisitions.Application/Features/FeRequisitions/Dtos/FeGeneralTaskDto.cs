namespace VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

public class FeGeneralTaskDto
{
    public Guid? Id { get; init; }
    public Guid FeTaskTypeId { get; init; }
    public string TaskTypeName { get; init; } = string.Empty;
    public string TaskTypeCode { get; init; } = string.Empty;
    public DateOnly WeekEndingDate { get; init; }
    public WeeklyQuantitiesDto Week { get; init; } = new();
    public decimal? RatePerJob { get; init; }
    public int TotalNumber { get; init; }
    public decimal? TotalValue { get; init; }
}
