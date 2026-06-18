using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Entities.STD.Models;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.Helpers;
using VanDriverRequisitions.Domain.Interfaces;

namespace VanDriverRequisitions.Domain.Entities.STD;

public sealed class StdPickup : AuditableEntity, IStdRequisitionChild
{
    private StdPickup() { } // EF Core

    public Guid StdRequisitionId { get; private set; }

    public DateOnly Date { get; private set; }

    public int NumberOfBags { get; private set; }
    public int NumberOfHouseholds { get; private set; }

    public StdChargeType ChargeType { get; private set; }

    public int? Miles { get; private set; }
    public decimal? RatePerMile { get; private set; }
    public decimal? FlatCharge { get; private set; }

    public decimal? TotalValue { get; private set; }

    public static StdPickup Create(StdPickupUpdateModel model)
    {
        var pickup = new StdPickup();
        pickup.Update(model);
        return pickup;
    }

    public void Update(StdPickupUpdateModel model)
    {
        ArgumentNullException.ThrowIfNull(model);

        if (model.Date == default)
        {
            throw new InvalidOperationException("Date is required.");
        }

        if (model.NumberOfBags < 1)
        {
            throw new InvalidOperationException("Number of bags must be at least 1.");
        }

        if (model.NumberOfHouseholds <= 1)
        {
            throw new InvalidOperationException("Number of households must be at least 1.");
        }

        var charge = StdChargeCalculator.Calculate(model.ChargeType, model.Miles, model.RatePerMile, model.FlatCharge);

        Date = model.Date;
        NumberOfBags = model.NumberOfBags;
        NumberOfHouseholds = model.NumberOfHouseholds;

        ChargeType = model.ChargeType;
        Miles = charge.Miles;
        RatePerMile = charge.RatePerMile;
        FlatCharge = charge.FlatCharge;
        TotalValue = charge.TotalValue;
    }
}