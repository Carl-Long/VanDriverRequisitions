namespace VanDriverRequisitions.Application.Features.FeTaskTypes.Dtos;

public class FeTaskTypeDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public Guid? DailyQuantityLimitId { get; init; }
    public int? DailyQuantityMax { get; init; }
    public Guid? RateLimitId { get; init; }
    public decimal? RateMax { get; init; }
    public DateTime CreatedAtUtc { get; init; }
    public string CreatedByNameSnapshot { get; init; } = string.Empty;
    public DateTime? UpdatedAtUtc { get; init; }
    public string? UpdatedByNameSnapshot { get; init; }
}
