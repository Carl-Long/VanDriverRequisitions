using System.Text.Json;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.FE.Models;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Snapshots;

public static class FeRequisitionSnapshotFactory
{
        
    public static string CreateJson(FeRequisition requisition)
    {
        var snapshot = Create(requisition);
        return JsonSerializer.Serialize(snapshot);
    }
    
    private static FeRequisitionSnapshot Create(FeRequisition requisition)
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

            Mileages = requisition.FeMileages
                .Select(CreateMileageSnapshot)
                .ToList(),
            
            Transfers = [],
            AdditionalCosts = []
        };
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
    
    private static FeMileageSnapshot CreateMileageSnapshot(FeMileage mileage)
    {
        return new FeMileageSnapshot
        {
            WeekEndingDate = mileage.WeekEndingDate,

            Week = new WeeklyQuantitiesSnapshot
            {
                Saturday = mileage.Week.Saturday ?? 0,
                Sunday = mileage.Week.Sunday ?? 0,
                Monday = mileage.Week.Monday ?? 0,
                Tuesday = mileage.Week.Tuesday ?? 0,
                Wednesday = mileage.Week.Wednesday ?? 0,
                Thursday = mileage.Week.Thursday ?? 0,
                Friday = mileage.Week.Friday ?? 0
            },

            TotalMiles = mileage.TotalMiles ?? 0,
            RatePerMile = mileage.RatePerMile ?? 0,
            TotalValue = mileage.TotalValue ?? 0
        };
    }
}