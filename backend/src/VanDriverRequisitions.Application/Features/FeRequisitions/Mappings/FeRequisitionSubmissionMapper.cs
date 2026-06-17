using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Mappings;

public static class FeRequisitionSubmissionMapper
{
    public static FeRequisitionSubmissionDetailDto MapFeSubmissionToDetailDto(FeRequisitionSubmission submission, FeRequisitionSnapshotDto snapshot)
    {
        return new FeRequisitionSubmissionDetailDto
        {
            Id = submission.Id,
            RequisitionId = submission.FeRequisitionId,
            SubmissionNumber = submission.SubmissionNumber,
            Status = submission.Status.ToString(),
            SubmittedByName = submission.SubmittedByNameSnapshot,
            SubmittedAtUtc = submission.SubmittedAtUtc,
            PoNumber = submission.PoNumber,
            ReviewedByName = submission.ReviewedByNameSnapshot,
            ReviewedAtUtc = submission.ReviewedAtUtc,
            RejectionNotes = submission.RejectionNotes,
            Snapshot = snapshot
        };
    }
}