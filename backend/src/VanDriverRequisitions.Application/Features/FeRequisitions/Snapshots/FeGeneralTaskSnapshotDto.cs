namespace VanDriverRequisitions.Application.Features.FeRequisitions.Snapshots;

public sealed class FeGeneralTaskSnapshotDto
{
    public string TaskTypeCode { get; init; } = string.Empty;
    public string TaskTypeName { get; init; } = string.Empty;
    public DateOnly WeekEndingDate { get; init; }
    public WeeklyQuantitiesSnapshotDto Week { get; init; } = null!;
    public int TotalNumber { get; init; }
    public decimal RatePerJob { get; init; }
    public decimal TotalValue { get; init; }
}