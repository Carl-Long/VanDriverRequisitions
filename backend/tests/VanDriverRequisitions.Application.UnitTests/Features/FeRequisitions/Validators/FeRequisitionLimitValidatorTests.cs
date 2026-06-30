using FluentValidation;
using Moq;
using VanDriverRequisitions.Application.Features.FeRequisitions.Validators;
using VanDriverRequisitions.Application.Features.RequisitionLimitRules.Services;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.FE.Models;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Application.UnitTests.Features.FeRequisitions.Validators;

public sealed class FeRequisitionLimitValidatorTests
{
    private static readonly Guid TaskTypeId = Guid.NewGuid();
    private static readonly Guid ParkingReasonId = Guid.NewGuid();
    private static readonly Guid MileageReasonId = Guid.NewGuid();

    [Fact]
    public async Task ValidateAsync_WhenAllRowsAreWithinConfiguredLimits_DoesNotThrow()
    {
        // Arrange
        var validator = CreateValidator(
        [
            CreateRule(RequisitionRowCategory.GeneralTask, maxQuantity: 5, maxRate: 10m, feTaskTypeId: TaskTypeId),
            CreateRule(RequisitionRowCategory.Mileage, maxQuantity: 20, maxRate: 2m),
            CreateRule(RequisitionRowCategory.Transfer, maxQuantity: 5, maxRate: 10m),
            CreateRule(RequisitionRowCategory.AdditionalCost, maxQuantity: 5, maxRate: 15m),
        ]);

        var requisition = CreateRequisition(
            generalTasks: [CreateGeneralTask()],
            mileages: [CreateMileage()],
            transfers: [CreateTransfer()],
            additionalCosts:
            [
                CreateAdditionalJobCost(),
                CreateAdditionalMileageCost()
            ]);

        // Act
        var exception = await Record.ExceptionAsync(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Null(exception);
    }

    [Fact]
    public async Task ValidateAsync_WhenGeneralTaskRuleIsMissing_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator([]);

        var requisition = CreateRequisition(
            generalTasks: [CreateGeneralTask()]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "Form" &&
            x.ErrorMessage == "No limit rule is configured for Collections.");
    }

    [Fact]
    public async Task ValidateAsync_WhenGeneralTaskDailyQuantityExceedsLimit_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator(
        [
            CreateRule(RequisitionRowCategory.GeneralTask, maxQuantity: 2, maxRate: 10m, feTaskTypeId: TaskTypeId),
        ]);

