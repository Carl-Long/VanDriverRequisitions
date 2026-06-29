using FluentValidation.TestHelper;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.StdRequisitions.Validators;
using VanDriverRequisitions.Application.UnitTests.TestData;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.UnitTests.Features.StdRequisitions.Validators;

public sealed class SaveStdAdditionalCostDtoValidatorTests
{
    private readonly SaveStdAdditionalCostDtoValidator _validator = new();
    public static TheoryData<decimal?> MissingOrInvalidRates => [null, 0m, 0.001m, -0.01m];

    [Fact]
    public void Validate_WhenDtoIsValid_HasNoValidationErrors()
    {
        var dto = StdRequisitionDtoTestData.CreateAdditionalMileageDto();

        var result = _validator.TestValidate(dto);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WhenDateIsDefault_HasValidationError()
    {
        var dto = new SaveStdAdditionalCostDto
        {
            Date = default(DateOnly),
            ReasonId = Guid.NewGuid(),
            NumberOfBags = 1,
            ChargeType = StdChargeType.Mileage,
            Miles = 10,
            RatePerMile = 0.45m,
            FlatCharge = null
        };

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.Date);
    }

    [Fact]
    public void Validate_WhenReasonIdIsEmpty_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateAdditionalMileageDto(reasonId: Guid.Empty);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.ReasonId);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Validate_WhenNumberOfBagsIsNotPositive_HasValidationError(int numberOfBags)
    {
        var dto = StdRequisitionDtoTestData.CreateAdditionalMileageDto(numberOfBags: numberOfBags);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.NumberOfBags);
    }

    [Fact]
    public void Validate_WhenFlatChargeDtoIsValid_HasNoValidationErrors()
    {
        var dto = StdRequisitionDtoTestData.CreateAdditionalFlatChargeDto();

        var result = _validator.TestValidate(dto);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WhenChargeTypeIsUnknown_HasValidationError()
    {
        var dto = new SaveStdAdditionalCostDto
        {
            Date = StdRequisitionDtoTestData.Date,
            ReasonId = Guid.NewGuid(),
            NumberOfBags = 1,
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
        var dto = StdRequisitionDtoTestData.CreateAdditionalMileageDto(miles: miles, ratePerMile: 0.45m);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.Miles);
    }

    [Theory]
    [MemberData(nameof(MissingOrInvalidRates))]
    public void Validate_WhenMileageRatePerMileIsMissingOrInvalid_HasValidationError(decimal? ratePerMile)
    {
        var dto = StdRequisitionDtoTestData.CreateAdditionalMileageDto(miles: 10, ratePerMile: ratePerMile);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.RatePerMile);
    }

    [Fact]
    public void Validate_WhenMileageFlatChargeIsProvided_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateAdditionalMileageDto(flatCharge: 10m);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.FlatCharge);
    }

    [Theory]
    [MemberData(nameof(MissingOrInvalidRates))]
    public void Validate_WhenFlatChargeIsMissingOrInvalid_HasValidationError(decimal? flatCharge)
    {
        var dto = StdRequisitionDtoTestData.CreateAdditionalFlatChargeDto(flatCharge: flatCharge);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.FlatCharge);
    }

    [Fact]
    public void Validate_WhenFlatChargeMilesIsProvided_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateAdditionalFlatChargeDto(miles: 10);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.Miles);
    }

    [Fact]
    public void Validate_WhenFlatChargeRatePerMileIsProvided_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateAdditionalFlatChargeDto(ratePerMile: 0.45m);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.RatePerMile);
    }
}