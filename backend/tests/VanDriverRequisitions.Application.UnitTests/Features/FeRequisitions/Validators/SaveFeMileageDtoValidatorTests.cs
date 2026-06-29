using FluentValidation.TestHelper;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.FeRequisitions.Validators;
using VanDriverRequisitions.Application.UnitTests.TestData;

namespace VanDriverRequisitions.Application.UnitTests.Features.FeRequisitions.Validators;

public sealed class SaveFeMileageDtoValidatorTests
{
    private readonly SaveFeMileageDtoValidator _validator = new();

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
            WeekEndingDate = default(DateOnly),
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

    [Theory]
    [InlineData(0)]
    [InlineData(0.001)]
    [InlineData(-0.01)]
    public void Validate_WhenRatePerMileIsBelowMinimum_HasValidationError(decimal ratePerMile)
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

    [Fact]
    public void Validate_WhenRatePerMileIsNull_HasNoRateValidationError()
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateMileageDto(ratePerMile: null);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.RatePerMile);
    }
}