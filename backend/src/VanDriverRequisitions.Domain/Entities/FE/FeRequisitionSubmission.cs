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
    
    public static FeRequisitionSubmission Create(
        int submissionNumber,
        Guid submittedById,
        string submittedByName,
        DateTime submittedAtUtc,
        string snapshotJson)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(submittedByName);
        ArgumentException.ThrowIfNullOrWhiteSpace(snapshotJson);
        
        return new FeRequisitionSubmission
        {
            SubmissionNumber = submissionNumber,
            Status = SubmissionStatus.Pending,
            SubmittedById = submittedById,
            SubmittedByNameSnapshot = submittedByName,
            SubmittedAtUtc = submittedAtUtc,
            SnapshotJson = snapshotJson
        };
    }
    
    public void Approve(Guid reviewedById, string reviewedByName, DateTime reviewedAtUtc)
    {
        if (Status != SubmissionStatus.Pending)
        {
            throw new InvalidOperationException("Only pending submissions can be approved.");
        }

        Status = SubmissionStatus.Approved;
        ReviewedById = reviewedById;
        ReviewedByNameSnapshot = reviewedByName;
        ReviewedAtUtc = reviewedAtUtc;
        RejectionNotes = null;
    }
    
    public void Reject(Guid reviewedById, string reviewedByName, string rejectionNotes, DateTime reviewedAtUtc)
    {
        if (Status != SubmissionStatus.Pending)
        {
            throw new InvalidOperationException("Only pending submissions can be rejected.");
        }

        Status = SubmissionStatus.Rejected;
        ReviewedById = reviewedById;
        ReviewedByNameSnapshot = reviewedByName;
        ReviewedAtUtc = reviewedAtUtc;
        RejectionNotes = rejectionNotes;
    }
}