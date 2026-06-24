using System.Text.Json;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Snapshots;

public static class FeRequisitionSnapshotFactory
{
    public static string CreateJson(FeRequisition requisition)
    {
        var snapshot = Create(requisition);
        return JsonSerializer.Serialize(snapshot);
    }
    
    private static FeRequisitionSnapshotDto Create(FeRequisition requisition)
    {
        return new FeRequisitionSnapshotDto
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
            
            Transfers = requisition.FeTransfers
                .Select(CreateTransferSnapshot)
                .ToList(),
            
            AdditionalCosts = requisition.FeAdditionalCosts
                .Select(CreateAdditionalCostSnapshot)
                .ToList()
        };
    }
    
    private static FeGeneralTaskSnapshotDto CreateGeneralTaskSnapshot(FeGeneralTask task)
    {
        return new FeGeneralTaskSnapshotDto
        {
            TaskTypeCode = task.TaskTypeCode,
            TaskTypeName = task.TaskTypeName,
            WeekEndingDate = task.WeekEndingDate,

            Week = new WeeklyQuantitiesSnapshotDto
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
            RatePerJob = task.RatePerJob ?? 0,
            TotalValue = task.TotalValue ??0
        };
    }
    
    private static FeMileageSnapshotDto CreateMileageSnapshot(FeMileage mileage)
    {
        return new FeMileageSnapshotDto
        {
            WeekEndingDate = mileage.WeekEndingDate,

            Week = new WeeklyQuantitiesSnapshotDto
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
    
    private static FeTransferSnapshotDto CreateTransferSnapshot(FeTransfer transfer)
    {
        return new FeTransferSnapshotDto
        {
            WeekEndingDate = transfer.WeekEndingDate,

            ShopIdFrom = transfer.ShopIdFrom,
            ShopCodeFrom = transfer.ShopCodeFrom,
            ShopNameFrom = transfer.ShopNameFrom,

            ShopIdTo = transfer.ShopIdTo,
            ShopCodeTo = transfer.ShopCodeTo,
            ShopNameTo = transfer.ShopNameTo,

            Week = new WeeklyQuantitiesSnapshotDto
            {
                Saturday = transfer.Week.Saturday ?? 0,
                Sunday = transfer.Week.Sunday ?? 0,
                Monday = transfer.Week.Monday ?? 0,
                Tuesday = transfer.Week.Tuesday ?? 0,
                Wednesday = transfer.Week.Wednesday ?? 0,
                Thursday = transfer.Week.Thursday ?? 0,
                Friday = transfer.Week.Friday ?? 0
            },

            TotalNumber = transfer.TotalNumber,
            RatePerJob = transfer.RatePerJob ?? 0,
            TotalValue = transfer.TotalValue ?? 0
        };
    }

    private static FeAdditionalCostSnapshotDto CreateAdditionalCostSnapshot(FeAdditionalCost cost)
    {
        return new FeAdditionalCostSnapshotDto
        {
            WeekEndingDate = cost.WeekEndingDate,
            ReasonId = cost.ReasonId,
            ReasonCode = cost.ReasonCodeSnapshot,
            ReasonText = cost.ReasonTextSnapshot,
            ChargingOption = cost.ChargingOption,
            TotalNumber = cost.TotalNumber,
            RatePerJob = cost.RatePerJob,
            Miles = cost.Miles,
            RatePerMile = cost.RatePerMile,
            TotalValue = cost.TotalValue
        };
    }
}