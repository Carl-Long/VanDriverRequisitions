using FluentValidation.TestHelper;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.StdRequisitions.Validators;
using VanDriverRequisitions.Application.UnitTests.TestData;

namespace VanDriverRequisitions.Application.UnitTests.Features.StdRequisitions.Validators;

public sealed class SaveStdCollectionVanPackDtoValidatorTests
{
    private readonly SaveStdCollectionVanPackDtoValidator _validator = new();

    [Fact]
    public void Validate_WhenDtoIsValid_HasNoValidationErrors()
    {
        var dto = StdRequisitionDtoTestData.CreateVanPackDto();

        var result = _validator.TestValidate(dto);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WhenDeliveryDateIsDefault_HasValidationError()
    {
        var dto = new SaveStdCollectionVanPackDto
        {
            DeliveryDate = default(DateOnly),
            PostCodeZone = "AB",
            VanPacksOut = 10,
            FilledBags = 5
        };

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.DeliveryDate);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WhenPostCodeZoneIsMissing_HasValidationError(string postCodeZone)
    {
        var dto = StdRequisitionDtoTestData.CreateVanPackDto(postCodeZone: postCodeZone);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.PostCodeZone);
    }

    [Fact]
    public void Validate_WhenPostCodeZoneIsTooLong_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateVanPackDto(postCodeZone: new string('A', 21));

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.PostCodeZone);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Validate_WhenVanPacksOutIsNotPositive_HasValidationError(int vanPacksOut)
    {
        var dto = StdRequisitionDtoTestData.CreateVanPackDto(vanPacksOut: vanPacksOut, filledBags: 1);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.VanPacksOut);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Validate_WhenFilledBagsIsNotPositive_HasValidationError(int filledBags)
    {
        var dto = StdRequisitionDtoTestData.CreateVanPackDto(vanPacksOut: 10, filledBags: filledBags);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.FilledBags);
    }

    [Fact]
    public void Validate_WhenFilledBagsIsGreaterThanVanPacksOut_HasValidationError()
    {
        var dto = StdRequisitionDtoTestData.CreateVanPackDto(vanPacksOut: 5, filledBags: 6);

        var result = _validator.TestValidate(dto);

        result.ShouldHaveValidationErrorFor(x => x.FilledBags);
    }
}