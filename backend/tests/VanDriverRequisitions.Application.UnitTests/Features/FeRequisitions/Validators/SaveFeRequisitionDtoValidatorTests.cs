using FluentValidation.TestHelper;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.FeRequisitions.Validators;
using VanDriverRequisitions.Application.UnitTests.TestData;

namespace VanDriverRequisitions.Application.UnitTests.Features.FeRequisitions.Validators;

public sealed class SaveFeRequisitionDtoValidatorTests
{
    private readonly SaveFeRequisitionDtoValidator _validator = new();

    [Fact]
    public void Validate_WhenDtoIsValid_HasNoValidationErrors()
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateRequisitionDto();

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WhenRequisitionDateIsDefault_HasValidationError()
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateRequisitionDto(
            requisitionDate: default(DateOnly));

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.RequisitionDate);
    }

    [Fact]
    public void Validate_WhenVanDriverIdIsEmpty_HasValidationError()
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateRequisitionDto(
            vanDriverId: Guid.Empty);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.VanDriverId);
    }

    [Fact]
    public void Validate_WhenShopIdIsEmpty_HasValidationError()
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateRequisitionDto(
            shopId: Guid.Empty);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.ShopId);
    }

    [Fact]
    public void Validate_WhenAllChildCollectionsAreEmpty_HasValidationError()
    {
        // Arrange
        var dto = FeRequisitionDtoTestData.CreateRequisitionDto(
            generalTasks: [],
            mileages: [],
            transfers: [],
            additionalCosts: []);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x);
    }
    
    [Fact]
    public void Validate_WhenGeneralTasksIsNull_HasValidationError()
    {
        // Arrange
        var dto = CreateDto(
            generalTasks: null!,
            mileages: [],
            transfers: [],
            additionalCosts: []);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.FeGeneralTasks);
    }

    [Fact]
    public void Validate_WhenMileagesIsNull_HasValidationError()
    {
        // Arrange
        var dto = CreateDto(
            generalTasks: [FeRequisitionDtoTestData.CreateGeneralTaskDto()],
            mileages: null!,
            transfers: [],
            additionalCosts: []);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.FeMileages);
    }

    [Fact]
    public void Validate_WhenTransfersIsNull_HasValidationError()
    {
        // Arrange
        var dto = CreateDto(
            generalTasks: [FeRequisitionDtoTestData.CreateGeneralTaskDto()],
            mileages: [],
            transfers: null!,
            additionalCosts: []);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.FeTransfers);
    }

    [Fact]
    public void Validate_WhenAdditionalCostsIsNull_HasValidationError()
    {
        // Arrange
        var dto = CreateDto(
            generalTasks: [FeRequisitionDtoTestData.CreateGeneralTaskDto()],
            mileages: [],
            transfers: [],
            additionalCosts: null!);

        // Act
        var result = _validator.TestValidate(dto);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.FeAdditionalCosts);
    }
    
    private static SaveFeRequisitionDto CreateDto(
        IReadOnlyCollection<SaveFeGeneralTaskDto>? generalTasks,
        IReadOnlyCollection<SaveFeMileageDto>? mileages,
        IReadOnlyCollection<SaveFeTransferDto>? transfers,
        IReadOnlyCollection<SaveFeAdditionalCostDto>? additionalCosts)
    {
        return new SaveFeRequisitionDto
        {
            RequisitionDate = FeRequisitionDtoTestData.RequisitionDate,
            VanDriverId = Guid.NewGuid(),
            VanDriverName = "Test Driver",
            ShopId = Guid.NewGuid(),
            FeGeneralTasks = generalTasks!,
            FeMileages = mileages!,
            FeTransfers = transfers!,
            FeAdditionalCosts = additionalCosts!
        };
    }
}