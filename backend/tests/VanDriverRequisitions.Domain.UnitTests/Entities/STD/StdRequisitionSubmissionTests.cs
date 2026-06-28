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
        var submittedBy = StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Submitter");

        var submission = StdRequisitionSubmission.Create(
            submissionNumber: 1,
            submittedBy,
            SubmittedAtUtc,
            snapshotJson: "{}");

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
        var exception = Assert.Throws<ArgumentOutOfRangeException>(() =>
            StdRequisitionSubmission.Create(
                submissionNumber,
                StdRequisitionTestData.CreateAuditUser(),
                SubmittedAtUtc,
                snapshotJson: "{}"));

        Assert.Equal("submissionNumber", exception.ParamName);
    }

    [Fact]
    public void Create_WhenSubmittedByIsNull_ThrowsArgumentNullException()
    {
        var exception = Assert.Throws<ArgumentNullException>(() =>
            StdRequisitionSubmission.Create(
                submissionNumber: 1,
                submittedBy: null!,
                SubmittedAtUtc,
                snapshotJson: "{}"));

        Assert.Equal("submittedBy", exception.ParamName);
    }

    [Fact]
    public void Create_WhenSnapshotJsonIsNull_ThrowsArgumentNullException()
    {
        var exception = Assert.Throws<ArgumentNullException>(() =>
            StdRequisitionSubmission.Create(
                submissionNumber: 1,
                StdRequisitionTestData.CreateAuditUser(),
                SubmittedAtUtc,
                snapshotJson: null!));

        Assert.Equal("snapshotJson", exception.ParamName);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WhenSnapshotJsonIsEmptyOrWhitespace_ThrowsArgumentException(string snapshotJson)
    {
        var exception = Assert.Throws<ArgumentException>(() =>
            StdRequisitionSubmission.Create(
                submissionNumber: 1,
                StdRequisitionTestData.CreateAuditUser(),
                SubmittedAtUtc,
                snapshotJson));

        Assert.Equal("snapshotJson", exception.ParamName);
    }

    [Fact]
    public void Approve_WhenPending_SetsApprovedStateAndReviewFields()
    {
        var submission = CreateSubmission();
        var reviewedBy = StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Approver");

        submission.Approve(reviewedBy, ReviewedAtUtc, poNumber: "PO-123");

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
        var submission = CreateSubmission();
        var reviewedBy = StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Rejecter");

        submission.Reject(reviewedBy, ReviewedAtUtc, rejectionNotes: "Incorrect rate.");

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
        var submission = CreateSubmission();

        submission.Approve(
            StdRequisitionTestData.CreateAuditUser(nameSnapshot: "First Approver"),
            ReviewedAtUtc,
            poNumber: "PO-123");

        Assert.Throws<InvalidOperationException>(() =>
            submission.Approve(
                StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Second Approver"),
                ReviewedAtUtc.AddHours(1),
                poNumber: "PO-456"));
    }

    [Fact]
    public void Reject_WhenAlreadyRejected_ThrowsInvalidOperationException()
    {
        var submission = CreateSubmission();

        submission.Reject(
            StdRequisitionTestData.CreateAuditUser(nameSnapshot: "First Rejecter"),
            ReviewedAtUtc,
            rejectionNotes: "Incorrect rate.");

        Assert.Throws<InvalidOperationException>(() =>
            submission.Reject(
                StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Second Rejecter"),
                ReviewedAtUtc.AddHours(1),
                rejectionNotes: "Still incorrect."));
    }

    [Fact]
    public void Reject_WhenAlreadyApproved_ThrowsInvalidOperationException()
    {
        var submission = CreateSubmission();

        submission.Approve(
            StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Approver"),
            ReviewedAtUtc,
            poNumber: "PO-123");

        Assert.Throws<InvalidOperationException>(() =>
            submission.Reject(
                StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Rejecter"),
                ReviewedAtUtc.AddHours(1),
                rejectionNotes: "Incorrect rate."));
    }

    [Fact]
    public void Approve_WhenAlreadyRejected_ThrowsInvalidOperationException()
    {
        var submission = CreateSubmission();

        submission.Reject(
            StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Rejecter"),
            ReviewedAtUtc,
            rejectionNotes: "Incorrect rate.");

        Assert.Throws<InvalidOperationException>(() =>
            submission.Approve(
                StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Approver"),
                ReviewedAtUtc.AddHours(1),
                poNumber: "PO-123"));
    }

    [Fact]
    public void Approve_WhenReviewedByIsNull_ThrowsArgumentNullException()
    {
        var submission = CreateSubmission();

        var exception = Assert.Throws<ArgumentNullException>(() =>
            submission.Approve(reviewedBy: null!, ReviewedAtUtc, poNumber: "PO-123"));

        Assert.Equal("reviewedBy", exception.ParamName);
    }

    [Fact]
    public void Reject_WhenReviewedByIsNull_ThrowsArgumentNullException()
    {
        var submission = CreateSubmission();

        var exception = Assert.Throws<ArgumentNullException>(() =>
            submission.Reject(reviewedBy: null!, ReviewedAtUtc, rejectionNotes: "Incorrect rate."));

        Assert.Equal("reviewedBy", exception.ParamName);
    }

    [Fact]
    public void Approve_WhenPoNumberIsNull_ThrowsArgumentNullException()
    {
        var submission = CreateSubmission();

        var exception = Assert.Throws<ArgumentNullException>(() =>
            submission.Approve(
                StdRequisitionTestData.CreateAuditUser(),
                ReviewedAtUtc,
                poNumber: null!));

        Assert.Equal("poNumber", exception.ParamName);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Approve_WhenPoNumberIsEmptyOrWhitespace_ThrowsArgumentException(string poNumber)
    {
        var submission = CreateSubmission();

        var exception = Assert.Throws<ArgumentException>(() =>
            submission.Approve(
                StdRequisitionTestData.CreateAuditUser(),
                ReviewedAtUtc,
                poNumber));

        Assert.Equal("poNumber", exception.ParamName);
    }

    [Fact]
    public void Reject_WhenRejectionNotesIsNull_ThrowsArgumentNullException()
    {
        var submission = CreateSubmission();

        var exception = Assert.Throws<ArgumentNullException>(() =>
            submission.Reject(
                StdRequisitionTestData.CreateAuditUser(),
                ReviewedAtUtc,
                rejectionNotes: null!));

        Assert.Equal("rejectionNotes", exception.ParamName);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Reject_WhenRejectionNotesIsEmptyOrWhitespace_ThrowsArgumentException(string rejectionNotes)
    {
        var submission = CreateSubmission();

        var exception = Assert.Throws<ArgumentException>(() =>
            submission.Reject(
                StdRequisitionTestData.CreateAuditUser(),
                ReviewedAtUtc,
                rejectionNotes));

        Assert.Equal("rejectionNotes", exception.ParamName);
    }
    
    [Fact]
    public void Create_WhenSubmittedAtUtcIsDefault_ThrowsInvalidOperationException()
    {
        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            StdRequisitionSubmission.Create(
                submissionNumber: 1,
                FeRequisitionTestData.CreateAuditUser(),
                submittedAtUtc: default,
                snapshotJson: "{}"));
    }

    [Fact]
    public void Create_WhenSubmittedAtUtcIsNotUtc_ThrowsInvalidOperationException()
    {
        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            StdRequisitionSubmission.Create(
                submissionNumber: 1,
                FeRequisitionTestData.CreateAuditUser(),
                submittedAtUtc: new DateTime(2026, 6, 13, 10, 0, 0, DateTimeKind.Unspecified),
                snapshotJson: "{}"));
    }

    [Fact]
    public void Approve_WhenReviewedAtUtcIsDefault_ThrowsInvalidOperationException()
    {
        // Arrange
        var submission = CreateSubmission();

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            submission.Approve(
                StdRequisitionTestData.CreateAuditUser(),
                reviewedAtUtc: default,
                poNumber: "PO-123"));
    }

    [Fact]
    public void Reject_WhenReviewedAtUtcIsDefault_ThrowsInvalidOperationException()
    {
        // Arrange
        var submission = CreateSubmission();

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            submission.Reject(
                StdRequisitionTestData.CreateAuditUser(),
                reviewedAtUtc: default,
                rejectionNotes: "Incorrect rate."));
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