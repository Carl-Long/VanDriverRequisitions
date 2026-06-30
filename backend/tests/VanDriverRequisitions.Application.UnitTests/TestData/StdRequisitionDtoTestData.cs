using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.UnitTests.TestData;

public static class StdRequisitionDtoTestData
{
    public static readonly DateOnly RequisitionDate = new(2026, 6, 13);
    public static readonly DateOnly Date = new(2026, 6, 13);
    public static readonly DateOnly DeliveryDate = new(2026, 6, 13);

    public static SaveStdRequisitionDto CreateRequisitionDto(
        DateOnly? requisitionDate = null,
        Guid? vanDriverId = null,
        string vanDriverName = "Test Driver",
        Guid? shopId = null,
        IReadOnlyCollection<SaveStdCollectionChargeBanksAndBinsDto>? collectionChargesBanksAndBins = null,
        IReadOnlyCollection<SaveStdCollectionVanPackDto>? collectionVanPacks = null,
        IReadOnlyCollection<SaveStdPickupDto>? pickups = null,
        IReadOnlyCollection<SaveStdTransferDto>? transfers = null,
        IReadOnlyCollection<SaveStdAdditionalCostDto>? additionalCosts = null)
    {
        return new SaveStdRequisitionDto
        {
            RequisitionDate = requisitionDate ?? RequisitionDate,
            VanDriverId = vanDriverId ?? Guid.NewGuid(),
            VanDriverName = vanDriverName,
            ShopId = shopId ?? Guid.NewGuid(),
            CollectionChargesBanksAndBins = collectionChargesBanksAndBins ?? [],
            CollectionVanPacks = collectionVanPacks ?? [],
            Pickups = pickups ?? [CreatePickupMileageDto()],
            Transfers = transfers ?? [],
            AdditionalCosts = additionalCosts ?? []
        };
    }

    public static SaveStdRequisitionDto CreateRequisitionDtoWithCollections(
        IReadOnlyCollection<SaveStdCollectionChargeBanksAndBinsDto>? collectionChargesBanksAndBins,
        IReadOnlyCollection<SaveStdCollectionVanPackDto>? collectionVanPacks,
        IReadOnlyCollection<SaveStdPickupDto>? pickups,
        IReadOnlyCollection<SaveStdTransferDto>? transfers,
        IReadOnlyCollection<SaveStdAdditionalCostDto>? additionalCosts)
    {
        return new SaveStdRequisitionDto
        {
            RequisitionDate = RequisitionDate,
            VanDriverId = Guid.NewGuid(),
            VanDriverName = "Test Driver",
            ShopId = Guid.NewGuid(),
            CollectionChargesBanksAndBins = collectionChargesBanksAndBins!,
            CollectionVanPacks = collectionVanPacks!,
            Pickups = pickups!,
            Transfers = transfers!,
            AdditionalCosts = additionalCosts!
        };
    }

    public static SaveStdPickupDto CreatePickupMileageDto(
        DateOnly? date = null,
        int numberOfBags = 1,
        int numberOfHouseholds = 1,
        int? miles = 10,
        decimal? ratePerMile = 0.45m,
        decimal? flatCharge = null)
    {
        return new SaveStdPickupDto
        {
            Date = date ?? Date,
            NumberOfBags = numberOfBags,
            NumberOfHouseholds = numberOfHouseholds,
            ChargeType = StdChargeType.Mileage,
            Miles = miles,
            RatePerMile = ratePerMile,
            FlatCharge = flatCharge
        };
    }

    public static SaveStdPickupDto CreatePickupFlatChargeDto(
        DateOnly? date = null,
        int numberOfBags = 1,
        int numberOfHouseholds = 1,
        int? miles = null,
        decimal? ratePerMile = null,
        decimal? flatCharge = 10m)
    {
        return new SaveStdPickupDto
        {
            Date = date ?? Date,
            NumberOfBags = numberOfBags,
            NumberOfHouseholds = numberOfHouseholds,
            ChargeType = StdChargeType.FlatCharge,
            Miles = miles,
            RatePerMile = ratePerMile,
            FlatCharge = flatCharge
        };
    }

    public static SaveStdTransferDto CreateTransferMileageDto(
        DateOnly? date = null,
        Guid? shopIdFrom = null,
        Guid? shopIdTo = null,
        int? numberOfBags = 1,
        int? numberOfBoxes = 1,
        int? miles = 10,
        decimal? ratePerMile = 0.45m,
        decimal? flatCharge = null)
    {
        var fromShopId = shopIdFrom ?? Guid.NewGuid();

        return new SaveStdTransferDto
        {
            Date = date ?? Date,
            ShopIdFrom = fromShopId,
            ShopIdTo = shopIdTo ?? Guid.NewGuid(),
            NumberOfBags = numberOfBags,
            NumberOfBoxes = numberOfBoxes,
            ChargeType = StdChargeType.Mileage,
            Miles = miles,
            RatePerMile = ratePerMile,
            FlatCharge = flatCharge
        };
    }

