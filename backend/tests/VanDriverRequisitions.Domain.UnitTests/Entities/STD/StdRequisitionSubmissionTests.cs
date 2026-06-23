using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.UnitTests.TestData;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.STD;

public sealed class StdRequisitionSubmissionTests
{
    private static readonly DateTime SubmittedAtUtc = new(2026, 6, 13, 10, 0, 0, DateTimeKind.Utc);
    private static readonly DateTime ReviewedAtUtc = new(2026, 6, 14, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void Create_WhenValid_CreatesPendingSubmission()
    {
        // Arrange
        var submittedBy = StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Submitter");

        // Act
        var submission = StdRequisitionSubmission.Create(submissionNumber: 1, submittedBy, SubmittedAtUtc, snapshotJson: "{}");

        // Assert
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

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Create_WhenSubmissionNumberIsZeroOrNegative_ThrowsArgumentOutOfRangeException(int submissionNumber)
    {
        // Act
        var exception = Assert.Throws<ArgumentOutOfRangeException>(() =>
            StdRequisitionSubmission.Create(
                submissionNumber,
                StdRequisitionTestData.CreateAuditUser(),
                SubmittedAtUtc,
                snapshotJson: "{}"));

        // Assert
        Assert.Equal("submissionNumber", exception.ParamName);
    }

    [Fact]
    public void Approve_WhenPending_SetsApprovedStateAndReviewFields()
    {
        // Arrange
        var submission = CreateSubmission();
        var reviewedBy = StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Approver");

        // Act
        submission.Approve(reviewedBy, ReviewedAtUtc, poNumber: "PO-123");

        // Assert
        Assert.Equal(SubmissionStatus.Approved, submission.Status);
        Assert.Equal(reviewedBy.Id, submission.ReviewedById);
        Assert.Equal("Approver", submission.ReviewedByNameSnapshot);
        Assert.Equal(ReviewedAtUtc, submission.ReviewedAtUtc);
        Assert.Equal("PO-123", submission.PoNumber);
        Assert.Null(submission.RejectionNotes);
    }

    [Fact]
    public void Reject_WhenPending_SetsRejectedStateAndReviewFields()
    {
        // Arrange
        var submission = CreateSubmission();
        var reviewedBy = StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Rejecter");

        // Act
        submission.Reject(reviewedBy, ReviewedAtUtc, rejectionNotes: "Incorrect rate.");

        // Assert
        Assert.Equal(SubmissionStatus.Rejected, submission.Status);
        Assert.Equal(reviewedBy.Id, submission.ReviewedById);
        Assert.Equal("Rejecter", submission.ReviewedByNameSnapshot);
        Assert.Equal(ReviewedAtUtc, submission.ReviewedAtUtc);
        Assert.Equal("Incorrect rate.", submission.RejectionNotes);
        Assert.Null(submission.PoNumber);
    }

    [Fact]
    public void Approve_WhenAlreadyApproved_ThrowsInvalidOperationException()
    {
        // Arrange
        var submission = CreateSubmission();

        submission.Approve(
            StdRequisitionTestData.CreateAuditUser(nameSnapshot: "First Approver"),
            ReviewedAtUtc,
            poNumber: "PO-123");

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            submission.Approve(
                StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Second Approver"),
                ReviewedAtUtc.AddHours(1),
                poNumber: "PO-456"));
    }

    private static StdRequisitionSubmission CreateSubmission()
    {
        return StdRequisitionSubmission.Create(
            submissionNumber: 1,
            StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Submitter"),
            SubmittedAtUtc,
            snapshotJson: "{}");
    }
}