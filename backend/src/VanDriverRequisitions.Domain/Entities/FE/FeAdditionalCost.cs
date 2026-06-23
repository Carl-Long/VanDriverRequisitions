using VanDriverRequisitions.Domain.Entities.Base;
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

    public static FeAdditionalCost Create(
        DateOnly weekEndingDate,
        Guid reasonId,
        string reasonCodeSnapshot,
        string reasonTextSnapshot,
        ChargingOption chargingOption,
        int? totalNumber,
        decimal? ratePerJob,
        int? miles,
        decimal? ratePerMile)
    {
        var cost = new FeAdditionalCost();

        cost.Update(
            weekEndingDate,
            reasonId,
            reasonCodeSnapshot,
            reasonTextSnapshot,
            chargingOption,
            totalNumber,
            ratePerJob,
            miles,
            ratePerMile);

        return cost;
    }

    public void Update(
        DateOnly weekEndingDate,
        Guid reasonId,
        string reasonCodeSnapshot,
        string reasonTextSnapshot,
        ChargingOption chargingOption,
        int? totalNumber,
        decimal? ratePerJob,
        int? miles,
        decimal? ratePerMile)
    {
        if (reasonId == Guid.Empty)
        {
            throw new InvalidOperationException("Reason is required.");
        }

        ArgumentException.ThrowIfNullOrWhiteSpace(reasonCodeSnapshot);
        ArgumentException.ThrowIfNullOrWhiteSpace(reasonTextSnapshot);

        WeekEndingDate = weekEndingDate;
        ReasonId = reasonId;
        ReasonCodeSnapshot = reasonCodeSnapshot.Trim();
        ReasonTextSnapshot = reasonTextSnapshot.Trim();

        switch (chargingOption)
        {
            case ChargingOption.Mileage:
                SetMileage(miles, ratePerMile);
                break;

            case ChargingOption.Job:
                SetJobs(totalNumber, ratePerJob);
                break;

            default:
                throw new ArgumentOutOfRangeException(nameof(chargingOption), chargingOption, "Unknown charging option.");
        }
    }

    private void SetMileage(int? miles, decimal? ratePerMile)
    {
        if (!miles.HasValue || miles.Value <= 0)
        {
            throw new InvalidOperationException("Miles must be greater than zero.");
        }

        if (!ratePerMile.HasValue || ratePerMile.Value < 0)
        {
            throw new InvalidOperationException("Rate per mile is required and cannot be negative.");
        }

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

        if (!ratePerJob.HasValue || ratePerJob.Value < 0)
        {
            throw new InvalidOperationException("Rate per job is required and cannot be negative.");
        }

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