    public static SaveStdCollectionChargeBanksAndBinsDto CreateBanksAndBinsMileageDto(
        DateOnly? date = null,
        Guid? collectionTypeId = null,
        Guid? locationId = null,
        int? numberOfBags = 1,
        int? miles = 10,
        decimal? ratePerMile = 0.45m,
        decimal? flatCharge = null)
    {
        return new SaveStdCollectionChargeBanksAndBinsDto
        {
            Date = date ?? Date,
            CollectionTypeId = collectionTypeId ?? Guid.NewGuid(),
            LocationId = locationId ?? Guid.NewGuid(),
            NumberOfBags = numberOfBags,
            ChargeType = StdChargeType.Mileage,
            Miles = miles,
            RatePerMile = ratePerMile,
            FlatCharge = flatCharge
        };
    }

    public static SaveStdCollectionVanPackDto CreateVanPackDto(
        DateOnly? deliveryDate = null,
        string postCodeZone = "AB",
        int vanPacksOut = 10,
        int filledBags = 5)
    {
        return new SaveStdCollectionVanPackDto
        {
            DeliveryDate = deliveryDate ?? DeliveryDate,
            PostCodeZone = postCodeZone,
            VanPacksOut = vanPacksOut,
            FilledBags = filledBags
        };
    }

    public static SaveStdAdditionalCostDto CreateAdditionalMileageDto(
        DateOnly? date = null,
        Guid? reasonId = null,
        int numberOfBags = 1,
        int? miles = 10,
        decimal? ratePerMile = 0.45m,
        decimal? flatCharge = null)
    {
        return new SaveStdAdditionalCostDto
        {
            Date = date ?? Date,
            ReasonId = reasonId ?? Guid.NewGuid(),
            NumberOfBags = numberOfBags,
            ChargeType = StdChargeType.Mileage,
            Miles = miles,
            RatePerMile = ratePerMile,
            FlatCharge = flatCharge
        };
    }
    
    public static SaveStdTransferDto CreateTransferFlatChargeDto(
        DateOnly? date = null,
        Guid? shopIdFrom = null,
        Guid? shopIdTo = null,
        int? numberOfBags = 1,
        int? numberOfBoxes = 1,
        int? miles = null,
        decimal? ratePerMile = null,
        decimal? flatCharge = 10m)
    {
        var fromShopId = shopIdFrom ?? Guid.NewGuid();

        return new SaveStdTransferDto
        {
            Date = date ?? Date,
            ShopIdFrom = fromShopId,
            ShopIdTo = shopIdTo ?? Guid.NewGuid(),
            NumberOfBags = numberOfBags,
            NumberOfBoxes = numberOfBoxes,
            ChargeType = StdChargeType.FlatCharge,
            Miles = miles,
            RatePerMile = ratePerMile,
            FlatCharge = flatCharge
        };
    }
    
    public static SaveStdCollectionChargeBanksAndBinsDto CreateBanksAndBinsFlatChargeDto(
        DateOnly? date = null,
        Guid? collectionTypeId = null,
        Guid? locationId = null,
        int? numberOfBags = 1,
        int? miles = null,
        decimal? ratePerMile = null,
        decimal? flatCharge = 10m)
    {
        return new SaveStdCollectionChargeBanksAndBinsDto
        {
            Date = date ?? Date,
            CollectionTypeId = collectionTypeId ?? Guid.NewGuid(),
            LocationId = locationId ?? Guid.NewGuid(),
            NumberOfBags = numberOfBags,
            ChargeType = StdChargeType.FlatCharge,
            Miles = miles,
            RatePerMile = ratePerMile,
            FlatCharge = flatCharge
        };
    }
    
    public static SaveStdAdditionalCostDto CreateAdditionalFlatChargeDto(
        DateOnly? date = null,
        Guid? reasonId = null,
        int numberOfBags = 1,
        int? miles = null,
        decimal? ratePerMile = null,
        decimal? flatCharge = 10m)
    {
        return new SaveStdAdditionalCostDto
        {
            Date = date ?? Date,
            ReasonId = reasonId ?? Guid.NewGuid(),
            NumberOfBags = numberOfBags,
            ChargeType = StdChargeType.FlatCharge,
            Miles = miles,
            RatePerMile = ratePerMile,
            FlatCharge = flatCharge
        };
    }
}