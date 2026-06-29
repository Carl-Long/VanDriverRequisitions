using FluentValidation.TestHelper;
using VanDriverRequisitions.Application.Features.StdRequisitions.Validators;
using VanDriverRequisitions.Application.UnitTests.TestData;

namespace VanDriverRequisitions.Application.UnitTests.Features.StdRequisitions.Validators;

public sealed class SaveStdRequisitionDtoValidatorTests
{
    private readonly SaveStdRequisitionDtoValidator _validator = new();

    [Fact]
    public void Validate_WhenDtoIsValid_HasNoValidationErrors()
    {
        var dto = StdRequisitionDtoTestData.CreateRequisitionDto();

        var result = _validator.TestValidate(dto);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WhenRequisitionDateIsDefault_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateRequisitionDto(requisitionDate: default(DateOnly));

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.RequisitionDate);
    }

    [Fact]
    public void Validate_WhenVanDriverIdIsEmpty_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateRequisitionDto(vanDriverId: Guid.Empty);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.VanDriverId);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WhenVanDriverNameIsMissing_HasValidationError(string vanDriverName)
    {
        var dto = StdRequisitionDtoTestData.CreateRequisitionDto(vanDriverName: vanDriverName);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.VanDriverName);
    }

    [Fact]
    public void Validate_WhenVanDriverNameIsTooLong_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateRequisitionDto(vanDriverName: new string('A', 101));

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.VanDriverName);
    }

    [Fact]
    public void Validate_WhenShopIdIsEmpty_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateRequisitionDto(shopId: Guid.Empty);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.ShopId);
    }

    [Fact]
    public void Validate_WhenAllChildCollectionsAreEmpty_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateRequisitionDto(
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            pickups: [],
            transfers: [],
            additionalCosts: []);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x);
    }

    [Fact]
    public void Validate_WhenPickupsIsNull_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateRequisitionDtoWithCollections(
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            pickups: null!,
            transfers: [],
            additionalCosts: []);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.Pickups);
    }

    [Fact]
    public void Validate_WhenTransfersIsNull_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateRequisitionDtoWithCollections(
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            pickups: [],
            transfers: null!,
            additionalCosts: []);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.Transfers);
    }

    [Fact]
    public void Validate_WhenCollectionChargesBanksAndBinsIsNull_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateRequisitionDtoWithCollections(
            collectionChargesBanksAndBins: null!,
            collectionVanPacks: [],
            pickups: [],
            transfers: [],
            additionalCosts: []);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.CollectionChargesBanksAndBins);
    }

    [Fact]
    public void Validate_WhenCollectionVanPacksIsNull_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateRequisitionDtoWithCollections(
            collectionChargesBanksAndBins: [],
            collectionVanPacks: null!,
            pickups: [],
            transfers: [],
            additionalCosts: []);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.CollectionVanPacks);
    }

    [Fact]
    public void Validate_WhenAdditionalCostsIsNull_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateRequisitionDtoWithCollections(
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            pickups: [],
            transfers: [],
            additionalCosts: null!);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.AdditionalCosts);
    }
}