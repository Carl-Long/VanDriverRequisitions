namespace VanDriverRequisitions.Domain.Entities.FE.Models;

public sealed class FeGeneralTaskSnapshot
{
    public string TaskTypeCode { get; init; } = string.Empty;
    public string TaskTypeName { get; init; } = string.Empty;
    public DateOnly WeekEndingDate { get; init; }
    public WeeklyQuantitiesSnapshot Week { get; init; } = null!;
    public int TotalNumber { get; init; }
    public decimal? RatePerJob { get; init; }
    public decimal? TotalValue { get; init; }
}