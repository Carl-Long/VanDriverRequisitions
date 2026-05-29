using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Helpers;
using VanDriverRequisitions.Domain.Interfaces;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Domain.Entities.FE;

public sealed class FeGeneralTask
    : AuditableEntity, IFeRequisitionChild
{
    private FeGeneralTask() { } // EF

    public FeGeneralTask(
        Guid feTaskTypeId,
        string taskTypeName,
        string taskTypeCode,
        DateOnly weekEndingDate,
        WeeklyQuantities week,
        decimal? ratePerJob)
    {
        FeTaskTypeId = feTaskTypeId;
        TaskTypeName = taskTypeName;
        TaskTypeCode = taskTypeCode;
        WeekEndingDate = weekEndingDate;
        Week = week;
        RatePerJob = ratePerJob;
        
        RecalculateTotals();
    }

    public Guid FeRequisitionId { get; set; }
    public Guid FeTaskTypeId { get; private set; }
    public string TaskTypeName { get; private set; } = string.Empty;
    public string TaskTypeCode { get; private set; } = string.Empty;
    public DateOnly WeekEndingDate { get; private set; }
    public WeeklyQuantities Week { get; private set; } = null!;
    public int TotalNumber { get; private set; }
    public decimal? RatePerJob { get; private set; }
    public decimal? TotalValue { get; private set; }
    
    private void RecalculateTotals()
    {
        TotalNumber = Week.Total;

        TotalValue = WeeklyCalculator.Calculate(
            TotalNumber,
            RatePerJob);
    }
}
