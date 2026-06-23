using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.StdRequisitions.Snapshots;
using VanDriverRequisitions.Domain.Entities.STD;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Mappings;

public static class StdRequisitionSubmissionMapper
{
    public static StdRequisitionSubmissionDetailDto MapStdSubmissionToDetailDto(
        StdRequisitionSubmission submission,
        StdRequisitionSnapshotDto snapshot)
    {
        return new StdRequisitionSubmissionDetailDto
        {
            Id = submission.Id,
            RequisitionId = submission.StdRequisitionId,
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