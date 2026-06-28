using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Entities.STD.Models;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.Helpers;
using VanDriverRequisitions.Domain.Interfaces;

namespace VanDriverRequisitions.Domain.Entities.STD;

public sealed class StdTransfer : AuditableEntity, IStdRequisitionChild
{
    private StdTransfer() { } // EF Core

    public Guid StdRequisitionId { get; private set; }

    public DateOnly Date { get; private set; }

    public Guid ShopIdFrom { get; private set; }
    public string ShopCodeFrom { get; private set; } = string.Empty;
    public string ShopNameFrom { get; private set; } = string.Empty;

    public Guid ShopIdTo { get; private set; }
    public string ShopCodeTo { get; private set; } = string.Empty;
    public string ShopNameTo { get; private set; } = string.Empty;

    public int? NumberOfBags { get; private set; }
    public int? NumberOfBoxes { get; private set; }

    public StdChargeType ChargeType { get; private set; }

    public int? Miles { get; private set; }
    public decimal? RatePerMile { get; private set; }
    public decimal? FlatCharge { get; private set; }

    public decimal? TotalValue { get; private set; }

    public static StdTransfer Create(StdTransferUpdateModel model)
    {
        var transfer = new StdTransfer();
        transfer.Update(model);
        return transfer;
    }

    public void Update(StdTransferUpdateModel model)
    {
        ArgumentNullException.ThrowIfNull(model);
        ArgumentNullException.ThrowIfNull(model.FromShop);
        ArgumentNullException.ThrowIfNull(model.ToShop);

        if (model.FromShop.Id == model.ToShop.Id)
        {
            throw new InvalidOperationException("From shop and to shop must be different.");
        }

        if (model.NumberOfBags.HasValue && model.NumberOfBags.Value < 0)
        {
            throw new InvalidOperationException("Number of bags cannot be negative.");
        }

        if (model.NumberOfBoxes.HasValue && model.NumberOfBoxes.Value < 0)
        {
            throw new InvalidOperationException("Number of boxes cannot be negative.");
        }

        Date = DateGuard.EnsureRequiredDate(model.Date, "Date");

        ShopIdFrom = model.FromShop.Id;
        ShopCodeFrom = model.FromShop.Code;
        ShopNameFrom = model.FromShop.Name;

        ShopIdTo = model.ToShop.Id;
        ShopCodeTo = model.ToShop.Code;
        ShopNameTo = model.ToShop.Name;

        NumberOfBags = model.NumberOfBags;
        NumberOfBoxes = model.NumberOfBoxes;
        ChargeType = model.ChargeType;

        var charge = StdChargeCalculator.Calculate(model.ChargeType, model.NumberOfMiles, model.RatePerMile, model.FlatCharge);

        ChargeType = model.ChargeType;
        Miles = charge.Miles;
        RatePerMile = charge.RatePerMile;
        FlatCharge = charge.FlatCharge;
        TotalValue = charge.TotalValue;
    }
}