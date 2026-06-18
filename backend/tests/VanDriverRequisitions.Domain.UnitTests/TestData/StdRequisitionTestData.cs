using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Entities.STD.Models;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Domain.UnitTests.TestData;

public static class StdRequisitionTestData
{
    public const string RequisitionNumber = "S000000001";

    public static readonly DateOnly RequisitionDate = new(2026, 6, 13);
    public static readonly DateOnly RowDate = new(2026, 6, 13);

    // Default model totals:
    // Pickup mileage: 10 miles * £0.50 = £5.00
    // Transfer flat charge: £12.00
    // Banks/Bins mileage: 20 miles * £0.45 = £9.00
    // Van packs: 5 van packs out * £2.00 = £10.00
    // Additional cost flat charge: £7.50
    // Total = £43.50
    public const decimal FullModelExpectedSubtotal = 43.50m;

    public static StdRequisitionUpdateModel CreateUpdateModel(
        StdRequisitionDetails? details = null,
        IReadOnlyCollection<StdPickupUpdateModel>? pickups = null,
        IReadOnlyCollection<StdTransferUpdateModel>? transfers = null,
        IReadOnlyCollection<StdCollectionChargeBanksAndBinsUpdateModel>? collectionChargesBanksAndBins = null,
        IReadOnlyCollection<StdCollectionVanPackUpdateModel>? collectionVanPacks = null,
        IReadOnlyCollection<StdAdditionalCostUpdateModel>? additionalCosts = null)
    {
        return new StdRequisitionUpdateModel(
            details ?? CreateDetails(),
            pickups ?? [CreatePickupMileageModel()],
            transfers ?? [CreateTransferFlatChargeModel()],
            collectionChargesBanksAndBins ?? [CreateCollectionChargeMileageModel()],
            collectionVanPacks ?? [CreateCollectionVanPackModel()],
            additionalCosts ?? [CreateAdditionalFlatChargeCostModel()]);
    }

    public static StdRequisitionDetails CreateDetails(
        DateOnly? requisitionDate = null,
        VanDriverSnapshot? driver = null,
        ShopSnapshot? shop = null)
    {
        return new StdRequisitionDetails(
            requisitionDate ?? RequisitionDate,
            driver ?? CreateDriverSnapshot(),
            shop ?? CreateShopSnapshot(id: DefaultShopId, code: "S001", name: "Central London Store"));
    }

    public static readonly Guid DefaultShopId = Guid.NewGuid();
    public static readonly Guid DefaultCollectionTypeId = Guid.NewGuid();

    public static VanDriverSnapshot CreateDriverSnapshot(
        Guid? id = null,
        string code = "810001",
        string name = "John Smith",
        string tradersName = "John Smith Trading",
        bool hasVat = true)
    {
        return new VanDriverSnapshot(id ?? Guid.NewGuid(), code, name, tradersName, hasVat);
    }

    public static ShopSnapshot CreateShopSnapshot(Guid? id = null, string code = "S001", string name = "Test Shop")
    {
        return new ShopSnapshot(id ?? Guid.NewGuid(), code, name);
    }

    public static StdPickupUpdateModel CreatePickupMileageModel(
        Guid? id = null,
        DateOnly? date = null,
        int numberOfBags = 3,
        int numberOfHouseholds = 2,
        int? miles = 10,
        decimal? ratePerMile = 0.50m)
    {
        return new StdPickupUpdateModel(
            id,
            date ?? RowDate,
            numberOfBags,
            numberOfHouseholds,
            StdChargeType.Mileage,
            miles,
            ratePerMile,
            FlatCharge: null);
    }

    public static StdPickupUpdateModel CreatePickupFlatChargeModel(
        Guid? id = null,
        DateOnly? date = null,
        int numberOfBags = 3,
        int numberOfHouseholds = 2,
        decimal? flatCharge = 15m)
    {
        return new StdPickupUpdateModel(
            id,
            date ?? RowDate,
            numberOfBags,
            numberOfHouseholds,
            StdChargeType.FlatCharge,
            Miles: null,
            RatePerMile: null,
            flatCharge);
    }

    public static StdTransferUpdateModel CreateTransferFlatChargeModel(
        Guid? id = null,
        DateOnly? date = null,
        ShopSnapshot? fromShop = null,
        ShopSnapshot? toShop = null,
        int? numberOfBags = 4,
        int? numberOfBoxes = 1,
        decimal? flatCharge = 12m)
    {
        return new StdTransferUpdateModel(
            id,
            date ?? RowDate,
            fromShop ?? CreateShopSnapshot(code: "S001", name: "From Shop"),
            toShop ?? CreateShopSnapshot(code: "S002", name: "To Shop"),
            numberOfBags,
            numberOfBoxes,
            StdChargeType.FlatCharge,
            NumberOfMiles: null,
            RatePerMile: null,
            flatCharge);
    }

