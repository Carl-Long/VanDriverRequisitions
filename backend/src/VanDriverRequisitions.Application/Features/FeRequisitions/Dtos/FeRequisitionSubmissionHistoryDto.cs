namespace VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

public sealed class FeRequisitionSubmissionHistoryDto
{
    public Guid Id { get; init; }
    public int SubmissionNumber { get; init; }
    public string Status { get; init; } = string.Empty;
    public string SubmittedByName { get; init; } = string.Empty;
    public DateTime SubmittedAtUtc { get; init; }
    public string? ReviewedByName { get; init; }
    public DateTime? ReviewedAtUtc { get; init; }
    public string? RejectionNotes { get; init; }
}