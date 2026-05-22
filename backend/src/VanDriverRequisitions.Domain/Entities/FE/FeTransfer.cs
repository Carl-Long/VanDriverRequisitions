using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Helpers;
using VanDriverRequisitions.Domain.Interfaces;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Domain.Entities.FE;

public class FeTransfer : AuditableEntity, IFeRequisitionChild
{
    private FeTransfer() { } // For EF core
    
    public FeTransfer(WeeklyQuantities week)
    {
        Week = week;
    }
    
    public Guid FeRequisitionId { get; init; }
    public DateOnly WeekEndingDate { get; init; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public Guid ShopIdFrom { get; init; }
    public Guid ShopIdTo { get; init; }
    public WeeklyQuantities Week { get; private set; } = null!;
    public int TotalNumber { get; private set; }
    public decimal? RatePerJob { get; private set; }
    public decimal? TotalValue { get; private set; }

    public void SetWeekValues(WeeklyQuantities week)
    {
        Week = week;
        RecalculateTotals();
    }

    public void SetRate(decimal? ratePerJob)
    {
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