    public static StdTransferUpdateModel CreateTransferMileageModel(
        Guid? id = null,
        DateOnly? date = null,
        ShopSnapshot? fromShop = null,
        ShopSnapshot? toShop = null,
        int? numberOfBags = 4,
        int? numberOfBoxes = 1,
        int? numberOfMiles = 10,
        decimal? ratePerMile = 0.50m)
    {
        return new StdTransferUpdateModel(
            id,
            date ?? RowDate,
            fromShop ?? CreateShopSnapshot(code: "S001", name: "From Shop"),
            toShop ?? CreateShopSnapshot(code: "S002", name: "To Shop"),
            numberOfBags,
            numberOfBoxes,
            StdChargeType.Mileage,
            numberOfMiles,
            ratePerMile,
            FlatCharge: null);
    }

    public static StdCollectionChargeBanksAndBinsUpdateModel CreateCollectionChargeMileageModel(
        Guid? id = null,
        DateOnly? date = null,
        Guid? collectionTypeId = null,
        Guid? locationId = null,
        Guid? locationShopId = null,
        Guid? locationCollectionTypeId = null,
        int? numberOfBags = 5,
        int? miles = 20,
        decimal? ratePerMile = 0.45m)
    {
        var resolvedCollectionTypeId = collectionTypeId ?? DefaultCollectionTypeId;

        return new StdCollectionChargeBanksAndBinsUpdateModel(
            id,
            date ?? RowDate,
            resolvedCollectionTypeId,
            CollectionTypeName: "Banks",
            CollectionTypeCode: "BANK",
            locationId ?? Guid.NewGuid(),
            locationShopId ?? DefaultShopId,
            locationCollectionTypeId ?? resolvedCollectionTypeId,
            LocationName: "Bank Location A",
            LocationPostCode: "AB1 2CD",
            numberOfBags,
            StdChargeType.Mileage,
            miles,
            ratePerMile,
            FlatCharge: null);
    }

    public static StdCollectionChargeBanksAndBinsUpdateModel CreateCollectionChargeFlatChargeModel(
        Guid? id = null,
        DateOnly? date = null,
        Guid? collectionTypeId = null,
        Guid? locationId = null,
        Guid? locationShopId = null,
        Guid? locationCollectionTypeId = null,
        int? numberOfBags = 5,
        decimal? flatCharge = 9m)
    {
        var resolvedCollectionTypeId = collectionTypeId ?? DefaultCollectionTypeId;

        return new StdCollectionChargeBanksAndBinsUpdateModel(
            id,
            date ?? RowDate,
            resolvedCollectionTypeId,
            CollectionTypeName: "Bins",
            CollectionTypeCode: "BIN",
            locationId ?? Guid.NewGuid(),
            locationShopId ?? DefaultShopId,
            locationCollectionTypeId ?? resolvedCollectionTypeId,
            LocationName: "Bin Location A",
            LocationPostCode: "AB1 2CD",
            numberOfBags,
            StdChargeType.FlatCharge,
            Miles: null,
            RatePerMile: null,
            flatCharge);
    }

    public static StdCollectionVanPackUpdateModel CreateCollectionVanPackModel(
        Guid? id = null,
        DateOnly? deliveryDate = null,
        string postCodeZone = "AB",
        int vanPacksOut = 5,
        int filledBags = 3,
        decimal ratePerVanPack = 2m)
    {
        return new StdCollectionVanPackUpdateModel(
            id,
            deliveryDate ?? RowDate,
            postCodeZone,
            vanPacksOut,
            filledBags,
            ratePerVanPack);
    }

    public static StdAdditionalCostUpdateModel CreateAdditionalFlatChargeCostModel(
        Guid? id = null,
        DateOnly? date = null,
        Guid? reasonId = null,
        string reasonName = "Parking",
        int numberOfBags = 2,
        decimal? flatCharge = 7.50m)
    {
        return new StdAdditionalCostUpdateModel(
            id,
            date ?? RowDate,
            reasonId ?? Guid.NewGuid(),
            reasonName,
            numberOfBags,
            StdChargeType.FlatCharge,
            Miles: null,
            RatePerMile: null,
            flatCharge);
    }

    public static StdAdditionalCostUpdateModel CreateAdditionalMileageCostModel(
        Guid? id = null,
        DateOnly? date = null,
        Guid? reasonId = null,
        string reasonName = "Extra mileage",
        int numberOfBags = 2,
        int? miles = 10,
        decimal? ratePerMile = 0.45m)
    {
        return new StdAdditionalCostUpdateModel(
            id,
            date ?? RowDate,
            reasonId ?? Guid.NewGuid(),
            reasonName,
            numberOfBags,
            StdChargeType.Mileage,
            miles,
            ratePerMile,
            FlatCharge: null);
    }

    public static AuditUser CreateAuditUser(Guid? id = null, string nameSnapshot = "Test User")
    {
        return new AuditUser(id ?? Guid.NewGuid(), nameSnapshot);
    }
}