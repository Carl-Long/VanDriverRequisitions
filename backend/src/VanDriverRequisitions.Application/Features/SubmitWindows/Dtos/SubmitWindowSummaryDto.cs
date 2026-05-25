namespace VanDriverRequisitions.Application.Features.SubmitWindows.Dtos;

public class SubmitWindowSummaryDto
{
    public Guid Id { get; init; }
    public DateTime OpenFrom { get; init; }
    public DateTime OpenTo { get; init; }
    public bool IsDeleted { get; init; }
    public DateTime CreatedAtUtc { get; init; }
    public string CreatedByNameSnapshot { get; init; } = string.Empty;
    public DateTime? UpdatedAtUtc { get; init; }
    public string? UpdatedByNameSnapshot { get; init; }
    public DateTime? DeletedAtUtc {get; init;}
    public string? DeletedByNameSnapshot {get; init;}

}