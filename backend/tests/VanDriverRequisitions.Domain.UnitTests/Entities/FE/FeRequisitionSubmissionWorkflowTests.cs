using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.UnitTests.TestData;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.FE;

public sealed class FeRequisitionSubmissionWorkflowTests
{
    private static readonly DateTime SubmittedAtUtc = new(2026, 6, 13, 10, 0, 0, DateTimeKind.Utc);
    private static readonly DateTime ReviewedAtUtc = new(2026, 6, 14, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void Submit_WhenDraft_SetsSubmittedStateAndCreatesPendingSubmission()
    {
        // Arrange
        var requisition = CreateRequisition();
        var submittedBy = FeRequisitionTestData.CreateAuditUser(nameSnapshot: "Submitter");

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

        Assert.Null(submission.ReviewedById);
        Assert.Null(submission.ReviewedByNameSnapshot);
        Assert.Null(submission.ReviewedAtUtc);
        Assert.Null(submission.PoNumber);
        Assert.Null(submission.RejectionNotes);
    }

    [Fact]
    public void Submit_WhenSubmitted_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateSubmittedRequisition();

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            requisition.Submit(FeRequisitionTestData.CreateAuditUser(), SubmittedAtUtc.AddHours(1), snapshotJson: "{}"));
    }

    [Fact]
    public void Submit_WhenSnapshotJsonIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var requisition = CreateRequisition();

        // Act
        var exception = Assert.Throws<ArgumentNullException>(() =>
            requisition.Submit(FeRequisitionTestData.CreateAuditUser(), SubmittedAtUtc, snapshotJson: null!));

        // Assert
        Assert.Equal("snapshotJson", exception.ParamName);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Submit_WhenSnapshotJsonIsEmptyOrWhitespace_ThrowsArgumentException(
        string snapshotJson)
    {
        // Arrange
        var requisition = CreateRequisition();

        // Act
        var exception = Assert.Throws<ArgumentException>(() =>
            requisition.Submit(FeRequisitionTestData.CreateAuditUser(), SubmittedAtUtc, snapshotJson));

        // Assert
        Assert.Equal("snapshotJson", exception.ParamName);
    }

    [Fact]
    public void Submit_WhenSubmittedByIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var requisition = CreateRequisition();

        // Act
        var exception = Assert.Throws<ArgumentNullException>(() =>
            requisition.Submit(submittedBy: null!, SubmittedAtUtc, snapshotJson: "{}"));

        // Assert
        Assert.Equal("submittedBy", exception.ParamName);
    }

    [Fact]
    public void ApproveSubmission_WhenPendingSubmissionExists_ApprovesSubmissionAndRequisition()
    {
        // Arrange
        var requisition = CreateSubmittedRequisition();

        var approvedBy = FeRequisitionTestData.CreateAuditUser(nameSnapshot: "Approver");
        
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

        var rejectedBy = FeRequisitionTestData.CreateAuditUser(nameSnapshot: "Rejecter");

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
            requisition.ApproveSubmission(FeRequisitionTestData.CreateAuditUser(), ReviewedAtUtc, poNumber: "PO-123"));
    }

    [Fact]
    public void RejectSubmission_WhenNoPendingSubmissionExists_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateRequisition();

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            requisition.RejectSubmission(FeRequisitionTestData.CreateAuditUser(), ReviewedAtUtc, rejectionNotes: "Incorrect rate."));
    }

    [Fact]
    public void ApproveSubmission_WhenApprovedByIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var requisition = CreateSubmittedRequisition();

        // Act
        var exception = Assert.Throws<ArgumentNullException>(() =>
            requisition.ApproveSubmission(approvedBy: null!, ReviewedAtUtc, poNumber: "PO-123"));

        // Assert
        Assert.Equal("approvedBy", exception.ParamName);
    }

    [Fact]
    public void RejectSubmission_WhenRejectedByIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var requisition = CreateSubmittedRequisition();

        // Act
        var exception = Assert.Throws<ArgumentNullException>(() =>
            requisition.RejectSubmission(rejectedBy: null!, ReviewedAtUtc, rejectionNotes: "Incorrect rate."));

        // Assert
        Assert.Equal("rejectedBy", exception.ParamName);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void ApproveSubmission_WhenPoNumberIsEmptyOrWhitespace_ThrowsArgumentException(string poNumber)
    {
        // Arrange
        var requisition = CreateSubmittedRequisition();

        // Act
        var exception = Assert.Throws<ArgumentException>(() =>
            requisition.ApproveSubmission(FeRequisitionTestData.CreateAuditUser(), ReviewedAtUtc, poNumber));

        // Assert
        Assert.Equal("poNumber", exception.ParamName);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void RejectSubmission_WhenRejectionNotesIsEmptyOrWhitespace_ThrowsArgumentException(string rejectionNotes)
    {
        // Arrange
        var requisition = CreateSubmittedRequisition();

        // Act
        var exception = Assert.Throws<ArgumentException>(() =>
            requisition.RejectSubmission(FeRequisitionTestData.CreateAuditUser(), ReviewedAtUtc, rejectionNotes));

        // Assert
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
                FeRequisitionTestData.CreateAuditUser(),
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
                FeRequisitionTestData.CreateAuditUser(),
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
                FeRequisitionTestData.CreateAuditUser(),
                rejectedAtUtc: default,
                rejectionNotes: "Incorrect rate."));
    }

    private static FeRequisition CreateRequisition()
    {
        return FeRequisition.Create(FeRequisitionTestData.RequisitionNumber, FeRequisitionTestData.CreateUpdateModel());
    }

    private static FeRequisition CreateSubmittedRequisition()
    {
        var requisition = CreateRequisition();

        requisition.Submit(
            FeRequisitionTestData.CreateAuditUser(nameSnapshot: "Submitter"),
            SubmittedAtUtc,
            snapshotJson: "{}");

        return requisition;
    }
}