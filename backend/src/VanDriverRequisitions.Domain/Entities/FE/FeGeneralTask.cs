using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Helpers;
using VanDriverRequisitions.Domain.Interfaces;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Domain.Entities.FE;

public sealed class FeGeneralTask : AuditableEntity, IFeRequisitionChild
{
    private FeGeneralTask() { } // EF

    public Guid FeRequisitionId { get; private set; }

    public Guid FeTaskTypeId { get; private set; }
    public string TaskTypeName { get; private set; } = string.Empty;
    public string TaskTypeCode { get; private set; } = string.Empty;

    public DateOnly WeekEndingDate { get; private set; }
    public WeeklyQuantities Week { get; private set; } = null!;

    public int TotalNumber { get; private set; }
    public decimal? RatePerJob { get; private set; }
    public decimal? TotalValue { get; private set; }

    public static FeGeneralTask Create(
        Guid feTaskTypeId,
        string taskTypeName,
        string taskTypeCode,
        DateOnly weekEndingDate,
        WeeklyQuantities week,
        decimal? ratePerJob)
    {
        var task = new FeGeneralTask();

        task.SetTaskType(feTaskTypeId, taskTypeName, taskTypeCode);
        task.Update(weekEndingDate, week, ratePerJob);

        return task;
    }

    public void Update(DateOnly weekEndingDate, WeeklyQuantities week, decimal? ratePerJob)
    {
        ArgumentNullException.ThrowIfNull(week);

        if (ratePerJob < 0)
        {
            throw new InvalidOperationException("Rate per job cannot be negative.");
        }

        WeekEndingDate = weekEndingDate;
        Week = week;
        RatePerJob = ratePerJob;

        RecalculateTotals();
    }

    private void SetTaskType(Guid feTaskTypeId, string taskTypeName, string taskTypeCode)
    {
        if (feTaskTypeId == Guid.Empty)
        {
            throw new ArgumentException("Task type id is required.", nameof(feTaskTypeId));
        }

        ArgumentException.ThrowIfNullOrWhiteSpace(taskTypeName);
        ArgumentException.ThrowIfNullOrWhiteSpace(taskTypeCode);

        FeTaskTypeId = feTaskTypeId;
        TaskTypeName = taskTypeName;
        TaskTypeCode = taskTypeCode;
    }

    private void RecalculateTotals()
    {
        TotalNumber = Week.Total;
        TotalValue = WeeklyCalculator.Calculate(TotalNumber, RatePerJob);
    }
}