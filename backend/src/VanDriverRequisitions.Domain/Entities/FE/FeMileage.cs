using VanDriverRequisitions.Domain.Helpers;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Domain.Entities.FE;

public class FeMileage : AuditableEntity
{
    private FeMileage() { }
    
    public FeMileage(WeeklyQuantities week)
    {
        Week = week;
    }
    
    public Guid FeRequisitionId { get; init; }
    public DateOnly WeekEndingDate { get; init; } = DateOnly.FromDateTime(DateTime.Now);
    public WeeklyQuantities Week { get; private set; } = null!;
    public int? TotalMiles { get; private set; }
    public decimal? RatePerMile { get; private set; }
    public decimal? TotalValue { get; private set; }

    public void SetWeekValues(WeeklyQuantities week)
    {
        Week = week;
        RecalculateTotals();
    }

    public void SetRate(decimal? ratePerMile)
    {
        RatePerMile = ratePerMile;
        RecalculateTotals();
    }

    private (int? totalMiles, decimal? totalValue) CalculateTotals()
    {
        var totalMiles = Week.Total;
        var totalValue = WeeklyCalculator.Calculate(totalMiles, RatePerMile);
        return (totalMiles, totalValue);
    }

    private void RecalculateTotals()
    {
        var (totalMiles, totalValue) = CalculateTotals();
        TotalMiles = totalMiles;
        TotalValue = totalValue;
    }
}