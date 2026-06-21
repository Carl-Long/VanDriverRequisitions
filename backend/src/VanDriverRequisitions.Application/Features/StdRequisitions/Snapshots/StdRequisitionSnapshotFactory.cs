using System.Text.Json;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Domain.Entities.STD;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Snapshots;

public static class StdRequisitionSnapshotFactory
{
    public static string CreateJson(StdRequisition requisition)
    {
        var snapshot = Create(requisition);
        return JsonSerializer.Serialize(snapshot);
    }

    private static StdRequisitionSnapshotDto Create(StdRequisition requisition)
    {
        return new StdRequisitionSnapshotDto
        {
            RequisitionNumber = requisition.RequisitionNumber,
            RequisitionDate = requisition.RequisitionDate,

            VanDriverCode = requisition.VanDriverCode,
            VanDriverName = requisition.VanDriverName,
            TradersName = requisition.TradersName,

            ShopCode = requisition.ShopCode,
            ShopName = requisition.ShopName,

            IsVatApplicable = requisition.IsVatApplicable,
            Subtotal = requisition.Subtotal,

            CollectionChargesBanksAndBins = requisition.CollectionChargesBanksAndBins
                .OrderBy(x => x.Date)
                .ThenBy(x => x.CollectionTypeNameSnapshot)
                .ThenBy(x => x.LocationNameSnapshot)
                .ThenBy(x => x.CreatedAtUtc)
                .ThenBy(x => x.Id)
                .Select(CreateCollectionChargeBanksAndBinsSnapshot)
                .ToList(),
            
            CollectionVanPacks = requisition.CollectionVanPacks
                .OrderBy(x => x.DeliveryDate)
                .ThenBy(x => x.PostCodeZone)
                .Select(x => new StdCollectionVanPackSnapshotDto
                {
                    DeliveryDate = x.DeliveryDate,
                    PostCodeZone = x.PostCodeZone,
                    VanPacksOut = x.VanPacksOut,
                    FilledBags = x.FilledBags,
                    UnusedVanPacks = x.UnusedVanPacks,
                    PercentReturned = x.PercentReturned,
                    RatePerVanPack = x.RatePerVanPack,
                    TotalValue = x.TotalValue ?? 0m,
                })
                .ToList(),
            
            Pickups = requisition.Pickups
                .OrderBy(x => x.Date)
                .ThenBy(x => x.ChargeType)
                .Select(x => new StdPickupSnapshotDto
                {
                    Date = x.Date,
                    NumberOfBags = x.NumberOfBags,
                    NumberOfHouseholds = x.NumberOfHouseholds,
                    ChargeType = x.ChargeType,
                    Miles = x.Miles,
                    RatePerMile = x.RatePerMile,
                    FlatCharge = x.FlatCharge,
                    TotalValue = x.TotalValue ?? 0m,
                })
                .ToList(),
            
            Transfers = requisition.Transfers
                .OrderBy(x => x.Date)
                .ThenBy(x => x.ShopNameFrom)
                .ThenBy(x => x.ShopNameTo)
                .Select(x => new StdTransferSnapshotDto
                {
                    Date = x.Date,

                    ShopIdFrom = x.ShopIdFrom,
                    ShopCodeFrom = x.ShopCodeFrom,
                    ShopNameFrom = x.ShopNameFrom,

                    ShopIdTo = x.ShopIdTo,
                    ShopCodeTo = x.ShopCodeTo,
                    ShopNameTo = x.ShopNameTo,

                    NumberOfBags = x.NumberOfBags,
                    NumberOfBoxes = x.NumberOfBoxes,

                    ChargeType = x.ChargeType,
                    Miles = x.Miles,
                    RatePerMile = x.RatePerMile,
                    FlatCharge = x.FlatCharge,

                    TotalValue = x.TotalValue ?? 0m,
                })
                .ToList(),
            
            AdditionalCosts = requisition.AdditionalCosts
                .OrderBy(x => x.Date)
                .ThenBy(x => x.ReasonNameSnapshot)
                .Select(x => new StdAdditionalCostSnapshotDto
                {
                    Date = x.Date,

                    ReasonId = x.ReasonId,
                    ReasonName = x.ReasonNameSnapshot,

                    NumberOfBags = x.NumberOfBags,

                    ChargeType = x.ChargeType,
                    Miles = x.Miles,
                    RatePerMile = x.RatePerMile,
                    FlatCharge = x.FlatCharge,

                    TotalValue = x.TotalValue ?? 0m,
                })
                .ToList(),
        };
    }

    private static StdCollectionChargeBanksAndBinsSnapshotDto CreateCollectionChargeBanksAndBinsSnapshot(
        StdCollectionChargeBanksAndBins collectionCharge)
    {
        return new StdCollectionChargeBanksAndBinsSnapshotDto
        {
            Date = collectionCharge.Date,

            CollectionTypeId = collectionCharge.CollectionTypeId,
            CollectionTypeName = collectionCharge.CollectionTypeNameSnapshot,
            CollectionTypeCode = collectionCharge.CollectionTypeCodeSnapshot,

            LocationId = collectionCharge.LocationId,
            LocationName = collectionCharge.LocationNameSnapshot,
            LocationPostCode = collectionCharge.LocationPostCodeSnapshot,

            NumberOfBags = collectionCharge.NumberOfBags,

            ChargeType = collectionCharge.ChargeType,
            Miles = collectionCharge.Miles,
            RatePerMile = collectionCharge.RatePerMile,
            FlatCharge = collectionCharge.FlatCharge,

            TotalValue = collectionCharge.TotalValue
        };
    }
}