using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Domain.Entities.FE;

public sealed class FeRequisitionSubmission : AuditableEntity
{
    private FeRequisitionSubmission() { }

    public Guid FeRequisitionId { get; private set; }
    public int SubmissionNumber { get; private set; }
    public SubmissionStatus Status { get; private set; }
    public Guid SubmittedById { get; private set; }
    public string SubmittedByNameSnapshot { get; private set; } = string.Empty;
    public DateTime SubmittedAtUtc { get; private set; }
    public Guid? ReviewedById { get; private set; }
    public string? ReviewedByNameSnapshot { get; private set; }
    public DateTime? ReviewedAtUtc { get; private set; }
    public string? RejectionNotes { get; private set; }
    public string SnapshotJson { get; private set; } = string.Empty;
}