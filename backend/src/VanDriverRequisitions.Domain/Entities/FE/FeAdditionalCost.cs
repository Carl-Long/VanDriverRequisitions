using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.Helpers;

namespace VanDriverRequisitions.Domain.Entities.FE;

public class FeAdditionalCost : AuditableEntity
{
    public Guid FeRequisitionId { get; init; }
    public DateOnly WeekEndingDate { get; init; } = DateOnly.FromDateTime(DateTime.Now);
    public Guid ReasonId { get; init; }
    public required FeReason FeReason { get; init; }
    public ChargingOption ChargingOption { get; private set; }
    public int? Miles { get; private set; }
    public decimal? RatePerMile { get; private set; }
    public int? TotalNumber { get; private set; }
    public decimal? RatePerJob { get; private set; }
    public decimal? TotalValue { get; private set; }

    public void SetMiles(int miles, decimal rate)
    {
        ChargingOption = ChargingOption.Mileage;

        Miles = miles;
        RatePerMile = rate;

        TotalNumber = null;
        RatePerJob = null;

        Recalculate();
    }

    public void SetJobs(int jobs, decimal rate)
    {
        ChargingOption = ChargingOption.Job;

        TotalNumber = jobs;
        RatePerJob = rate;

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