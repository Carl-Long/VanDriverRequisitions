using FluentValidation.TestHelper;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.StdRequisitions.Validators;
using VanDriverRequisitions.Application.UnitTests.TestData;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.UnitTests.Features.StdRequisitions.Validators;

public sealed class SaveStdPickupDtoValidatorTests
{
    private readonly SaveStdPickupDtoValidator _validator = new();

    public static TheoryData<decimal?> MissingOrInvalidRates => [null, 0m, 0.001m, -0.01m];

    [Fact]
    public void Validate_WhenMileageDtoIsValid_HasNoValidationErrors()
    {
        var dto = StdRequisitionDtoTestData.CreatePickupMileageDto();

        var result = _validator.TestValidate(dto);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WhenFlatChargeDtoIsValid_HasNoValidationErrors()
    {
        var dto = StdRequisitionDtoTestData.CreatePickupFlatChargeDto();

        var result = _validator.TestValidate(dto);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WhenDateIsDefault_HasValidationError()
    {
        var dto = new SaveStdPickupDto
        {
            Date = default(DateOnly),
            NumberOfBags = 1,
            NumberOfHouseholds = 1,
            ChargeType = StdChargeType.Mileage,
            Miles = 10,
            RatePerMile = 0.45m,
            FlatCharge = null
        };

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.Date);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Validate_WhenNumberOfBagsIsNotPositive_HasValidationError(int numberOfBags)
    {
        var dto = StdRequisitionDtoTestData.CreatePickupMileageDto(numberOfBags: numberOfBags);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.NumberOfBags);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Validate_WhenNumberOfHouseholdsIsNotPositive_HasValidationError(int numberOfHouseholds)
    {
        var dto = StdRequisitionDtoTestData.CreatePickupMileageDto(numberOfHouseholds: numberOfHouseholds);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.NumberOfHouseholds);
    }

    [Fact]
    public void Validate_WhenChargeTypeIsUnknown_HasValidationError()
    {
        var dto = new SaveStdPickupDto
        {
            Date = StdRequisitionDtoTestData.Date,
            NumberOfBags = 1,
            NumberOfHouseholds = 1,
            ChargeType = (StdChargeType)999,
            Miles = 10,
            RatePerMile = 0.45m,
            FlatCharge = null
        };

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.ChargeType);
    }

    [Theory]
    [InlineData(null)]
    [InlineData(0)]
    [InlineData(-1)]
    public void Validate_WhenMileageMilesIsMissingOrNotPositive_HasValidationError(int? miles)
    {
        var dto = StdRequisitionDtoTestData.CreatePickupMileageDto(miles: miles, ratePerMile: 0.45m);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.Miles);
    }

    [Theory]
    [MemberData(nameof(MissingOrInvalidRates))]
    public void Validate_WhenMileageRatePerMileIsMissingOrInvalid_HasValidationError(decimal? ratePerMile)
    {
        var dto = StdRequisitionDtoTestData.CreatePickupMileageDto(miles: 10, ratePerMile: ratePerMile);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.RatePerMile);
    }

    [Fact]
    public void Validate_WhenMileageRatePerMileHasMoreThanTwoDecimalPlaces_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreatePickupMileageDto(ratePerMile: 0.455m);
       
        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.RatePerMile);
    }

    [Fact]
    public void Validate_WhenMileageFlatChargeIsProvided_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreatePickupMileageDto(flatCharge: 10m);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.FlatCharge);
    }

    [Theory]
    [MemberData(nameof(MissingOrInvalidRates))]
    public void Validate_WhenFlatChargeIsMissingOrInvalid_HasValidationError(decimal? flatCharge)
    {
        var dto = StdRequisitionDtoTestData.CreatePickupFlatChargeDto(flatCharge: flatCharge);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.FlatCharge);
    }

    [Fact]
    public void Validate_WhenFlatChargeHasMoreThanTwoDecimalPlaces_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreatePickupFlatChargeDto(flatCharge: 10.555m);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.FlatCharge);
    }

    [Fact]
    public void Validate_WhenFlatChargeMilesIsProvided_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreatePickupFlatChargeDto(miles: 10);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.Miles);
    }

    [Fact]
    public void Validate_WhenFlatChargeRatePerMileIsProvided_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreatePickupFlatChargeDto(ratePerMile: 0.45m);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.RatePerMile);
    }
}