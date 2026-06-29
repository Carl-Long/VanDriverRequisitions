using FluentValidation.TestHelper;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.FeRequisitions.Validators;
using VanDriverRequisitions.Application.UnitTests.TestData;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.UnitTests.Features.FeRequisitions.Validators;

public sealed class SaveFeAdditionalCostDtoValidatorTests
{
    private readonly SaveFeAdditionalCostDtoValidator _validator = new();

    public static TheoryData<decimal?> MissingOrInvalidRates => [null, 0m, 0.001m, -0.01m];

    [Fact]
    public void Validate_WhenJobDtoIsValid_HasNoValidationErrors()
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateJobAdditionalCostDto();

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WhenMileageDtoIsValid_HasNoValidationErrors()
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateMileageAdditionalCostDto();

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WhenWeekEndingDateIsDefault_HasValidationError()
    {
        // Arrange
        var dto = new SaveFeAdditionalCostDto
        {
            WeekEndingDate = default(DateOnly),
            ReasonId = Guid.NewGuid(),
            ChargingOption = ChargingOption.Job,
            TotalNumber = 1,
            RatePerJob = 10m,
            Miles = null,
            RatePerMile = null
        };

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.WeekEndingDate);
    }

    [Fact]
    public void Validate_WhenReasonIdIsEmpty_HasValidationError()
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateJobAdditionalCostDto(
            reasonId: Guid.Empty);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.ReasonId);
    }

    [Fact]
    public void Validate_WhenChargingOptionIsUnknown_HasValidationError()
    {
        // Arrange
        var dto = new SaveFeAdditionalCostDto
        {
            WeekEndingDate = FeRequisitionDtoTestData.WeekEndingDate,
            ReasonId = Guid.NewGuid(),
            ChargingOption = (ChargingOption)999,
            TotalNumber = 1,
            RatePerJob = 10m,
            Miles = null,
            RatePerMile = null
        };

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.ChargingOption);
    }

    [Theory]
    [InlineData(null)]
    [InlineData(0)]
    [InlineData(-1)]
    public void Validate_WhenJobTotalNumberIsMissingOrNotPositive_HasValidationError(int? totalNumber)
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateJobAdditionalCostDto(
            totalNumber: totalNumber,
            ratePerJob: 10m);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.TotalNumber);
    }

    [Theory]
    [MemberData(nameof(MissingOrInvalidRates))]
    public void Validate_WhenJobRatePerJobIsMissingOrInvalid_HasValidationError(decimal? ratePerJob)
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateJobAdditionalCostDto(
            totalNumber: 1,
            ratePerJob: ratePerJob);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.RatePerJob);
    }

    [Fact]
    public void Validate_WhenJobRatePerJobHasMoreThanTwoDecimalPlaces_HasValidationError()
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateJobAdditionalCostDto(
            totalNumber: 1,
            ratePerJob: 10.555m);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.RatePerJob);
    }

    [Fact]
    public void Validate_WhenJobMilesIsProvided_HasValidationError()
    {
        // Arrange
        var dto = new SaveFeAdditionalCostDto
        {
            WeekEndingDate = FeRequisitionDtoTestData.WeekEndingDate,
            ReasonId = Guid.NewGuid(),
            ChargingOption = ChargingOption.Job,
            TotalNumber = 1,
            RatePerJob = 10m,
            Miles = 10,
            RatePerMile = null
        };

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Miles);
    }

    [Fact]
    public void Validate_WhenJobRatePerMileIsProvided_HasValidationError()
    {
        // Arrange
        var dto = new SaveFeAdditionalCostDto
        {
            WeekEndingDate = FeRequisitionDtoTestData.WeekEndingDate,
            ReasonId = Guid.NewGuid(),
            ChargingOption = ChargingOption.Job,
            TotalNumber = 1,
            RatePerJob = 10m,
            Miles = null,
            RatePerMile = 0.45m
        };

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.RatePerMile);
    }

    [Theory]
    [InlineData(null)]
    [InlineData(0)]
    [InlineData(-1)]
    public void Validate_WhenMileageMilesIsMissingOrNotPositive_HasValidationError(int? miles)
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateMileageAdditionalCostDto(
            miles: miles,
            ratePerMile: 0.45m);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Miles);
    }

    [Theory]
    [MemberData(nameof(MissingOrInvalidRates))]
    public void Validate_WhenMileageRatePerMileIsMissingOrInvalid_HasValidationError(decimal? ratePerMile)
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateMileageAdditionalCostDto(
            miles: 10,
            ratePerMile: ratePerMile);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.RatePerMile);
    }

    [Fact]
    public void Validate_WhenMileageRatePerMileHasMoreThanTwoDecimalPlaces_HasValidationError()
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateMileageAdditionalCostDto(
            miles: 10,
            ratePerMile: 0.455m);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.RatePerMile);
    }

    [Fact]
    public void Validate_WhenMileageTotalNumberIsProvided_HasValidationError()
    {
        // Arrange
        var dto = new SaveFeAdditionalCostDto
        {
            WeekEndingDate = FeRequisitionDtoTestData.WeekEndingDate,
            ReasonId = Guid.NewGuid(),
            ChargingOption = ChargingOption.Mileage,
            TotalNumber = 1,
            RatePerJob = null,
            Miles = 10,
            RatePerMile = 0.45m
        };

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.TotalNumber);
    }

    [Fact]
    public void Validate_WhenMileageRatePerJobIsProvided_HasValidationError()
    {
        // Arrange
        var dto = new SaveFeAdditionalCostDto
        {
            WeekEndingDate = FeRequisitionDtoTestData.WeekEndingDate,
            ReasonId = Guid.NewGuid(),
            ChargingOption = ChargingOption.Mileage,
            TotalNumber = null,
            RatePerJob = 10m,
            Miles = 10,
            RatePerMile = 0.45m
        };

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.RatePerJob);
    }
}