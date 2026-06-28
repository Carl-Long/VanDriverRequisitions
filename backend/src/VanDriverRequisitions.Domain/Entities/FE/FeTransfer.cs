using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Entities.FE.Models;
using VanDriverRequisitions.Domain.Helpers;
using VanDriverRequisitions.Domain.Interfaces;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Domain.Entities.FE;

public sealed class FeTransfer : AuditableEntity, IFeRequisitionChild
{
    private FeTransfer() { } // EF Core

    public Guid FeRequisitionId { get; private set; }

    public DateOnly WeekEndingDate { get; private set; }

    public Guid ShopIdFrom { get; private set; }
    public string ShopCodeFrom { get; private set; } = string.Empty;
    public string ShopNameFrom { get; private set; } = string.Empty;

    public Guid ShopIdTo { get; private set; }
    public string ShopCodeTo { get; private set; } = string.Empty;
    public string ShopNameTo { get; private set; } = string.Empty;

    public WeeklyQuantities Week { get; private set; } = null!;
    public int TotalNumber { get; private set; }
    public decimal? RatePerJob { get; private set; }
    public decimal? TotalValue { get; private set; }
    
    public static FeTransfer Create(FeTransferUpdateModel model)
    {
        var transfer = new FeTransfer();
        transfer.Update(model);
        return transfer;
    }

    public void Update(FeTransferUpdateModel model)
    {
        ArgumentNullException.ThrowIfNull(model);
        ArgumentNullException.ThrowIfNull(model.FromShop, nameof(model.FromShop));
        ArgumentNullException.ThrowIfNull(model.ToShop, nameof(model.ToShop));
        ArgumentNullException.ThrowIfNull(model.Week, nameof(model.Week));

        MoneyGuard.EnsureOptionalMoneyAmount(model.RatePerJob, "Rate per job");

        if (model.FromShop.Id == model.ToShop.Id)
        {
            throw new InvalidOperationException("From shop and to shop must be different.");
        }

        ShopIdFrom = model.FromShop.Id;
        ShopCodeFrom = model.FromShop.Code;
        ShopNameFrom = model.FromShop.Name;

        ShopIdTo = model.ToShop.Id;
        ShopCodeTo = model.ToShop.Code;
        ShopNameTo = model.ToShop.Name;

        WeekEndingDate = DateGuard.EnsureRequiredDate(model.WeekEndingDate, "Week ending date");

        Week = model.Week;
        RatePerJob = model.RatePerJob;

        RecalculateTotals();
    }

    private (int totalNumber, decimal? totalValue) CalculateTotals()
    {
        var totalNumber = Week.Total;
        var totalValue = WeeklyCalculator.Calculate(totalNumber, RatePerJob);

        return (totalNumber, totalValue);
    }

    private void RecalculateTotals()
    {
        var (totalNumber, totalValue) = CalculateTotals();

        TotalNumber = totalNumber;
        TotalValue = totalValue;
    }
}