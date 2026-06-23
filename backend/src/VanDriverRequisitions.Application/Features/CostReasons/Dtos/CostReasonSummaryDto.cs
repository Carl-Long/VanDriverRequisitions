using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.CostReasons.Dtos;

public class CostReasonSummaryDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Reason { get; init; } = string.Empty;
    public CostReasonScope Scope { get; init; }
    public string ScopeName { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public DateTime CreatedAtUtc { get; init; }
    public string CreatedByNameSnapshot { get; init; } = string.Empty;
    public DateTime? UpdatedAtUtc { get; init; }
    public string? UpdatedByNameSnapshot { get; init; }
}