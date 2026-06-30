using FluentValidation.TestHelper;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.StdRequisitions.Validators;
using VanDriverRequisitions.Application.UnitTests.TestData;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.UnitTests.Features.StdRequisitions.Validators;

public sealed class SaveStdCollectionChargeBanksAndBinsDtoValidatorTests
{
    private readonly SaveStdCollectionChargeBanksAndBinsDtoValidator _validator = new();
    public static TheoryData<decimal?> MissingOrInvalidRates => [null, 0m, 0.001m, -0.01m];

    [Fact]
    public void Validate_WhenDtoIsValid_HasNoValidationErrors()
    {
        var dto = StdRequisitionDtoTestData.CreateBanksAndBinsMileageDto();

        var result = _validator.TestValidate(dto);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WhenDateIsDefault_HasValidationError()
    {
        var dto = new SaveStdCollectionChargeBanksAndBinsDto
        {
            Date = default(DateOnly),
            CollectionTypeId = Guid.NewGuid(),
            LocationId = Guid.NewGuid(),
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
    public void Validate_WhenCollectionTypeIdIsEmpty_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateBanksAndBinsMileageDto(
            collectionTypeId: Guid.Empty);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.CollectionTypeId);
    }

    [Fact]
    public void Validate_WhenLocationIdIsEmpty_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateBanksAndBinsMileageDto(
            locationId: Guid.Empty);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.LocationId);
    }

    [Fact]
    public void Validate_WhenNumberOfBagsIsNegative_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateBanksAndBinsMileageDto(
            numberOfBags: -1);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.NumberOfBags);
    }

    [Fact]
    public void Validate_WhenFlatChargeDtoIsValid_HasNoValidationErrors()
    {
        var dto = StdRequisitionDtoTestData.CreateBanksAndBinsFlatChargeDto();

        var result = _validator.TestValidate(dto);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WhenChargeTypeIsUnknown_HasValidationError()
    {
        var dto = new SaveStdCollectionChargeBanksAndBinsDto
        {
            Date = StdRequisitionDtoTestData.Date,
            CollectionTypeId = Guid.NewGuid(),
            LocationId = Guid.NewGuid(),
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
        var dto = StdRequisitionDtoTestData.CreateBanksAndBinsMileageDto(miles: miles, ratePerMile: 0.45m);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.Miles);
    }

    [Theory]
    [MemberData(nameof(MissingOrInvalidRates))]
    public void Validate_WhenMileageRatePerMileIsMissingOrInvalid_HasValidationError(decimal? ratePerMile)
    {
        var dto = StdRequisitionDtoTestData.CreateBanksAndBinsMileageDto(miles: 10, ratePerMile: ratePerMile);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.RatePerMile);
    }

    [Fact]
    public void Validate_WhenMileageRatePerMileHasMoreThanTwoDecimalPlaces_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateBanksAndBinsMileageDto(ratePerMile: 0.455m);
        
        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.RatePerMile);
    }

    [Fact]
    public void Validate_WhenMileageFlatChargeIsProvided_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateBanksAndBinsMileageDto(flatCharge: 10m);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.FlatCharge);
    }

    [Theory]
    [MemberData(nameof(MissingOrInvalidRates))]
    public void Validate_WhenFlatChargeIsMissingOrInvalid_HasValidationError(decimal? flatCharge)
    {
        var dto = StdRequisitionDtoTestData.CreateBanksAndBinsFlatChargeDto(flatCharge: flatCharge);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.FlatCharge);
    }

    [Fact]
    public void Validate_WhenFlatChargeHasMoreThanTwoDecimalPlaces_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateBanksAndBinsFlatChargeDto(flatCharge: 10.555m);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.FlatCharge);
    }

    [Fact]
    public void Validate_WhenFlatChargeMilesIsProvided_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateBanksAndBinsFlatChargeDto(miles: 10);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.Miles);
    }

    [Fact]
    public void Validate_WhenFlatChargeRatePerMileIsProvided_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateBanksAndBinsFlatChargeDto(ratePerMile: 0.45m);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.RatePerMile);
    }
}