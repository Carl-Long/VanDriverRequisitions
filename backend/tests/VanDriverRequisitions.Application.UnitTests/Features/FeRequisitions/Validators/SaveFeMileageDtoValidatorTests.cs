using FluentValidation.TestHelper;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.FeRequisitions.Validators;
using VanDriverRequisitions.Application.UnitTests.TestData;

namespace VanDriverRequisitions.Application.UnitTests.Features.FeRequisitions.Validators;

public sealed class SaveFeMileageDtoValidatorTests
{
    private readonly SaveFeMileageDtoValidator _validator = new();

    public static TheoryData<decimal?> MissingOrInvalidRates => [null, 0m, 0.001m, -0.01m];

    [Fact]
    public void Validate_WhenDtoIsValid_HasNoValidationErrors()
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateMileageDto();

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WhenWeekEndingDateIsDefault_HasValidationError()
    {
        // Arrange
        var dto = new SaveFeMileageDto
        {
            WeekEndingDate = default,
            Week = FeRequisitionDtoTestData.CreateWeek(),
            RatePerMile = 0.50m
        };

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.WeekEndingDate);
    }

    [Fact]
    public void Validate_WhenWeekIsNull_HasValidationError()
    {
        // Arrange
        var dto = new SaveFeMileageDto
        {
            WeekEndingDate = FeRequisitionDtoTestData.WeekEndingDate,
            Week = null!,
            RatePerMile = 0.50m
        };

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Week);
    }

    [Fact]
    public void Validate_WhenWeekHasNoPositiveQuantities_HasValidationError()
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateMileageDto(
            week: FeRequisitionDtoTestData.CreateWeek(
                sunday: 0,
                monday: 0,
                tuesday: 0,
                wednesday: 0,
                thursday: 0,
                friday: 0,
                saturday: 0));

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Week);
    }

    [Fact]
    public void Validate_WhenWeekHasOnlyNullQuantities_HasValidationError()
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateMileageDto(
            week: FeRequisitionDtoTestData.CreateWeek(
                sunday: null,
                monday: null,
                tuesday: null,
                wednesday: null,
                thursday: null,
                friday: null,
                saturday: null));

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Week);
    }

    [Fact]
    public void Validate_WhenWeekHasNegativeQuantity_HasValidationError()
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateMileageDto(
            week: FeRequisitionDtoTestData.CreateWeek(sunday: -1));

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor("Week.Sunday");
    }

    [Theory]
    [MemberData(nameof(MissingOrInvalidRates))]
    public void Validate_WhenRatePerMileIsMissingOrInvalid_HasValidationError(decimal? ratePerMile)
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateMileageDto(ratePerMile: ratePerMile);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.RatePerMile);
    }

    [Fact]
    public void Validate_WhenRatePerMileHasMoreThanTwoDecimalPlaces_HasValidationError()
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateMileageDto(ratePerMile: 0.555m);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.RatePerMile);
    }
}