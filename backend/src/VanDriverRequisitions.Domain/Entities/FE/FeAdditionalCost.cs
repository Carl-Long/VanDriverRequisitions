using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Entities.FE.Models;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.Helpers;
using VanDriverRequisitions.Domain.Interfaces;

namespace VanDriverRequisitions.Domain.Entities.FE;

public sealed class FeAdditionalCost : AuditableEntity, IFeRequisitionChild
{
    private FeAdditionalCost() { } // EF Core

    public Guid FeRequisitionId { get; private set; }
    public DateOnly WeekEndingDate { get; private set; }
    public Guid ReasonId { get; private set; }
    public string ReasonTextSnapshot { get; private set; } = string.Empty;
    public string ReasonCodeSnapshot { get; private set; } = string.Empty;
    public ChargingOption ChargingOption { get; private set; }
    public int? Miles { get; private set; }
    public decimal? RatePerMile { get; private set; }
    public int? TotalNumber { get; private set; }
    public decimal? RatePerJob { get; private set; }
    public decimal? TotalValue { get; private set; }

    public static FeAdditionalCost Create(FeAdditionalCostUpdateModel model)
    {
        var cost = new FeAdditionalCost();
        cost.Update(model);
        return cost;
    }

    public void Update(FeAdditionalCostUpdateModel model)
    {
        ArgumentNullException.ThrowIfNull(model);

        WeekEndingDate = DateGuard.EnsureRequiredDate(model.WeekEndingDate, "Week ending date");

        ReasonId = SnapshotGuard.EnsureRequiredId(model.ReasonId, "Reason id");
        ReasonCodeSnapshot = SnapshotGuard.EnsureRequiredText(model.ReasonCodeSnapshot, "Reason code");
        ReasonTextSnapshot = SnapshotGuard.EnsureRequiredText(model.ReasonTextSnapshot, "Reason text");
        
        switch (model.ChargingOption)
        {
            case ChargingOption.Mileage:
                SetMileage(model.Miles, model.RatePerMile);
                break;

            case ChargingOption.Job:
                SetJobs(model.TotalNumber, model.RatePerJob);
                break;

            default:
                throw new ArgumentOutOfRangeException(nameof(model.ChargingOption), model.ChargingOption, "Unknown charging option.");
        }
    }

    private void SetMileage(int? miles, decimal? ratePerMile)
    {
        if (!miles.HasValue || miles.Value <= 0)
        {
            throw new InvalidOperationException("Miles must be greater than zero.");
        }

        MoneyGuard.EnsureRequiredMoneyAmount(ratePerMile, "Rate per mile");

        ChargingOption = ChargingOption.Mileage;

        Miles = miles;
        RatePerMile = ratePerMile;

        TotalNumber = null;
        RatePerJob = null;

        Recalculate();
    }

    private void SetJobs(int? totalNumber, decimal? ratePerJob)
    {
        if (!totalNumber.HasValue || totalNumber.Value <= 0)
        {
            throw new InvalidOperationException("Total number must be greater than zero.");
        }

        MoneyGuard.EnsureRequiredMoneyAmount(ratePerJob, "Rate per job");

        ChargingOption = ChargingOption.Job;

        TotalNumber = totalNumber;
        RatePerJob = ratePerJob;

        Miles = null;
        RatePerMile = null;

        Recalculate();
    }

    private void Recalculate()
    {
        TotalValue = ChargingOption == ChargingOption.Mileage
            ? WeeklyCalculator.Calculate(Miles ?? 0, RatePerMile)
            : WeeklyCalculator.Calculate(TotalNumber ?? 0, RatePerJob);
    }
}