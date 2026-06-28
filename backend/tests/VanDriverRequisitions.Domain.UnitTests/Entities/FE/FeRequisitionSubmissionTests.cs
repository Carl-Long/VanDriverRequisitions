using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.UnitTests.TestData;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.FE;

public sealed class FeRequisitionSubmissionTests
{
    private static readonly DateTime SubmittedAtUtc = new(2026, 6, 13, 10, 0, 0, DateTimeKind.Utc);
    private static readonly DateTime ReviewedAtUtc = new(2026, 6, 14, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void Create_WhenValid_CreatesPendingSubmission()
    {
        // Arrange
        var submittedBy = FeRequisitionTestData.CreateAuditUser(nameSnapshot: "Submitter");

        // Act
        var submission = FeRequisitionSubmission.Create(submissionNumber: 1, submittedBy, SubmittedAtUtc, snapshotJson: "{}");

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
            FeRequisitionSubmission.Create(
                submissionNumber, FeRequisitionTestData.CreateAuditUser(),
                SubmittedAtUtc,
                snapshotJson: "{}"));

        // Assert
        Assert.Equal("submissionNumber", exception.ParamName);
    }

    [Fact]
    public void Create_WhenSubmittedByIsNull_ThrowsArgumentNullException()
    {
        // Act
        var exception = Assert.Throws<ArgumentNullException>(() =>
            FeRequisitionSubmission.Create(
                submissionNumber: 1,
                submittedBy: null!,
                SubmittedAtUtc,
                snapshotJson: "{}"));

        // Assert
        Assert.Equal("submittedBy", exception.ParamName);
    }

