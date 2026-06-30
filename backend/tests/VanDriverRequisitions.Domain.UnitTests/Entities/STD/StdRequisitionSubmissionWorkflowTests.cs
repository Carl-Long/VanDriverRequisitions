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
        var requisition = CreateRequisition();
        var submittedBy = StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Submitter");

        requisition.Submit(submittedBy, SubmittedAtUtc, snapshotJson: "{}");

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
        var requisition = CreateSubmittedRequisition();

        Assert.Throws<InvalidOperationException>(() =>
            requisition.Submit(
                StdRequisitionTestData.CreateAuditUser(),
                SubmittedAtUtc.AddHours(1),
                snapshotJson: "{}"));
    }
    
    [Fact]
    public void Submit_WhenSubtotalIsZero_ThrowsInvalidOperationException()
    {
        // Arrange
        var zeroValueModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers: [],
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            additionalCosts: []);

        var requisition = StdRequisition.Create(StdRequisitionTestData.RequisitionNumber, zeroValueModel);

        Assert.Equal(0m, requisition.Subtotal);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            requisition.Submit(StdRequisitionTestData.CreateAuditUser(), SubmittedAtUtc, snapshotJson: "{}"));

        Assert.Equal(RequisitionStatus.Draft, requisition.Status);
        Assert.Empty(requisition.Submissions);
    }

    [Fact]
    public void Submit_WhenSubmittedByIsNull_ThrowsArgumentNullException()
    {
        var requisition = CreateRequisition();

        var exception = Assert.Throws<ArgumentNullException>(() =>
            requisition.Submit(submittedBy: null!, SubmittedAtUtc, snapshotJson: "{}"));

        Assert.Equal("submittedBy", exception.ParamName);
    }

    [Fact]
    public void Submit_WhenSnapshotJsonIsNull_ThrowsArgumentNullException()
    {
        var requisition = CreateRequisition();

        var exception = Assert.Throws<ArgumentNullException>(() =>
            requisition.Submit(
                StdRequisitionTestData.CreateAuditUser(),
                SubmittedAtUtc,
                snapshotJson: null!));

        Assert.Equal("snapshotJson", exception.ParamName);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Submit_WhenSnapshotJsonIsEmptyOrWhitespace_ThrowsArgumentException(string snapshotJson)
    {
        var requisition = CreateRequisition();

        var exception = Assert.Throws<ArgumentException>(() =>
            requisition.Submit(
                StdRequisitionTestData.CreateAuditUser(),
                SubmittedAtUtc,
                snapshotJson));

        Assert.Equal("snapshotJson", exception.ParamName);
    }

    [Fact]
    public void Submit_AfterRejection_CreatesNextPendingSubmissionAndIncrementsSubmissionNumber()
    {
        var requisition = CreateSubmittedRequisition();

        requisition.RejectSubmission(
            StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Rejecter"),
            ReviewedAtUtc,
            rejectionNotes: "Incorrect rate.");

        requisition.Submit(
            StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Submitter 2"),
            SubmittedAtUtc.AddDays(1),
            snapshotJson: "{\"version\":2}");

        Assert.Equal(RequisitionStatus.Submitted, requisition.Status);
        Assert.False(requisition.CanEdit);
        Assert.False(requisition.CanSubmit);

        Assert.Equal(2, requisition.Submissions.Count);
        Assert.Equal(3, requisition.NextSubmissionNumber);

        var latestSubmission = requisition.LatestSubmission!;
        var pendingSubmission = requisition.PendingSubmission!;

        Assert.Same(latestSubmission, pendingSubmission);
        Assert.Equal(2, pendingSubmission.SubmissionNumber);
        Assert.Equal(SubmissionStatus.Pending, pendingSubmission.Status);
        Assert.Equal("Submitter 2", pendingSubmission.SubmittedByNameSnapshot);
        Assert.Equal("{\"version\":2}", pendingSubmission.SnapshotJson);

        var rejectedSubmission = requisition.Submissions.Single(x => x.SubmissionNumber == 1);
        Assert.Equal(SubmissionStatus.Rejected, rejectedSubmission.Status);
        Assert.Equal("Incorrect rate.", rejectedSubmission.RejectionNotes);

        Assert.Null(requisition.RejectedById);
        Assert.Null(requisition.RejectedByNameSnapshot);
        Assert.Null(requisition.RejectedAtUtc);
        Assert.Null(requisition.RejectionNotes);
    }

    [Fact]
    public void ApproveSubmission_WhenPendingSubmissionExists_ApprovesSubmissionAndRequisition()
    {
        var requisition = CreateSubmittedRequisition();
        var approvedBy = StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Approver");

        requisition.ApproveSubmission(approvedBy, ReviewedAtUtc, poNumber: "PO-123");

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
        var requisition = CreateSubmittedRequisition();
        var rejectedBy = StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Rejecter");

        requisition.RejectSubmission(rejectedBy, ReviewedAtUtc, rejectionNotes: "Incorrect rate.");

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
        var requisition = CreateRequisition();

        Assert.Throws<InvalidOperationException>(() =>
            requisition.ApproveSubmission(
                StdRequisitionTestData.CreateAuditUser(),
                ReviewedAtUtc,
                poNumber: "PO-123"));
    }

    [Fact]
    public void RejectSubmission_WhenNoPendingSubmissionExists_ThrowsInvalidOperationException()
    {
        var requisition = CreateRequisition();

        Assert.Throws<InvalidOperationException>(() =>
            requisition.RejectSubmission(
                StdRequisitionTestData.CreateAuditUser(),
                ReviewedAtUtc,
                rejectionNotes: "Incorrect rate."));
    }

    [Fact]
    public void ApproveSubmission_WhenAlreadyApproved_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateSubmittedRequisition();

        requisition.ApproveSubmission(
            StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Approver"),
            ReviewedAtUtc,
            poNumber: "PO-123");

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            requisition.ApproveSubmission(
                StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Second Approver"),
                ReviewedAtUtc.AddHours(1),
                poNumber: "PO-456"));

        Assert.Equal(RequisitionStatus.Approved, requisition.Status);
        Assert.Null(requisition.PendingSubmission);
        Assert.Equal(SubmissionStatus.Approved, requisition.LatestSubmission!.Status);
    }

    [Fact]
    public void RejectSubmission_WhenAlreadyApproved_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateSubmittedRequisition();

        requisition.ApproveSubmission(
            StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Approver"),
            ReviewedAtUtc,
            poNumber: "PO-123");

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            requisition.RejectSubmission(
                StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Rejecter"),
                ReviewedAtUtc.AddHours(1),
                rejectionNotes: "Reject after approval."));

        Assert.Equal(RequisitionStatus.Approved, requisition.Status);
        Assert.Null(requisition.PendingSubmission);
        Assert.Equal(SubmissionStatus.Approved, requisition.LatestSubmission!.Status);
    }

    [Fact]
    public void ApproveSubmission_WhenRejectedWithoutResubmission_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateSubmittedRequisition();

        requisition.RejectSubmission(
            StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Rejecter"),
            ReviewedAtUtc,
            rejectionNotes: "Incorrect rate.");

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            requisition.ApproveSubmission(
                StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Approver"),
                ReviewedAtUtc.AddHours(1),
                poNumber: "PO-123"));

        Assert.Equal(RequisitionStatus.Rejected, requisition.Status);
        Assert.Null(requisition.PendingSubmission);
        Assert.Equal(SubmissionStatus.Rejected, requisition.LatestSubmission!.Status);
    }

    [Fact]
    public void RejectSubmission_WhenRejectedWithoutResubmission_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateSubmittedRequisition();

        requisition.RejectSubmission(
            StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Rejecter"),
            ReviewedAtUtc,
            rejectionNotes: "Incorrect rate.");

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            requisition.RejectSubmission(
                StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Second Rejecter"),
                ReviewedAtUtc.AddHours(1),
                rejectionNotes: "Reject again."));

        Assert.Equal(RequisitionStatus.Rejected, requisition.Status);
        Assert.Null(requisition.PendingSubmission);
        Assert.Equal(SubmissionStatus.Rejected, requisition.LatestSubmission!.Status);
    }

    [Fact]
    public void ApproveSubmission_WhenApprovedByIsNull_ThrowsArgumentNullException()
    {
        var requisition = CreateSubmittedRequisition();

        var exception = Assert.Throws<ArgumentNullException>(() =>
            requisition.ApproveSubmission(approvedBy: null!, ReviewedAtUtc, poNumber: "PO-123"));

        Assert.Equal("approvedBy", exception.ParamName);
    }

    [Fact]
    public void RejectSubmission_WhenRejectedByIsNull_ThrowsArgumentNullException()
    {
        var requisition = CreateSubmittedRequisition();

        var exception = Assert.Throws<ArgumentNullException>(() =>
            requisition.RejectSubmission(rejectedBy: null!, ReviewedAtUtc, rejectionNotes: "Incorrect rate."));

        Assert.Equal("rejectedBy", exception.ParamName);
    }

    [Fact]
    public void ApproveSubmission_WhenPoNumberIsNull_ThrowsArgumentNullException()
    {
        var requisition = CreateSubmittedRequisition();

        var exception = Assert.Throws<ArgumentNullException>(() =>
            requisition.ApproveSubmission(
                StdRequisitionTestData.CreateAuditUser(),
                ReviewedAtUtc,
                poNumber: null!));

        Assert.Equal("poNumber", exception.ParamName);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void ApproveSubmission_WhenPoNumberIsEmptyOrWhitespace_ThrowsArgumentException(string poNumber)
    {
        var requisition = CreateSubmittedRequisition();

        var exception = Assert.Throws<ArgumentException>(() =>
            requisition.ApproveSubmission(
                StdRequisitionTestData.CreateAuditUser(),
                ReviewedAtUtc,
                poNumber));

        Assert.Equal("poNumber", exception.ParamName);
    }

    [Fact]
    public void RejectSubmission_WhenRejectionNotesIsNull_ThrowsArgumentNullException()
    {
        var requisition = CreateSubmittedRequisition();

        var exception = Assert.Throws<ArgumentNullException>(() =>
            requisition.RejectSubmission(
                StdRequisitionTestData.CreateAuditUser(),
                ReviewedAtUtc,
                rejectionNotes: null!));

        Assert.Equal("rejectionNotes", exception.ParamName);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void RejectSubmission_WhenRejectionNotesIsEmptyOrWhitespace_ThrowsArgumentException(string rejectionNotes)
    {
        var requisition = CreateSubmittedRequisition();

        var exception = Assert.Throws<ArgumentException>(() =>
            requisition.RejectSubmission(
                StdRequisitionTestData.CreateAuditUser(),
                ReviewedAtUtc,
                rejectionNotes));

        Assert.Equal("rejectionNotes", exception.ParamName);
    }

    [Fact]
    public void Submit_WhenSubmittedAtUtcIsDefault_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateRequisition();

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            requisition.Submit(
                StdRequisitionTestData.CreateAuditUser(),
                submittedAtUtc: default,
                snapshotJson: "{}"));
    }

    [Fact]
    public void ApproveSubmission_WhenApprovedAtUtcIsDefault_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateSubmittedRequisition();

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            requisition.ApproveSubmission(
                StdRequisitionTestData.CreateAuditUser(),
                approvedAtUtc: default,
                poNumber: "PO-123"));
    }

    [Fact]
    public void RejectSubmission_WhenRejectedAtUtcIsDefault_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateSubmittedRequisition();

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            requisition.RejectSubmission(
                StdRequisitionTestData.CreateAuditUser(),
                rejectedAtUtc: default,
                rejectionNotes: "Incorrect rate."));
    }

    private static StdRequisition CreateRequisition()
    {
        return StdRequisition.Create(
            StdRequisitionTestData.RequisitionNumber,
            StdRequisitionTestData.CreateUpdateModel());
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