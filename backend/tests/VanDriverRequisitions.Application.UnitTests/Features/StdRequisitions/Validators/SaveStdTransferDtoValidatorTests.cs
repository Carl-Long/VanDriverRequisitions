using FluentValidation.TestHelper;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.StdRequisitions.Validators;
using VanDriverRequisitions.Application.UnitTests.TestData;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.UnitTests.Features.StdRequisitions.Validators;

public sealed class SaveStdTransferDtoValidatorTests
{
    private readonly SaveStdTransferDtoValidator _validator = new();
    public static TheoryData<decimal?> MissingOrInvalidRates => [null, 0m, 0.001m, -0.01m];

    [Fact]
    public void Validate_WhenDtoIsValid_HasNoValidationErrors()
    {
        var dto = StdRequisitionDtoTestData.CreateTransferMileageDto();

        var result = _validator.TestValidate(dto);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WhenDateIsDefault_HasValidationError()
    {
        var dto = new SaveStdTransferDto
        {
            Date = default(DateOnly),
            ShopIdFrom = Guid.NewGuid(),
            ShopIdTo = Guid.NewGuid(),
            NumberOfBags = 1,
            NumberOfBoxes = 1,
            ChargeType = StdChargeType.Mileage,
            Miles = 10,
            RatePerMile = 0.45m,
            FlatCharge = null
        };

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.Date);
    }

    [Fact]
    public void Validate_WhenFromShopIsEmpty_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateTransferMileageDto(shopIdFrom: Guid.Empty);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.ShopIdFrom);
    }

    [Fact]
    public void Validate_WhenToShopIsEmpty_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateTransferMileageDto(shopIdTo: Guid.Empty);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.ShopIdTo);
    }

    [Fact]
    public void Validate_WhenFromAndToShopAreSame_HasValidationError()
    {
        var shopId = Guid.NewGuid();

        var dto = StdRequisitionDtoTestData.CreateTransferMileageDto(shopIdFrom: shopId, shopIdTo: shopId);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x);
    }

    [Fact]
    public void Validate_WhenNumberOfBagsIsNegative_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateTransferMileageDto(numberOfBags: -1);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.NumberOfBags);
    }

    [Fact]
    public void Validate_WhenNumberOfBoxesIsNegative_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateTransferMileageDto(numberOfBoxes: -1);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.NumberOfBoxes);
    }

    [Fact]
    public void Validate_WhenFlatChargeDtoIsValid_HasNoValidationErrors()
    {
        var dto = StdRequisitionDtoTestData.CreateTransferFlatChargeDto();

        var result = _validator.TestValidate(dto);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WhenChargeTypeIsUnknown_HasValidationError()
    {
        var dto = new SaveStdTransferDto
        {
            Date = StdRequisitionDtoTestData.Date,
            ShopIdFrom = Guid.NewGuid(),
            ShopIdTo = Guid.NewGuid(),
            NumberOfBags = 1,
            NumberOfBoxes = 1,
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
        var dto = StdRequisitionDtoTestData.CreateTransferMileageDto(miles: miles, ratePerMile: 0.45m);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.Miles);
    }

    [Theory]
    [MemberData(nameof(MissingOrInvalidRates))]
    public void Validate_WhenMileageRatePerMileIsMissingOrInvalid_HasValidationError(decimal? ratePerMile)
    {
        var dto = StdRequisitionDtoTestData.CreateTransferMileageDto(miles: 10, ratePerMile: ratePerMile);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.RatePerMile);
    }

    [Fact]
    public void Validate_WhenMileageRatePerMileHasMoreThanTwoDecimalPlaces_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateTransferMileageDto(ratePerMile: 0.455m);
        
        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.RatePerMile);
    }

    [Fact]
    public void Validate_WhenMileageFlatChargeIsProvided_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateTransferMileageDto(flatCharge: 10m);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.FlatCharge);
    }

    [Theory]
    [MemberData(nameof(MissingOrInvalidRates))]
    public void Validate_WhenFlatChargeIsMissingOrInvalid_HasValidationError(decimal? flatCharge)
    {
        var dto = StdRequisitionDtoTestData.CreateTransferFlatChargeDto(flatCharge: flatCharge);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.FlatCharge);
    }

    [Fact]
    public void Validate_WhenFlatChargeHasMoreThanTwoDecimalPlaces_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateTransferFlatChargeDto(flatCharge: 10.555m);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.FlatCharge);
    }

    [Fact]
    public void Validate_WhenFlatChargeMilesIsProvided_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateTransferFlatChargeDto(miles: 10);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.Miles);
    }

    [Fact]
    public void Validate_WhenFlatChargeRatePerMileIsProvided_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateTransferFlatChargeDto(ratePerMile: 0.45m);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.RatePerMile);
    }
}