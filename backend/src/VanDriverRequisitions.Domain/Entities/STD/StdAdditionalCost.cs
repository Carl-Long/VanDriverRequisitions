using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Entities.STD.Models;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.Helpers;
using VanDriverRequisitions.Domain.Interfaces;

namespace VanDriverRequisitions.Domain.Entities.STD;

public sealed class StdAdditionalCost : AuditableEntity, IStdRequisitionChild
{
    private StdAdditionalCost() { } // EF Core

    public Guid StdRequisitionId { get; private set; }

    public DateOnly Date { get; private set; }

    public Guid ReasonId { get; private set; }
    public string ReasonCodeSnapshot { get; private set; } = string.Empty;
    public string ReasonTextSnapshot { get; private set; } = string.Empty;

    public int NumberOfBags { get; private set; }

    public StdChargeType ChargeType { get; private set; }

    public int? Miles { get; private set; }
    public decimal? RatePerMile { get; private set; }
    public decimal? FlatCharge { get; private set; }

    public decimal? TotalValue { get; private set; }

    public static StdAdditionalCost Create(StdAdditionalCostUpdateModel model)
    {
        var additionalCost = new StdAdditionalCost();
        additionalCost.Update(model);
        return additionalCost;
    }

    public void Update(StdAdditionalCostUpdateModel model)
    {
        ArgumentNullException.ThrowIfNull(model);
        
        if (model.NumberOfBags < 1)
        {
            throw new InvalidOperationException("Number of bags must be at least 1.");
        }

        Date = DateGuard.EnsureRequiredDate(model.Date, "Date");
        
        ReasonId = SnapshotGuard.EnsureRequiredId(model.ReasonId, "Reason id");
        ReasonCodeSnapshot = SnapshotGuard.EnsureRequiredText(model.ReasonCodeSnapshot, "Reason code");
        ReasonTextSnapshot = SnapshotGuard.EnsureRequiredText(model.ReasonTextSnapshot, "Reason text");
        
        NumberOfBags = model.NumberOfBags;

        ChargeType = model.ChargeType;

        var charge = StdChargeCalculator.Calculate(model.ChargeType, model.Miles, model.RatePerMile, model.FlatCharge);

        ChargeType = model.ChargeType;
        Miles = charge.Miles;
        RatePerMile = charge.RatePerMile;
        FlatCharge = charge.FlatCharge;
        TotalValue = charge.TotalValue;
    }
}