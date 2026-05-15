using VanDriverRequisitions.Domain.Helpers;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Domain.Entities.FE;

public class FeGeneralTask : AuditableEntity
{
    private FeGeneralTask() { }
    
    public FeGeneralTask(WeeklyQuantities week)
    {
        Week = week;
    }
    
    public Guid FeRequisitionId { get; init; }
    public Guid FeTaskTypeId { get; init; }
    public required FeTaskType FeTaskType { get; init; }
    public DateOnly WeekEndingDate { get; init; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public WeeklyQuantities Week { get; set; } = null!;
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