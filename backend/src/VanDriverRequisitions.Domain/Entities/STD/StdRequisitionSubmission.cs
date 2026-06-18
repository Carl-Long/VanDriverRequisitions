using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Domain.Entities.STD;

public sealed class StdRequisitionSubmission : AuditableEntity
{
    private StdRequisitionSubmission() { } // EF Core

    public Guid StdRequisitionId { get; private set; }

    public int SubmissionNumber { get; private set; }
    public SubmissionStatus Status { get; private set; }

    public Guid SubmittedById { get; private set; }
    public string SubmittedByNameSnapshot { get; private set; } = string.Empty;
    public DateTime SubmittedAtUtc { get; private set; }

    public Guid? ReviewedById { get; private set; }
    public string? ReviewedByNameSnapshot { get; private set; }
    public DateTime? ReviewedAtUtc { get; private set; }

    public string? PoNumber { get; private set; }
    public string? RejectionNotes { get; private set; }

    public string SnapshotJson { get; private set; } = string.Empty;

    public static StdRequisitionSubmission Create(
        int submissionNumber,
        AuditUser submittedBy,
        DateTime submittedAtUtc,
        string snapshotJson)
    {
        if (submissionNumber <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(submissionNumber), "Submission number must be greater than zero.");
        }

        ArgumentNullException.ThrowIfNull(submittedBy);
        ArgumentException.ThrowIfNullOrWhiteSpace(snapshotJson);

        return new StdRequisitionSubmission
        {
            SubmissionNumber = submissionNumber,
            Status = SubmissionStatus.Pending,
            SubmittedById = submittedBy.Id,
            SubmittedByNameSnapshot = submittedBy.NameSnapshot,
            SubmittedAtUtc = submittedAtUtc,
            SnapshotJson = snapshotJson
        };
    }

    public void Approve(AuditUser reviewedBy, DateTime reviewedAtUtc, string poNumber)
    {
        EnsurePending();

        ArgumentNullException.ThrowIfNull(reviewedBy);
        ArgumentException.ThrowIfNullOrWhiteSpace(poNumber);

        Status = SubmissionStatus.Approved;
        ReviewedById = reviewedBy.Id;
        ReviewedByNameSnapshot = reviewedBy.NameSnapshot;
        ReviewedAtUtc = reviewedAtUtc;

        PoNumber = poNumber;
        RejectionNotes = null;
    }

    public void Reject(AuditUser reviewedBy, DateTime reviewedAtUtc, string rejectionNotes)
    {
        EnsurePending();

        ArgumentNullException.ThrowIfNull(reviewedBy);
        ArgumentException.ThrowIfNullOrWhiteSpace(rejectionNotes);

        Status = SubmissionStatus.Rejected;
        ReviewedById = reviewedBy.Id;
        ReviewedByNameSnapshot = reviewedBy.NameSnapshot;
        ReviewedAtUtc = reviewedAtUtc;

        RejectionNotes = rejectionNotes;
        PoNumber = null;
    }

    private void EnsurePending()
    {
        if (Status != SubmissionStatus.Pending)
        {
            throw new InvalidOperationException("Only pending submissions can be reviewed.");
        }
    }
}