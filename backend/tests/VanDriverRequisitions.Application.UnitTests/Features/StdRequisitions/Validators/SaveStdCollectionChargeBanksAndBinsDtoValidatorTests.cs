using FluentValidation.TestHelper;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.StdRequisitions.Validators;
using VanDriverRequisitions.Application.UnitTests.TestData;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.UnitTests.Features.StdRequisitions.Validators;

public sealed class SaveStdCollectionChargeBanksAndBinsDtoValidatorTests
{
    private readonly SaveStdCollectionChargeBanksAndBinsDtoValidator _validator = new();

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
}