using FluentValidation.TestHelper;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.StdRequisitions.Validators;

namespace VanDriverRequisitions.Application.UnitTests.Features.StdRequisitions.Validators;

public sealed class ApproveStdRequisitionDtoValidatorTests
{
    private readonly ApproveStdRequisitionDtoValidator _validator = new();

    public static IEnumerable<object?[]> MissingRowVersions()
    {
        yield return [null];
        yield return [Array.Empty<byte>()];
    }

    [Fact]
    public void Validate_WhenDtoIsValid_HasNoValidationErrors()
    {
        // Arrange
        var dto = new ApproveStdRequisitionDto { RowVersion = [1, 2, 3] };

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
        var dto = new ApproveStdRequisitionDto { RowVersion = rowVersion };

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.RowVersion)
            .WithErrorMessage("This requisition must be refreshed before it can be approved.");
    }
}