    [Fact]
    public void Create_WhenSnapshotJsonIsNull_ThrowsArgumentNullException()
    {
        // Act
        var exception = Assert.Throws<ArgumentNullException>(() =>
            FeRequisitionSubmission.Create(
                submissionNumber: 1,
                FeRequisitionTestData.CreateAuditUser(),
                SubmittedAtUtc,
                snapshotJson: null!));

        // Assert
        Assert.Equal("snapshotJson", exception.ParamName);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WhenSnapshotJsonIsEmptyOrWhitespace_ThrowsArgumentException(string snapshotJson)
    {
        // Act
        var exception = Assert.Throws<ArgumentException>(() =>
            FeRequisitionSubmission.Create(
                submissionNumber: 1,
                FeRequisitionTestData.CreateAuditUser(),
                SubmittedAtUtc,
                snapshotJson));

        // Assert
        Assert.Equal("snapshotJson", exception.ParamName);
    }

    [Fact]
    public void Approve_WhenPending_SetsApprovedStateAndReviewFields()
    {
        // Arrange
        var submission = CreateSubmission();

        var reviewedBy = FeRequisitionTestData.CreateAuditUser(nameSnapshot: "Approver");

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

        var reviewedBy = FeRequisitionTestData.CreateAuditUser(nameSnapshot: "Rejecter");

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
            FeRequisitionTestData.CreateAuditUser(nameSnapshot: "First Approver"),
            ReviewedAtUtc,
            poNumber: "PO-123");

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            submission.Approve(
                FeRequisitionTestData.CreateAuditUser(nameSnapshot: "Second Approver"),
                ReviewedAtUtc.AddHours(1),
                poNumber: "PO-456"));
    }

    [Fact]
    public void Reject_WhenAlreadyRejected_ThrowsInvalidOperationException()
    {
        // Arrange
        var submission = CreateSubmission();

        submission.Reject(
            FeRequisitionTestData.CreateAuditUser(nameSnapshot: "First Rejecter"),
            ReviewedAtUtc,
            rejectionNotes: "Incorrect rate.");

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            submission.Reject(
                FeRequisitionTestData.CreateAuditUser(nameSnapshot: "Second Rejecter"),
                ReviewedAtUtc.AddHours(1),
                rejectionNotes: "Still incorrect."));
    }

    [Fact]
    public void Reject_WhenAlreadyApproved_ThrowsInvalidOperationException()
    {
        // Arrange
        var submission = CreateSubmission();

        submission.Approve(
            FeRequisitionTestData.CreateAuditUser(nameSnapshot: "Approver"),
            ReviewedAtUtc,
            poNumber: "PO-123");

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            submission.Reject(
                FeRequisitionTestData.CreateAuditUser(nameSnapshot: "Rejecter"),
                ReviewedAtUtc.AddHours(1),
                rejectionNotes: "Incorrect rate."));
    }

    [Fact]
    public void Approve_WhenAlreadyRejected_ThrowsInvalidOperationException()
    {
        // Arrange
        var submission = CreateSubmission();

        submission.Reject(
            FeRequisitionTestData.CreateAuditUser(nameSnapshot: "Rejecter"),
            ReviewedAtUtc,
            rejectionNotes: "Incorrect rate.");

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            submission.Approve(
                FeRequisitionTestData.CreateAuditUser(nameSnapshot: "Approver"),
                ReviewedAtUtc.AddHours(1),
                poNumber: "PO-123"));
    }

    [Fact]
    public void Approve_WhenReviewedByIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var submission = CreateSubmission();

        // Act
        var exception = Assert.Throws<ArgumentNullException>(() =>
            submission.Approve(reviewedBy: null!, ReviewedAtUtc, poNumber: "PO-123"));

        // Assert
        Assert.Equal("reviewedBy", exception.ParamName);
    }

    [Fact]
    public void Reject_WhenReviewedByIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var submission = CreateSubmission();

        // Act
        var exception = Assert.Throws<ArgumentNullException>(() =>
            submission.Reject(reviewedBy: null!, ReviewedAtUtc, rejectionNotes: "Incorrect rate."));

        // Assert
        Assert.Equal("reviewedBy", exception.ParamName);
    }

    [Fact]
    public void Approve_WhenPoNumberIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var submission = CreateSubmission();

        // Act
        var exception = Assert.Throws<ArgumentNullException>(() =>
            submission.Approve(FeRequisitionTestData.CreateAuditUser(), ReviewedAtUtc, poNumber: null!));

        // Assert
        Assert.Equal("poNumber", exception.ParamName);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Approve_WhenPoNumberIsEmptyOrWhitespace_ThrowsArgumentException(
        string poNumber)
    {
        // Arrange
        var submission = CreateSubmission();

        // Act
        var exception = Assert.Throws<ArgumentException>(() =>
            submission.Approve(FeRequisitionTestData.CreateAuditUser(), ReviewedAtUtc, poNumber));

        // Assert
        Assert.Equal("poNumber", exception.ParamName);
    }

    [Fact]
    public void Reject_WhenRejectionNotesIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var submission = CreateSubmission();

        // Act
        var exception = Assert.Throws<ArgumentNullException>(() =>
            submission.Reject(FeRequisitionTestData.CreateAuditUser(), ReviewedAtUtc, rejectionNotes: null!));

        // Assert
        Assert.Equal("rejectionNotes", exception.ParamName);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Reject_WhenRejectionNotesIsEmptyOrWhitespace_ThrowsArgumentException(string rejectionNotes)
    {
        // Arrange
        var submission = CreateSubmission();

        // Act
        var exception = Assert.Throws<ArgumentException>(() =>
            submission.Reject(FeRequisitionTestData.CreateAuditUser(), ReviewedAtUtc, rejectionNotes));

        // Assert
        Assert.Equal("rejectionNotes", exception.ParamName);
    }
    
    [Fact]
    public void Create_WhenSubmittedAtUtcIsDefault_ThrowsInvalidOperationException()
    {
        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            FeRequisitionSubmission.Create(
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
            FeRequisitionSubmission.Create(
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
                FeRequisitionTestData.CreateAuditUser(),
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
            submission.Reject(FeRequisitionTestData.CreateAuditUser(), reviewedAtUtc: default, rejectionNotes: "Incorrect rate."));
    }

    private static FeRequisitionSubmission CreateSubmission()
    {
        return FeRequisitionSubmission.Create(
            submissionNumber: 1,
            FeRequisitionTestData.CreateAuditUser(nameSnapshot: "Submitter"),
            SubmittedAtUtc,
            snapshotJson: "{}");
    }
}