namespace VanDriverRequisitions.Application.Features.FeRequisitions.Snapshots;

public sealed class FeRequisitionSubmissionDetailDto
{
    public Guid Id { get; init; }
    public Guid RequisitionId { get; init; }
    public int SubmissionNumber { get; init; }
    public string Status { get; init; } = string.Empty;
    public string SubmittedByName { get; init; } = string.Empty;
    public DateTime SubmittedAtUtc { get; init; }
    public string? PoNumber { get; init; }
    public string? ReviewedByName { get; init; }
    public DateTime? ReviewedAtUtc { get; init; }
    public string? RejectionNotes { get; init; }
    public FeRequisitionSnapshotDto Snapshot { get; init; } = null!;
}