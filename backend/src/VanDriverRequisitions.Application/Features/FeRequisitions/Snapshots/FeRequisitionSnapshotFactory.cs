using System.Text.Json;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.FE.Models;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Snapshots;

public static class FeRequisitionSnapshotFactory
{
    public static FeRequisitionSnapshot Create(FeRequisition requisition)
    {
        return new FeRequisitionSnapshot
        {
            RequisitionNumber = requisition.RequisitionNumber,
            RequisitionDate = requisition.RequisitionDate,
            VanDriverCode = requisition.VanDriverCode,
            VanDriverName = requisition.VanDriverName,
            TradersName = requisition.TradersName,
            ShopCode = requisition.ShopCode,
            ShopName = requisition.ShopName,
            IsVatApplicable = requisition.IsVatApplicable,
            Subtotal = requisition.Subtotal,

            GeneralTasks = requisition.FeGeneralTasks
                .Select(CreateGeneralTaskSnapshot)
                .ToList(),

            Mileages = [],
            Transfers = [],
            AdditionalCosts = []
        };
    }
    
    public static string CreateJson(FeRequisition requisition)
    {
        var snapshot = Create(requisition);
        return JsonSerializer.Serialize(snapshot);
    }
    
    private static FeGeneralTaskSnapshot CreateGeneralTaskSnapshot(FeGeneralTask task)
    {
        return new FeGeneralTaskSnapshot
        {
            TaskTypeCode = task.TaskTypeCode,
            TaskTypeName = task.TaskTypeName,
            WeekEndingDate = task.WeekEndingDate,

            Week = new WeeklyQuantitiesSnapshot
            {
                Saturday = task.Week.Saturday ?? 0,
                Sunday = task.Week.Sunday ?? 0,
                Monday = task.Week.Monday ?? 0,
                Tuesday = task.Week.Tuesday ?? 0,
                Wednesday = task.Week.Wednesday ?? 0,
                Thursday = task.Week.Thursday ?? 0,
                Friday = task.Week.Friday ?? 0
            },

            TotalNumber = task.TotalNumber,
            RatePerJob = task.RatePerJob,
            TotalValue = task.TotalValue
        };
    }
}