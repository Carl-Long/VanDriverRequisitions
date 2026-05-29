namespace VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

public sealed class FeGeneralTaskDetailDto
{
    public Guid Id { get; init; }
    public Guid FeTaskTypeId { get; init; }
    public required string TaskTypeName { get; init; }
    public required string TaskTypeCode { get; init; }
    public DateOnly WeekEndingDate { get; init; }
    public required WeeklyQuantitiesDto Week { get; init; }
    public int TotalNumber { get; init; }
    public decimal? RatePerJob { get; init; }
    public decimal? TotalValue { get; init; }
}