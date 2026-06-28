using FluentValidation.TestHelper;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.StdRequisitions.Validators;
using VanDriverRequisitions.Application.UnitTests.TestData;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.UnitTests.Features.StdRequisitions.Validators;

public sealed class SaveStdTransferDtoValidatorTests
{
    private readonly SaveStdTransferDtoValidator _validator = new();

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
}