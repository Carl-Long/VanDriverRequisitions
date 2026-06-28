using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Entities.FE.Models;
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

    public static FeGeneralTask Create(FeGeneralTaskUpdateModel model)
    {
        ArgumentNullException.ThrowIfNull(model);

        var task = new FeGeneralTask();

        task.SetTaskType(model.FeTaskTypeId, model.TaskTypeName, model.TaskTypeCode);
        task.Update(model);

        return task;
    }

    public void Update(FeGeneralTaskUpdateModel model)
    {
        ArgumentNullException.ThrowIfNull(model);
        ArgumentNullException.ThrowIfNull(model.Week, nameof(model.Week));

        MoneyGuard.EnsureOptionalMoneyAmount(model.RatePerJob, "Rate per job");

        WeekEndingDate = DateGuard.EnsureRequiredDate(model.WeekEndingDate, "Week ending date");

        Week = model.Week;
        RatePerJob = model.RatePerJob;

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