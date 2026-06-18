using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Entities.STD.Models;
using VanDriverRequisitions.Domain.Interfaces;

namespace VanDriverRequisitions.Domain.Entities.STD;

public sealed class StdCollectionVanPack : AuditableEntity, IStdRequisitionChild
{
    private StdCollectionVanPack() { } // EF Core

    public Guid StdRequisitionId { get; private set; }

    public DateOnly DeliveryDate { get; private set; }

    public string PostCodeZone { get; private set; } = string.Empty;

    public int VanPacksOut { get; private set; }
    public int FilledBags { get; private set; }

    public decimal RatePerVanPack { get; private set; }

    public int UnusedVanPacks => VanPacksOut - FilledBags;

    public decimal PercentReturned => VanPacksOut == 0
        ? 0
        : Math.Round((decimal)FilledBags / VanPacksOut * 100, 2);

    public decimal? TotalValue { get; private set; }

    public static StdCollectionVanPack Create(StdCollectionVanPackUpdateModel model)
    {
        var vanPack = new StdCollectionVanPack();
        vanPack.Update(model);
        return vanPack;
    }

    public void Update(StdCollectionVanPackUpdateModel model)
    {
        ArgumentNullException.ThrowIfNull(model);

        if (model.DeliveryDate == default)
        {
            throw new InvalidOperationException("Delivery date is required.");
        }

        ArgumentException.ThrowIfNullOrWhiteSpace(model.PostCodeZone);

        if (model.VanPacksOut < 0)
        {
            throw new InvalidOperationException("Van packs out cannot be negative.");
        }

        if (model.FilledBags < 0)
        {
            throw new InvalidOperationException("Filled bags cannot be negative.");
        }

        if (model.FilledBags > model.VanPacksOut)
        {
            throw new InvalidOperationException("Filled bags cannot be greater than van packs out.");
        }

        if (model.RatePerVanPack < 0)
        {
            throw new InvalidOperationException("Rate per van pack cannot be negative.");
        }

        DeliveryDate = model.DeliveryDate;
        PostCodeZone = model.PostCodeZone.Trim();
        VanPacksOut = model.VanPacksOut;
        FilledBags = model.FilledBags;
        RatePerVanPack = model.RatePerVanPack;

        RecalculateTotals();
    }

    private void RecalculateTotals()
    {
        TotalValue = VanPacksOut * RatePerVanPack;
    }
}