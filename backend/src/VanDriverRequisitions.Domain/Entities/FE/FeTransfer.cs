using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Entities.Common.Models;
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

    public static FeTransfer Create(
        ShopSnapshot fromShop,
        ShopSnapshot toShop,
        DateOnly weekEndingDate,
        WeeklyQuantities week,
        decimal? ratePerJob)
    {
        var transfer = new FeTransfer();

        transfer.Update(
            fromShop,
            toShop,
            weekEndingDate,
            week,
            ratePerJob);

        return transfer;
    }

    public void Update(
        ShopSnapshot fromShop,
        ShopSnapshot toShop,
        DateOnly weekEndingDate,
        WeeklyQuantities week,
        decimal? ratePerJob)
    {
        ArgumentNullException.ThrowIfNull(fromShop);
        ArgumentNullException.ThrowIfNull(toShop);
        ArgumentNullException.ThrowIfNull(week);

        if (fromShop.Id == toShop.Id)
        {
            throw new InvalidOperationException("From shop and to shop must be different.");
        }

        if (ratePerJob.HasValue && ratePerJob.Value < 0)
        {
            throw new InvalidOperationException("Rate per job cannot be negative.");
        }

        ShopIdFrom = fromShop.Id;
        ShopCodeFrom = fromShop.Code;
        ShopNameFrom = fromShop.Name;

        ShopIdTo = toShop.Id;
        ShopCodeTo = toShop.Code;
        ShopNameTo = toShop.Name;

        WeekEndingDate = weekEndingDate;
        Week = week;
        RatePerJob = ratePerJob;

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