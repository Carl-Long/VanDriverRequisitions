using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Entities.STD.Models;
using VanDriverRequisitions.Domain.Helpers;
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
        : Math.Round((decimal)UnusedVanPacks / VanPacksOut * 100, 2);

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
        
        ArgumentException.ThrowIfNullOrWhiteSpace(model.PostCodeZone);

        if (model.VanPacksOut < 1)
        {
            throw new InvalidOperationException("Van packs out must be at least 1.");
        }

        if (model.FilledBags < 1)
        {
            throw new InvalidOperationException("Filled bags must be at least 1.");
        }

        if (model.FilledBags > model.VanPacksOut)
        {
            throw new InvalidOperationException("Filled bags cannot be greater than van packs out.");
        }

        MoneyGuard.EnsureMoneyAmount(model.RatePerVanPack, "Rate per van pack");

        DeliveryDate = DateGuard.EnsureRequiredDate(model.DeliveryDate, "Delivery date");
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