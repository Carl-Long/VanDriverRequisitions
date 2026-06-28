using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Entities.STD.Models;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.Helpers;
using VanDriverRequisitions.Domain.Interfaces;

namespace VanDriverRequisitions.Domain.Entities.STD;

public sealed class StdCollectionChargeBanksAndBins : AuditableEntity, IStdRequisitionChild
{
    private StdCollectionChargeBanksAndBins() { } // EF Core

    public Guid StdRequisitionId { get; private set; }

    public DateOnly Date { get; private set; }

    public Guid CollectionTypeId { get; private set; }
    public string CollectionTypeNameSnapshot { get; private set; } = string.Empty;
    public string CollectionTypeCodeSnapshot { get; private set; } = string.Empty;

    public Guid LocationId { get; private set; }
    public string LocationNameSnapshot { get; private set; } = string.Empty;
    public string LocationPostCodeSnapshot { get; private set; } = string.Empty;

    public int? NumberOfBags { get; private set; }

    public StdChargeType ChargeType { get; private set; }

    public int? Miles { get; private set; }
    public decimal? RatePerMile { get; private set; }
    public decimal? FlatCharge { get; private set; }

    public decimal? TotalValue { get; private set; }

    public static StdCollectionChargeBanksAndBins Create(StdCollectionChargeBanksAndBinsUpdateModel model)
    {
        var collectionCharge = new StdCollectionChargeBanksAndBins();
        collectionCharge.Update(model);
        return collectionCharge;
    }

    public void Update(StdCollectionChargeBanksAndBinsUpdateModel model)
    {
        ArgumentNullException.ThrowIfNull(model);

        var collectionTypeId = SnapshotGuard.EnsureRequiredId(model.CollectionTypeId, "Collection type id");
        var locationCollectionTypeId = SnapshotGuard.EnsureRequiredId(model.LocationCollectionTypeId, "Location collection type id");

        if (locationCollectionTypeId != collectionTypeId)
        {
            throw new InvalidOperationException("Location does not belong to the selected collection type.");
        }

        if (model.NumberOfBags.HasValue && model.NumberOfBags.Value < 0)
        {
            throw new InvalidOperationException("Number of bags cannot be negative.");
        }

        Date = DateGuard.EnsureRequiredDate(model.Date, "Date");

        CollectionTypeId = collectionTypeId;
        CollectionTypeNameSnapshot = SnapshotGuard.EnsureRequiredText(model.CollectionTypeName, "Collection type name");
        CollectionTypeCodeSnapshot = SnapshotGuard.EnsureRequiredText(model.CollectionTypeCode, "Collection type code");

        LocationId = SnapshotGuard.EnsureRequiredId(model.LocationId, "Location id");
        LocationNameSnapshot = SnapshotGuard.EnsureRequiredText(model.LocationName, "Location name");
        LocationPostCodeSnapshot = SnapshotGuard.EnsureRequiredText(model.LocationPostCode, "Location post code");

        NumberOfBags = model.NumberOfBags;

        var charge = StdChargeCalculator.Calculate(model.ChargeType, model.Miles, model.RatePerMile, model.FlatCharge);

        ChargeType = model.ChargeType;
        Miles = charge.Miles;
        RatePerMile = charge.RatePerMile;
        FlatCharge = charge.FlatCharge;
        TotalValue = charge.TotalValue;
    }
}