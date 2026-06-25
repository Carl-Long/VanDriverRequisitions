using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.UnitTests.TestData;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.STD;

public sealed class StdRequisitionSubmissionWorkflowTests
{
    private static readonly DateTime SubmittedAtUtc = new(2026, 6, 13, 10, 0, 0, DateTimeKind.Utc);
    private static readonly DateTime ReviewedAtUtc = new(2026, 6, 14, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void Submit_WhenDraft_SetsSubmittedStateAndCreatesPendingSubmission()
    {
        // Arrange
        var requisition = CreateRequisition();
        var submittedBy = StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Submitter");

        // Act
        requisition.Submit(submittedBy, SubmittedAtUtc, snapshotJson: "{}");

        // Assert
        Assert.Equal(RequisitionStatus.Submitted, requisition.Status);
        Assert.False(requisition.CanEdit);
        Assert.False(requisition.CanSubmit);

        Assert.Equal(submittedBy.Id, requisition.SubmittedById);
        Assert.Equal("Submitter", requisition.SubmittedByNameSnapshot);
        Assert.Equal(SubmittedAtUtc, requisition.SubmittedAtUtc);

        Assert.Single(requisition.Submissions);
        Assert.NotNull(requisition.PendingSubmission);
        Assert.NotNull(requisition.LatestSubmission);
        Assert.Equal(2, requisition.NextSubmissionNumber);

        var submission = requisition.PendingSubmission!;

        Assert.Equal(1, submission.SubmissionNumber);
        Assert.Equal(SubmissionStatus.Pending, submission.Status);
        Assert.Equal(submittedBy.Id, submission.SubmittedById);
        Assert.Equal("Submitter", submission.SubmittedByNameSnapshot);
        Assert.Equal(SubmittedAtUtc, submission.SubmittedAtUtc);
        Assert.Equal("{}", submission.SnapshotJson);
    }

    [Fact]
    public void Submit_WhenSubmitted_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateSubmittedRequisition();

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            requisition.Submit(
                StdRequisitionTestData.CreateAuditUser(),
                SubmittedAtUtc.AddHours(1),
                snapshotJson: "{}"));
    }

    [Fact]
    public void ApproveSubmission_WhenPendingSubmissionExists_ApprovesSubmissionAndRequisition()
    {
        // Arrange
        var requisition = CreateSubmittedRequisition();
        var approvedBy = StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Approver");

        // Act
        requisition.ApproveSubmission(approvedBy, ReviewedAtUtc, poNumber: "PO-123");

        // Assert
        Assert.Equal(RequisitionStatus.Approved, requisition.Status);
        Assert.False(requisition.CanEdit);
        Assert.False(requisition.CanSubmit);

        Assert.Equal(approvedBy.Id, requisition.ApprovedById);
        Assert.Equal("Approver", requisition.ApprovedByNameSnapshot);
        Assert.Equal(ReviewedAtUtc, requisition.ApprovedAtUtc);
        Assert.Equal("PO-123", requisition.PoNumber);

        Assert.Null(requisition.RejectedById);
        Assert.Null(requisition.RejectedByNameSnapshot);
        Assert.Null(requisition.RejectedAtUtc);
        Assert.Null(requisition.RejectionNotes);

        Assert.Null(requisition.PendingSubmission);
        Assert.NotNull(requisition.LatestSubmission);

        var submission = requisition.LatestSubmission!;

        Assert.Equal(SubmissionStatus.Approved, submission.Status);
        Assert.Equal(approvedBy.Id, submission.ReviewedById);
        Assert.Equal("Approver", submission.ReviewedByNameSnapshot);
        Assert.Equal(ReviewedAtUtc, submission.ReviewedAtUtc);
        Assert.Equal("PO-123", submission.PoNumber);
        Assert.Null(submission.RejectionNotes);
    }

    [Fact]
    public void RejectSubmission_WhenPendingSubmissionExists_RejectsSubmissionAndRequisition()
    {
        // Arrange
        var requisition = CreateSubmittedRequisition();
        var rejectedBy = StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Rejecter");

        // Act
        requisition.RejectSubmission(rejectedBy, ReviewedAtUtc, rejectionNotes: "Incorrect rate.");

        // Assert
        Assert.Equal(RequisitionStatus.Rejected, requisition.Status);
        Assert.True(requisition.CanEdit);
        Assert.True(requisition.CanSubmit);

        Assert.Equal(rejectedBy.Id, requisition.RejectedById);
        Assert.Equal("Rejecter", requisition.RejectedByNameSnapshot);
        Assert.Equal(ReviewedAtUtc, requisition.RejectedAtUtc);
        Assert.Equal("Incorrect rate.", requisition.RejectionNotes);

        Assert.Null(requisition.ApprovedById);
        Assert.Null(requisition.ApprovedByNameSnapshot);
        Assert.Null(requisition.ApprovedAtUtc);
        Assert.Null(requisition.PoNumber);

        Assert.Null(requisition.PendingSubmission);
        Assert.NotNull(requisition.LatestSubmission);

        var submission = requisition.LatestSubmission!;

        Assert.Equal(SubmissionStatus.Rejected, submission.Status);
        Assert.Equal(rejectedBy.Id, submission.ReviewedById);
        Assert.Equal("Rejecter", submission.ReviewedByNameSnapshot);
        Assert.Equal(ReviewedAtUtc, submission.ReviewedAtUtc);
        Assert.Equal("Incorrect rate.", submission.RejectionNotes);
        Assert.Null(submission.PoNumber);
    }

    [Fact]
    public void ApproveSubmission_WhenNoPendingSubmissionExists_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateRequisition();

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            requisition.ApproveSubmission(
                StdRequisitionTestData.CreateAuditUser(),
                ReviewedAtUtc,
                poNumber: "PO-123"));
    }

    private static StdRequisition CreateRequisition()
    {
        return StdRequisition.Create(StdRequisitionTestData.RequisitionNumber, StdRequisitionTestData.CreateUpdateModel());
    }

    private static StdRequisition CreateSubmittedRequisition()
    {
        var requisition = CreateRequisition();

        requisition.Submit(
            StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Submitter"),
            SubmittedAtUtc,
            snapshotJson: "{}");

        return requisition;
    }
}