        var requisition = CreateRequisition(
            generalTasks:
            [
                CreateGeneralTask(week: CreateWeek(monday: 3))
            ]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "TotalNumber" &&
            x.ErrorMessage == "Collections exceeds daily maximum of 2 on Monday.");
    }

    [Fact]
    public async Task ValidateAsync_WhenGeneralTaskRateExceedsLimit_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator(
        [
            CreateRule(RequisitionRowCategory.GeneralTask, maxQuantity: 5, maxRate: 10m, feTaskTypeId: TaskTypeId),
        ]);

        var requisition = CreateRequisition(
            generalTasks:
            [
                CreateGeneralTask(ratePerJob: 10.01m)
            ]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "RatePerJob" &&
            x.ErrorMessage == "Collections exceeds maximum rate of £10.00.");
    }

    [Fact]
    public async Task ValidateAsync_WhenMileageRuleIsMissing_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator([]);

        var requisition = CreateRequisition(
            mileages: [CreateMileage()]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "Form" &&
            x.ErrorMessage == "No limit rule is configured for mileage.");
    }

    [Fact]
    public async Task ValidateAsync_WhenMileageDailyQuantityExceedsLimit_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator(
        [
            CreateRule(RequisitionRowCategory.Mileage, maxQuantity: 10, maxRate: 2m),
        ]);

        var requisition = CreateRequisition(
            mileages:
            [
                CreateMileage(week: CreateWeek(tuesday: 11))
            ]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "TotalMiles" &&
            x.ErrorMessage == "Mileage exceeds daily maximum of 10 on Tuesday.");
    }

    [Fact]
    public async Task ValidateAsync_WhenMileageRateExceedsLimit_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator(
        [
            CreateRule(RequisitionRowCategory.Mileage, maxQuantity: 20, maxRate: 1.5m),
        ]);

        var requisition = CreateRequisition(
            mileages:
            [
                CreateMileage(ratePerMile: 1.51m)
            ]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "RatePerMile" &&
            x.ErrorMessage == "Mileage exceeds maximum rate of £1.50.");
    }

    [Fact]
    public async Task ValidateAsync_WhenTransferRuleIsMissing_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator([]);

        var requisition = CreateRequisition(
            transfers: [CreateTransfer()]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "Form" &&
            x.ErrorMessage == "No limit rule is configured for transfers.");
    }

    [Fact]
    public async Task ValidateAsync_WhenTransferDailyQuantityExceedsLimit_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator(
        [
            CreateRule(RequisitionRowCategory.Transfer, maxQuantity: 2, maxRate: 10m),
        ]);

        var requisition = CreateRequisition(
            transfers:
            [
                CreateTransfer(week: CreateWeek(wednesday: 3))
            ]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "TotalNumber" &&
            x.ErrorMessage == "Transfer exceeds daily maximum of 2 on Wednesday.");
    }

    [Fact]
    public async Task ValidateAsync_WhenTransferRateExceedsLimit_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator(
        [
            CreateRule(RequisitionRowCategory.Transfer, maxQuantity: 5, maxRate: 4m),
        ]);

        var requisition = CreateRequisition(
            transfers:
            [
                CreateTransfer(ratePerJob: 4.01m)
            ]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "RatePerJob" &&
            x.ErrorMessage == "Transfer exceeds maximum rate of £4.00.");
    }

    [Fact]
    public async Task ValidateAsync_WhenAdditionalJobRuleIsMissing_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator([]);

        var requisition = CreateRequisition(
            additionalCosts: [CreateAdditionalJobCost()]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "Form" &&
            x.ErrorMessage == "No limit rule is configured for additional costs.");
    }

    [Fact]
    public async Task ValidateAsync_WhenAdditionalJobQuantityExceedsLimit_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator(
        [
            CreateRule(RequisitionRowCategory.AdditionalCost, maxQuantity: 2, maxRate: 15m),
        ]);

        var requisition = CreateRequisition(
            additionalCosts:
            [
                CreateAdditionalJobCost(totalNumber: 3)
            ]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "TotalNumber" &&
            x.ErrorMessage == "Additional cost exceeds maximum quantity of 2.");
    }

    [Fact]
    public async Task ValidateAsync_WhenAdditionalJobRateExceedsLimit_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator(
        [
            CreateRule(RequisitionRowCategory.AdditionalCost, maxQuantity: 5, maxRate: 12m),
        ]);

        var requisition = CreateRequisition(
            additionalCosts:
            [
                CreateAdditionalJobCost(ratePerJob: 12.01m)
            ]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "RatePerJob" &&
            x.ErrorMessage == "Additional cost exceeds maximum rate of £12.00.");
    }

    [Fact]
    public async Task ValidateAsync_WhenAdditionalMileageRuleIsMissing_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator([]);

        var requisition = CreateRequisition(
            additionalCosts: [CreateAdditionalMileageCost()]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "Form" &&
            x.ErrorMessage == "No limit rule is configured for mileage.");
    }

    [Fact]
    public async Task ValidateAsync_WhenAdditionalMileageQuantityExceedsLimit_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator(
        [
            CreateRule(RequisitionRowCategory.Mileage, maxQuantity: 10, maxRate: 2m),
        ]);

        var requisition = CreateRequisition(
            additionalCosts:
            [
                CreateAdditionalMileageCost(miles: 11)
            ]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "Miles" &&
            x.ErrorMessage == "Additional cost mileage exceeds maximum quantity of 10.");
    }

    [Fact]
    public async Task ValidateAsync_WhenAdditionalMileageRateExceedsLimit_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator([CreateRule(RequisitionRowCategory.Mileage, maxQuantity: 20, maxRate: 1.5m),]);

        var requisition = CreateRequisition(additionalCosts: [CreateAdditionalMileageCost(ratePerMile: 1.51m)]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() => validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "RatePerMile" &&
            x.ErrorMessage == "Additional cost mileage exceeds maximum rate of £1.50.");
    }

    private static FeRequisitionLimitValidator CreateValidator(IReadOnlyList<RequisitionLimitRule> rules)
    {
        var provider = new Mock<IRequisitionLimitRuleProvider>();

        provider
            .Setup(x => x.GetFeLimitRulesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(rules);

        return new FeRequisitionLimitValidator(provider.Object);
    }

    private static RequisitionLimitRule CreateRule(
        RequisitionRowCategory category,
        int maxQuantity,
        decimal maxRate,
        Guid? feTaskTypeId = null)
    {
        return RequisitionLimitRule.Create(
            new RequisitionLimitRuleDetails(
                category,
                feTaskTypeId,
                Fascia.Fe,
                maxQuantity,
                maxRate));
    }

    private static FeRequisition CreateRequisition(
        IReadOnlyCollection<FeGeneralTaskUpdateModel>? generalTasks = null,
        IReadOnlyCollection<FeMileageUpdateModel>? mileages = null,
        IReadOnlyCollection<FeTransferUpdateModel>? transfers = null,
        IReadOnlyCollection<FeAdditionalCostUpdateModel>? additionalCosts = null)
    {
        return FeRequisition.Create(
            "F000000001",
            new FeRequisitionUpdateModel(
                CreateDetails(),
                generalTasks ?? [],
                mileages ?? [],
                transfers ?? [],
                additionalCosts ?? []));
    }

    private static RequisitionDetails CreateDetails()
    {
        return new RequisitionDetails(
            new DateOnly(2026, 6, 13),
            new VanDriverSnapshot(
                Guid.NewGuid(),
                "VD001",
                "Test Driver",
                "Test Driver Trading",
                HasVat: true),
            new ShopSnapshot(
                Guid.NewGuid(),
                "S001",
                "Test Shop"));
    }

    private static FeGeneralTaskUpdateModel CreateGeneralTask(
        WeeklyQuantities? week = null,
        decimal? ratePerJob = 5m)
    {
        return new FeGeneralTaskUpdateModel(
            Id: null,
            FeTaskTypeId: TaskTypeId,
            TaskTypeName: "Collections",
            TaskTypeCode: "23707",
            WeekEndingDate: new DateOnly(2026, 6, 14),
            Week: week ?? CreateWeek(monday: 1),
            RatePerJob: ratePerJob);
    }

    private static FeMileageUpdateModel CreateMileage(
        WeeklyQuantities? week = null,
        decimal? ratePerMile = 1m)
    {
        return new FeMileageUpdateModel(
            Id: null,
            WeekEndingDate: new DateOnly(2026, 6, 14),
            Week: week ?? CreateWeek(tuesday: 5),
            RatePerMile: ratePerMile);
    }

    private static FeTransferUpdateModel CreateTransfer(
        WeeklyQuantities? week = null,
        decimal? ratePerJob = 3m)
    {
        return new FeTransferUpdateModel(
            Id: null,
            FromShop: new ShopSnapshot(Guid.NewGuid(), "S001", "From Shop"),
            ToShop: new ShopSnapshot(Guid.NewGuid(), "S002", "To Shop"),
            WeekEndingDate: new DateOnly(2026, 6, 14),
            Week: week ?? CreateWeek(wednesday: 1),
            RatePerJob: ratePerJob);
    }

    private static FeAdditionalCostUpdateModel CreateAdditionalJobCost(
        int? totalNumber = 1,
        decimal? ratePerJob = 10m)
    {
        return new FeAdditionalCostUpdateModel(
            Id: null,
            WeekEndingDate: new DateOnly(2026, 6, 14),
            ReasonId: ParkingReasonId,
            ReasonCodeSnapshot: "10001",
            ReasonTextSnapshot: "Parking",
            ChargingOption: ChargingOption.Job,
            TotalNumber: totalNumber,
            RatePerJob: ratePerJob,
            Miles: null,
            RatePerMile: null);
    }

    private static FeAdditionalCostUpdateModel CreateAdditionalMileageCost(
        int? miles = 5,
        decimal? ratePerMile = 1m)
    {
        return new FeAdditionalCostUpdateModel(
            Id: null,
            WeekEndingDate: new DateOnly(2026, 6, 14),
            ReasonId: MileageReasonId,
            ReasonCodeSnapshot: "10002",
            ReasonTextSnapshot: "Mileage",
            ChargingOption: ChargingOption.Mileage,
            TotalNumber: null,
            RatePerJob: null,
            Miles: miles,
            RatePerMile: ratePerMile);
    }

    private static WeeklyQuantities CreateWeek(
        int? sunday = null,
        int? monday = null,
        int? tuesday = null,
        int? wednesday = null,
        int? thursday = null,
        int? friday = null,
        int? saturday = null)
    {
        return new WeeklyQuantities(
            sunday,
            monday,
            tuesday,
            wednesday,
            thursday,
            friday,
            saturday);
    }
}