using FluentValidation.TestHelper;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.FeRequisitions.Validators;
using VanDriverRequisitions.Application.UnitTests.TestData;

namespace VanDriverRequisitions.Application.UnitTests.Features.FeRequisitions.Validators;

public sealed class SaveFeTransferDtoValidatorTests
{
    private readonly SaveFeTransferDtoValidator _validator = new();

    [Fact]
    public void Validate_WhenDtoIsValid_HasNoValidationErrors()
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateTransferDto();

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WhenWeekEndingDateIsDefault_HasValidationError()
    {
        // Arrange
        var dto = new SaveFeTransferDto
        {
            WeekEndingDate = default(DateOnly),
            ShopIdFrom = Guid.NewGuid(),
            ShopIdTo = Guid.NewGuid(),
            Week = FeRequisitionDtoTestData.CreateWeek(),
            RatePerJob = 1m
        };

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.WeekEndingDate);
    }

    [Fact]
    public void Validate_WhenFromShopIsEmpty_HasValidationError()
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateTransferDto(shopIdFrom: Guid.Empty);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.ShopIdFrom);
    }

    [Fact]
    public void Validate_WhenToShopIsEmpty_HasValidationError()
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateTransferDto(shopIdTo: Guid.Empty);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.ShopIdTo);
    }

    [Fact]
    public void Validate_WhenFromAndToShopAreSame_HasValidationError()
    {
        // Arrange
        var shopId = Guid.NewGuid();

        var dto = FeRequisitionDtoTestData.CreateTransferDto(shopIdFrom: shopId, shopIdTo: shopId);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x);
    }

    [Fact]
    public void Validate_WhenWeekIsNull_HasValidationError()
    {
        // Arrange
        var dto = new SaveFeTransferDto
        {
            WeekEndingDate = FeRequisitionDtoTestData.WeekEndingDate,
            ShopIdFrom = Guid.NewGuid(),
            ShopIdTo = Guid.NewGuid(),
            Week = null!,
            RatePerJob = 1m
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
    public void Validate_WhenRatePerJobIsBelowMinimum_HasValidationError(decimal ratePerJob)
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateTransferDto(ratePerJob: ratePerJob);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.RatePerJob);
    }

    [Fact]
    public void Validate_WhenRatePerJobHasMoreThanTwoDecimalPlaces_HasValidationError()
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateTransferDto(ratePerJob: 1.555m);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.RatePerJob);
    }

    [Fact]
    public void Validate_WhenRatePerJobIsNull_HasNoRateValidationError()
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateTransferDto(ratePerJob: null);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.RatePerJob);
    }
}