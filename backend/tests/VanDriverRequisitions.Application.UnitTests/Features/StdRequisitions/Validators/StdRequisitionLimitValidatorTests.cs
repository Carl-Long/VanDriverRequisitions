using FluentValidation;
using Moq;
using VanDriverRequisitions.Application.Features.RequisitionLimitRules.Services;
using VanDriverRequisitions.Application.Features.StdRequisitions.Validators;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Entities.STD.Models;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.UnitTests.Features.StdRequisitions.Validators;

public sealed class StdRequisitionLimitValidatorTests
{
    private static readonly Guid ShopId = Guid.NewGuid();
    private static readonly Guid CollectionTypeId = Guid.NewGuid();
    private static readonly Guid LocationId = Guid.NewGuid();
    private static readonly Guid ReasonId = Guid.NewGuid();

    [Fact]
    public async Task ValidateAsync_WhenAllRowsAreWithinConfiguredLimits_DoesNotThrow()
    {
        // Arrange
        var validator = CreateValidator(
        [
            CreateRule(RequisitionRowCategory.Mileage, maxQuantity: 20, maxRate: 2m),
            CreateRule(RequisitionRowCategory.FlatCharge, maxQuantity: 1, maxRate: 25m),
            CreateRule(RequisitionRowCategory.VanPack, maxQuantity: 10, maxRate: 4.25m),
        ]);

        var requisition = CreateRequisition(
            pickups: [CreateMileagePickup()],
            transfers: [CreateMileageTransfer()],
            collectionCharges: [CreateMileageBanksAndBins()],
            collectionVanPacks: [CreateVanPack()],
            additionalCosts:
            [
                CreateMileageAdditionalCost(),
                CreateFlatAdditionalCost()
            ]);

        // Act
        var exception = await Record.ExceptionAsync(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Null(exception);
    }

    [Fact]
    public async Task ValidateAsync_WhenMileageRuleIsMissing_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator([]);

        var requisition = CreateRequisition(
            pickups: [CreateMileagePickup()]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "Form" &&
            x.ErrorMessage == "No limit rule is configured for STD mileage.");
    }

    [Fact]
    public async Task ValidateAsync_WhenFlatChargeRuleIsMissing_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator([]);

