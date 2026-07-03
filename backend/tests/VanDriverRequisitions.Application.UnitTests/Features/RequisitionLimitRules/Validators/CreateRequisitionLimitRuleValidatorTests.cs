using FluentValidation.TestHelper;
using VanDriverRequisitions.Application.Features.RequisitionLimitRules.Dtos;
using VanDriverRequisitions.Application.Features.RequisitionLimitRules.Validators;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.UnitTests.Features.RequisitionLimitRules.Validators;

public sealed class CreateRequisitionLimitRuleValidatorTests
{
    private static readonly Guid FeTaskTypeId = new("11111111-1111-1111-1111-111111111111");

    private readonly CreateRequisitionLimitRuleDtoValidator _validator = new();

    public static TheoryData<RequisitionRowCategory, Fascia> ValidCategoryFasciaCombinations => new()
    {
        { RequisitionRowCategory.GeneralTask, Fascia.Fe },
        { RequisitionRowCategory.Mileage, Fascia.Fe },
        { RequisitionRowCategory.Transfer, Fascia.Fe },
        { RequisitionRowCategory.AdditionalCost, Fascia.Fe },
        { RequisitionRowCategory.Mileage, Fascia.Std },
        { RequisitionRowCategory.FlatCharge, Fascia.Std },
        { RequisitionRowCategory.VanPack, Fascia.Std }
    };

    public static TheoryData<RequisitionRowCategory, Fascia> InvalidCategoryFasciaCombinations => new()
    {
        { RequisitionRowCategory.GeneralTask, Fascia.Std },
        { RequisitionRowCategory.Transfer, Fascia.Std },
        { RequisitionRowCategory.AdditionalCost, Fascia.Std },
        { RequisitionRowCategory.FlatCharge, Fascia.Fe },
        { RequisitionRowCategory.VanPack, Fascia.Fe }
    };

    public static TheoryData<decimal> InvalidMaxRates => new()
    {
        0m,
        0.001m,
        -0.01m
    };

    [Theory]
    [MemberData(nameof(ValidCategoryFasciaCombinations))]
    public void Validate_WhenCategoryIsSupportedForFascia_HasNoCategoryValidationError(
        RequisitionRowCategory category,
        Fascia fascia)
    {
        // Arrange
        var dto = CreateDto(
            category: category,
            fascia: fascia,
            feTaskTypeId: IsFeGeneralTask(category, fascia) ? FeTaskTypeId : null);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Category);
    }

    [Theory]
    [MemberData(nameof(InvalidCategoryFasciaCombinations))]
    public void Validate_WhenCategoryIsNotSupportedForFascia_HasCategoryValidationError(
        RequisitionRowCategory category,
        Fascia fascia)
    {
        // Arrange
        var dto = CreateDto(
            category: category,
            fascia: fascia,
            feTaskTypeId: null);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Category);
    }

    [Fact]
    public void Validate_WhenFeGeneralTaskHasTaskType_HasNoFeTaskTypeValidationError()
    {
        // Arrange
        var dto = CreateDto(
            category: RequisitionRowCategory.GeneralTask,
            fascia: Fascia.Fe,
            feTaskTypeId: FeTaskTypeId);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.FeTaskTypeId);
    }

    [Fact]
    public void Validate_WhenFeGeneralTaskHasNoTaskType_HasFeTaskTypeValidationError()
    {
        // Arrange
        var dto = CreateDto(
            category: RequisitionRowCategory.GeneralTask,
            fascia: Fascia.Fe,
            feTaskTypeId: null);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.FeTaskTypeId);
    }

    [Theory]
    [InlineData(RequisitionRowCategory.Mileage, Fascia.Fe)]
    [InlineData(RequisitionRowCategory.Transfer, Fascia.Fe)]
    [InlineData(RequisitionRowCategory.AdditionalCost, Fascia.Fe)]
    [InlineData(RequisitionRowCategory.Mileage, Fascia.Std)]
    [InlineData(RequisitionRowCategory.FlatCharge, Fascia.Std)]
    [InlineData(RequisitionRowCategory.VanPack, Fascia.Std)]
    public void Validate_WhenNonFeGeneralTaskHasTaskType_HasFeTaskTypeValidationError(
        RequisitionRowCategory category,
        Fascia fascia)
    {
        // Arrange
        var dto = CreateDto(
            category: category,
            fascia: fascia,
            feTaskTypeId: FeTaskTypeId);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.FeTaskTypeId);
    }

    [Fact]
    public void Validate_WhenMaxQuantityIsZero_HasValidationError()
    {
        // Arrange
        var dto = CreateDto(
            category: RequisitionRowCategory.GeneralTask,
            fascia: Fascia.Fe,
            feTaskTypeId: FeTaskTypeId,
            maxQuantity: 0);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.MaxQuantity);
    }

    [Theory]
    [MemberData(nameof(InvalidMaxRates))]
    public void Validate_WhenMaxRateIsInvalid_HasValidationError(decimal maxRate)
    {
        // Arrange
        var dto = CreateDto(
            category: RequisitionRowCategory.GeneralTask,
            fascia: Fascia.Fe,
            feTaskTypeId: FeTaskTypeId,
            maxRate: maxRate);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.MaxRate);
    }

    [Fact]
    public void Validate_WhenMaxRateHasMoreThanTwoDecimalPlaces_HasValidationError()
    {
        // Arrange
        var dto = CreateDto(
            category: RequisitionRowCategory.GeneralTask,
            fascia: Fascia.Fe,
            feTaskTypeId: FeTaskTypeId,
            maxRate: 1.555m);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.MaxRate);
    }

    private static CreateRequisitionLimitRuleDto CreateDto(
        RequisitionRowCategory category,
        Fascia fascia,
        Guid? feTaskTypeId,
        int maxQuantity = 30,
        decimal maxRate = 15.00m)
    {
        return new CreateRequisitionLimitRuleDto
        {
            Category = category,
            Fascia = fascia,
            FeTaskTypeId = feTaskTypeId,
            MaxQuantity = maxQuantity,
            MaxRate = maxRate
        };
    }

    private static bool IsFeGeneralTask(RequisitionRowCategory category, Fascia fascia)
    {
        return fascia == Fascia.Fe && category == RequisitionRowCategory.GeneralTask;
    }
}