using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Entities.FE.Models;
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

    public static FeMileage Create(FeMileageUpdateModel model)
    {
        var mileage = new FeMileage();
        mileage.Update(model);
        return mileage;
    }

    public void Update(FeMileageUpdateModel model)
    {
        ArgumentNullException.ThrowIfNull(model);
        ArgumentNullException.ThrowIfNull(model.Week);

        MoneyGuard.EnsureOptionalMoneyAmount(model.RatePerMile, "Rate per mile");

        WeekEndingDate = model.WeekEndingDate;
        Week = model.Week;
        RatePerMile = model.RatePerMile;

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