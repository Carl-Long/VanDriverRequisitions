namespace VanDriverRequisitions.Application.Features.FeReasons.Dtos;

public class FeReasonSummaryDto
{
    public Guid Id { get; init; }
    public string Reason { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public DateTime CreatedAtUtc { get; init; }
    public string CreatedByNameSnapshot { get; init; } = string.Empty;
    public DateTime? UpdatedAtUtc { get; init; }
    public string? UpdatedByNameSnapshot { get; init; }
}