        var requisition = CreateRequisition(
            pickups: [CreateFlatPickup()]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "Form" &&
            x.ErrorMessage == "No limit rule is configured for STD flat charges.");
    }

    [Fact]
    public async Task ValidateAsync_WhenPickupMileageQuantityExceedsLimit_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator(
        [
            CreateRule(RequisitionRowCategory.Mileage, maxQuantity: 10, maxRate: 2m),
        ]);

        var requisition = CreateRequisition(
            pickups:
            [
                CreateMileagePickup(miles: 11)
            ]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "Miles" &&
            x.ErrorMessage == "Pickup mileage exceeds maximum quantity of 10.");
    }

    [Fact]
    public async Task ValidateAsync_WhenPickupMileageRateExceedsLimit_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator(
        [
            CreateRule(RequisitionRowCategory.Mileage, maxQuantity: 20, maxRate: 1.5m),
        ]);

        var requisition = CreateRequisition(
            pickups:
            [
                CreateMileagePickup(ratePerMile: 1.51m)
            ]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "RatePerMile" &&
            x.ErrorMessage == "Pickup mileage exceeds maximum rate of £1.50.");
    }

    [Fact]
    public async Task ValidateAsync_WhenPickupFlatChargeExceedsLimit_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator(
        [
            CreateRule(RequisitionRowCategory.FlatCharge, maxQuantity: 1, maxRate: 10m),
        ]);

        var requisition = CreateRequisition(
            pickups:
            [
                CreateFlatPickup(flatCharge: 10.01m)
            ]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "FlatCharge" &&
            x.ErrorMessage == "Pickup flat charge exceeds maximum rate of £10.00.");
    }

    [Fact]
    public async Task ValidateAsync_WhenTransferMileageQuantityExceedsLimit_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator(
        [
            CreateRule(RequisitionRowCategory.Mileage, maxQuantity: 12, maxRate: 2m),
        ]);

        var requisition = CreateRequisition(
            transfers:
            [
                CreateMileageTransfer(miles: 13)
            ]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "Miles" &&
            x.ErrorMessage == "Transfer mileage exceeds maximum quantity of 12.");
    }

    [Fact]
    public async Task ValidateAsync_WhenTransferMileageRateExceedsLimit_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator(
        [
            CreateRule(RequisitionRowCategory.Mileage, maxQuantity: 20, maxRate: 1.5m),
        ]);

        var requisition = CreateRequisition(
            transfers:
            [
                CreateMileageTransfer(ratePerMile: 1.51m)
            ]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "RatePerMile" &&
            x.ErrorMessage == "Transfer mileage exceeds maximum rate of £1.50.");
    }

    [Fact]
    public async Task ValidateAsync_WhenTransferFlatChargeExceedsLimit_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator(
        [
            CreateRule(RequisitionRowCategory.FlatCharge, maxQuantity: 1, maxRate: 15m),
        ]);

        var requisition = CreateRequisition(
            transfers:
            [
                CreateFlatTransfer(flatCharge: 15.01m)
            ]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "FlatCharge" &&
            x.ErrorMessage == "Transfer flat charge exceeds maximum rate of £15.00.");
    }

    [Fact]
    public async Task ValidateAsync_WhenBanksAndBinsMileageQuantityExceedsLimit_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator(
        [
            CreateRule(RequisitionRowCategory.Mileage, maxQuantity: 8, maxRate: 2m),
        ]);

        var requisition = CreateRequisition(
            collectionCharges:
            [
                CreateMileageBanksAndBins(miles: 9)
            ]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "Miles" &&
            x.ErrorMessage == "Banks & Bins mileage exceeds maximum quantity of 8.");
    }

    [Fact]
    public async Task ValidateAsync_WhenBanksAndBinsMileageRateExceedsLimit_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator(
        [
            CreateRule(RequisitionRowCategory.Mileage, maxQuantity: 20, maxRate: 1.5m),
        ]);

        var requisition = CreateRequisition(
            collectionCharges:
            [
                CreateMileageBanksAndBins(ratePerMile: 1.51m)
            ]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "RatePerMile" &&
            x.ErrorMessage == "Banks & Bins mileage exceeds maximum rate of £1.50.");
    }

    [Fact]
    public async Task ValidateAsync_WhenBanksAndBinsFlatChargeExceedsLimit_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator(
        [
            CreateRule(RequisitionRowCategory.FlatCharge, maxQuantity: 1, maxRate: 20m),
        ]);

        var requisition = CreateRequisition(
            collectionCharges:
            [
                CreateFlatBanksAndBins(flatCharge: 20.01m)
            ]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "FlatCharge" &&
            x.ErrorMessage == "Banks & Bins flat charge exceeds maximum rate of £20.00.");
    }

    [Fact]
    public async Task ValidateAsync_WhenAdditionalCostMileageQuantityExceedsLimit_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator(
        [
            CreateRule(RequisitionRowCategory.Mileage, maxQuantity: 10, maxRate: 2m),
        ]);

        var requisition = CreateRequisition(
            additionalCosts:
            [
                CreateMileageAdditionalCost(miles: 11)
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
    public async Task ValidateAsync_WhenAdditionalCostMileageRateExceedsLimit_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator(
        [
            CreateRule(RequisitionRowCategory.Mileage, maxQuantity: 20, maxRate: 1.5m),
        ]);

        var requisition = CreateRequisition(
            additionalCosts:
            [
                CreateMileageAdditionalCost(ratePerMile: 1.51m)
            ]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "RatePerMile" &&
            x.ErrorMessage == "Additional cost mileage exceeds maximum rate of £1.50.");
    }

    [Fact]
    public async Task ValidateAsync_WhenAdditionalCostFlatChargeExceedsLimit_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator(
        [
            CreateRule(RequisitionRowCategory.FlatCharge, maxQuantity: 1, maxRate: 25m),
        ]);

        var requisition = CreateRequisition(
            additionalCosts:
            [
                CreateFlatAdditionalCost(flatCharge: 25.01m)
            ]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "FlatCharge" &&
            x.ErrorMessage == "Additional cost flat charge exceeds maximum rate of £25.00.");
    }

    [Fact]
    public async Task ValidateAsync_WhenVanPackRuleIsMissing_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator([]);

        var requisition = CreateRequisition(
            collectionVanPacks:
            [
                CreateVanPack()
            ]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "Form" &&
            x.ErrorMessage == "No limit rule is configured for van packs.");
    }

    [Fact]
    public async Task ValidateAsync_WhenVanPacksOutExceedsLimit_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator(
        [
            CreateRule(RequisitionRowCategory.VanPack, maxQuantity: 5, maxRate: 4.25m),
        ]);

        var requisition = CreateRequisition(
            collectionVanPacks:
            [
                CreateVanPack(vanPacksOut: 6, filledBags: 4, ratePerVanPack: 4.25m)
            ]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "VanPacksOut" &&
            x.ErrorMessage == "Van packs exceeds maximum quantity of 5.");
    }

    [Fact]
    public async Task ValidateAsync_WhenVanPackRateDoesNotMatchConfiguredRate_ThrowsValidationException()
    {
        // Arrange
        var validator = CreateValidator(
        [
            CreateRule(RequisitionRowCategory.VanPack, maxQuantity: 10, maxRate: 4.25m),
        ]);

        var requisition = CreateRequisition(
            collectionVanPacks:
            [
                CreateVanPack(ratePerVanPack: 4.26m)
            ]);

        // Act
        var exception = await Assert.ThrowsAsync<ValidationException>(() =>
            validator.ValidateAsync(requisition, CancellationToken.None));

        // Assert
        Assert.Contains(exception.Errors, x =>
            x.PropertyName == "RatePerVanPack" &&
            x.ErrorMessage == "Van pack price must be £4.25.");
    }

    private static StdRequisitionLimitValidator CreateValidator(
        IReadOnlyList<RequisitionLimitRule> rules)
    {
        var provider = new Mock<IRequisitionLimitRuleProvider>();

        provider
            .Setup(x => x.GetStdLimitRulesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(rules);

        return new StdRequisitionLimitValidator(provider.Object);
    }

    private static RequisitionLimitRule CreateRule(
        RequisitionRowCategory category,
        int maxQuantity,
        decimal maxRate)
    {
        return RequisitionLimitRule.Create(
            new RequisitionLimitRuleDetails(
                category,
                FeTaskTypeId: null,
                Fascia.Std,
                maxQuantity,
                maxRate));
    }

    private static StdRequisition CreateRequisition(
        IReadOnlyCollection<StdPickupUpdateModel>? pickups = null,
        IReadOnlyCollection<StdTransferUpdateModel>? transfers = null,
        IReadOnlyCollection<StdCollectionChargeBanksAndBinsUpdateModel>? collectionCharges = null,
        IReadOnlyCollection<StdCollectionVanPackUpdateModel>? collectionVanPacks = null,
        IReadOnlyCollection<StdAdditionalCostUpdateModel>? additionalCosts = null)
    {
        return StdRequisition.Create(
            "S000000001",
            new StdRequisitionUpdateModel(
                CreateDetails(),
                pickups ?? [],
                transfers ?? [],
                collectionCharges ?? [],
                collectionVanPacks ?? [],
                additionalCosts ?? []));
    }

    private static StdRequisitionDetails CreateDetails()
    {
        return new StdRequisitionDetails(
            new DateOnly(2026, 6, 13),
            new VanDriverSnapshot(
                Guid.NewGuid(),
                "VD001",
                "Test Driver",
                "Test Driver Trading",
                HasVat: true),
            new ShopSnapshot(
                ShopId,
                "S001",
                "Test Shop"));
    }

    private static StdPickupUpdateModel CreateMileagePickup(
        int? miles = 5,
        decimal? ratePerMile = 1m)
    {
        return new StdPickupUpdateModel(
            Id: null,
            Date: new DateOnly(2026, 6, 14),
            NumberOfBags: 1,
            NumberOfHouseholds: 1,
            ChargeType: StdChargeType.Mileage,
            Miles: miles,
            RatePerMile: ratePerMile,
            FlatCharge: null);
    }

    private static StdPickupUpdateModel CreateFlatPickup(decimal? flatCharge = 10m)
    {
        return new StdPickupUpdateModel(
            Id: null,
            Date: new DateOnly(2026, 6, 14),
            NumberOfBags: 1,
            NumberOfHouseholds: 1,
            ChargeType: StdChargeType.FlatCharge,
            Miles: null,
            RatePerMile: null,
            FlatCharge: flatCharge);
    }

    private static StdTransferUpdateModel CreateMileageTransfer(
        int? miles = 5,
        decimal? ratePerMile = 1m)
    {
        return new StdTransferUpdateModel(
            Id: null,
            Date: new DateOnly(2026, 6, 14),
            FromShop: new ShopSnapshot(Guid.NewGuid(), "S002", "From Shop"),
            ToShop: new ShopSnapshot(Guid.NewGuid(), "S003", "To Shop"),
            NumberOfBags: 1,
            NumberOfBoxes: 1,
            ChargeType: StdChargeType.Mileage,
            NumberOfMiles: miles,
            RatePerMile: ratePerMile,
            FlatCharge: null);
    }

    private static StdTransferUpdateModel CreateFlatTransfer(decimal? flatCharge = 10m)
    {
        return new StdTransferUpdateModel(
            Id: null,
            Date: new DateOnly(2026, 6, 14),
            FromShop: new ShopSnapshot(Guid.NewGuid(), "S002", "From Shop"),
            ToShop: new ShopSnapshot(Guid.NewGuid(), "S003", "To Shop"),
            NumberOfBags: 1,
            NumberOfBoxes: 1,
            ChargeType: StdChargeType.FlatCharge,
            NumberOfMiles: null,
            RatePerMile: null,
            FlatCharge: flatCharge);
    }

    private static StdCollectionChargeBanksAndBinsUpdateModel CreateMileageBanksAndBins(
        int? miles = 5,
        decimal? ratePerMile = 1m)
    {
        return new StdCollectionChargeBanksAndBinsUpdateModel(
            Id: null,
            Date: new DateOnly(2026, 6, 14),
            CollectionTypeId,
            CollectionTypeName: "Banks & Bins",
            CollectionTypeCode: "2389",
            LocationId,
            LocationShopId: ShopId,
            LocationCollectionTypeId: CollectionTypeId,
            LocationName: "Test Location",
            LocationPostCode: "AB1 2CD",
            NumberOfBags: 1,
            ChargeType: StdChargeType.Mileage,
            Miles: miles,
            RatePerMile: ratePerMile,
            FlatCharge: null);
    }

    private static StdCollectionChargeBanksAndBinsUpdateModel CreateFlatBanksAndBins(
        decimal? flatCharge = 10m)
    {
        return new StdCollectionChargeBanksAndBinsUpdateModel(
            Id: null,
            Date: new DateOnly(2026, 6, 14),
            CollectionTypeId,
            CollectionTypeName: "Banks & Bins",
            CollectionTypeCode: "2389",
            LocationId,
            LocationShopId: ShopId,
            LocationCollectionTypeId: CollectionTypeId,
            LocationName: "Test Location",
            LocationPostCode: "AB1 2CD",
            NumberOfBags: 1,
            ChargeType: StdChargeType.FlatCharge,
            Miles: null,
            RatePerMile: null,
            FlatCharge: flatCharge);
    }

    private static StdCollectionVanPackUpdateModel CreateVanPack(
        int vanPacksOut = 5,
        int filledBags = 3,
        decimal ratePerVanPack = 4.25m)
    {
        return new StdCollectionVanPackUpdateModel(
            Id: null,
            DeliveryDate: new DateOnly(2026, 6, 15),
            PostCodeZone: "AB",
            VanPacksOut: vanPacksOut,
            FilledBags: filledBags,
            RatePerVanPack: ratePerVanPack);
    }

    private static StdAdditionalCostUpdateModel CreateMileageAdditionalCost(
        int? miles = 5,
        decimal? ratePerMile = 1m)
    {
        return new StdAdditionalCostUpdateModel(
            Id: null,
            Date: new DateOnly(2026, 6, 14),
            ReasonId,
            ReasonCodeSnapshot: "10001",
            ReasonTextSnapshot: "Mileage",
            NumberOfBags: 1,
            ChargeType: StdChargeType.Mileage,
            Miles: miles,
            RatePerMile: ratePerMile,
            FlatCharge: null);
    }

    private static StdAdditionalCostUpdateModel CreateFlatAdditionalCost(
        decimal? flatCharge = 10m)
    {
        return new StdAdditionalCostUpdateModel(
            Id: null,
            Date: new DateOnly(2026, 6, 14),
            ReasonId,
            ReasonCodeSnapshot: "10002",
            ReasonTextSnapshot: "Parking",
            NumberOfBags: 1,
            ChargeType: StdChargeType.FlatCharge,
            Miles: null,
            RatePerMile: null,
            FlatCharge: flatCharge);
    }
}