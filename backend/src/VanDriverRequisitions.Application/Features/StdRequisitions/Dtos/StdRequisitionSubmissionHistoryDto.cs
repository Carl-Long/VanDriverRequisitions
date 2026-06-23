namespace VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;

public sealed class StdRequisitionSubmissionHistoryDto
{
    public Guid Id { get; init; }
    public int SubmissionNumber { get; init; }
    public string Status { get; init; } = string.Empty;
    public string SubmittedByNameSnapshot { get; init; } = string.Empty;
    public string? PoNumber { get; init; }
    public DateTime SubmittedAtUtc { get; init; }
    public string? ReviewedByNameSnapshot { get; init; }
    public DateTime? ReviewedAtUtc { get; init; }
    public string? RejectionNotes { get; init; }
}