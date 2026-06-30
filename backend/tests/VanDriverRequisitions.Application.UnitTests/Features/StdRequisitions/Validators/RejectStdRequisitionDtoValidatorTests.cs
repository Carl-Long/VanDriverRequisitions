using FluentValidation.TestHelper;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.StdRequisitions.Validators;

namespace VanDriverRequisitions.Application.UnitTests.Features.StdRequisitions.Validators;

public sealed class RejectStdRequisitionDtoValidatorTests
{
    private readonly RejectStdRequisitionDtoValidator _validator = new();

    public static IEnumerable<object?[]> MissingRowVersions()
    {
        yield return [null];
        yield return [Array.Empty<byte>()];
    }

    [Fact]
    public void Validate_WhenDtoIsValid_HasNoValidationErrors()
    {
        // Arrange
        var dto = new RejectStdRequisitionDto
        {
            RowVersion = [1, 2, 3],
            RejectionNotes = "Incorrect charge."
        };

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [MemberData(nameof(MissingRowVersions))]
    public void Validate_WhenRowVersionIsMissingOrEmpty_HasValidationError(byte[]? rowVersion)
    {
        // Arrange
        var dto = new RejectStdRequisitionDto
        {
            RowVersion = rowVersion,
            RejectionNotes = "Incorrect charge."
        };

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.RowVersion)
            .WithErrorMessage("This requisition must be refreshed before it can be rejected.");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WhenRejectionNotesAreMissing_HasValidationError(string rejectionNotes)
    {
        // Arrange
        var dto = new RejectStdRequisitionDto
        {
            RowVersion = [1, 2, 3],
            RejectionNotes = rejectionNotes
        };

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.RejectionNotes)
            .WithErrorMessage("Rejection notes are required.");
    }

    [Fact]
    public void Validate_WhenRejectionNotesAreTooLong_HasValidationError()
    {
        // Arrange
        var dto = new RejectStdRequisitionDto
        {
            RowVersion = [1, 2, 3],
            RejectionNotes = new string('A', 1001)
        };

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.RejectionNotes)
            .WithErrorMessage("Rejection notes cannot exceed 1000 characters.");
    }

    [Fact]
    public void Validate_WhenRejectionNotesAreAtMaximumLength_HasNoValidationErrorForRejectionNotes()
    {
        // Arrange
        var dto = new RejectStdRequisitionDto
        {
            RowVersion = [1, 2, 3],
            RejectionNotes = new string('A', 1000)
        };

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.RejectionNotes);
    }
}