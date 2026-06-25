using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Helpers;
using VanDriverRequisitions.Domain.Interfaces;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Domain.Entities.FE;

public sealed class FeMileage : AuditableEntity, IFeRequisitionChild
{
    private FeMileage() { } // EF Core

    public Guid FeRequisitionId { get; private set; }
    public DateOnly WeekEndingDate { get; private set; }
    public WeeklyQuantities Week { get; private set; } = null!;
    public int? TotalMiles { get; private set; }
    public decimal? RatePerMile { get; private set; }
    public decimal? TotalValue { get; private set; }

    public static FeMileage Create(DateOnly weekEndingDate, WeeklyQuantities week, decimal? ratePerMile)
    {
        var mileage = new FeMileage();
        mileage.Update(weekEndingDate, week, ratePerMile);
        return mileage;
    }

    public void Update(DateOnly weekEndingDate, WeeklyQuantities week, decimal? ratePerMile)
    {
        ArgumentNullException.ThrowIfNull(week);
        MoneyGuard.EnsureOptionalMoneyAmount(ratePerMile, "Rate per mile");

        WeekEndingDate = weekEndingDate;
        Week = week;
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