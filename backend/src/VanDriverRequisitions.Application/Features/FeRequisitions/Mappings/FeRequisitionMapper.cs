using VanDriverRequisitions.Application.Common.Extensions;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.VanDrivers.Dtos;
using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.FE.Models;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Mappings;

public static class FeRequisitionMapper
{

    public static FeRequisitionDetailDto MapRequisitionToDetailDto(
        FeRequisition requisition,
        VanDriverLookupDto vanDriverSummary,
        bool isShopActive)
    {
        return new FeRequisitionDetailDto
        {
            Id = requisition.Id,
            RowVersion = requisition.RowVersion,
            RequisitionNumber = requisition.RequisitionNumber,
            RequisitionDate = requisition.RequisitionDate,
            VanDriverSummary = vanDriverSummary,
            VanDriverId = requisition.VanDriverId,
            VanDriverName = requisition.VanDriverName,
            ShopId = requisition.ShopId,
            ShopCode = requisition.ShopCode,
            ShopName = requisition.ShopName,
            IsShopActive = isShopActive,
            Status = requisition.Status.GetDisplayName(),
            PoNumber = requisition.PoNumber,
            RejectionNotes = requisition.RejectionNotes,
            Subtotal = requisition.Subtotal,
            IsEditable = requisition.Status is RequisitionStatus.Draft or RequisitionStatus.Rejected,
            ApprovedAtUtc = requisition.ApprovedAtUtc,
            ApprovedByNameSnapshot = requisition.ApprovedByNameSnapshot,
            RejectedAtUtc = requisition.RejectedAtUtc,
            RejectedByNameSnapshot = requisition.RejectedByNameSnapshot,
            SubmittedAtUtc = requisition.SubmittedAtUtc,
            SubmittedByNameSnapshot = requisition.SubmittedByNameSnapshot,
            
            FeGeneralTasks = requisition.FeGeneralTasks
                .Select(MapGeneralTaskDetail)
                .ToList(),

            FeMileages = requisition.FeMileages
                .Select(MapMileageDetail)
                .ToList(),
            
            FeTransfers = requisition.FeTransfers
                .Select(MapTransferDetail)
                .ToList(),

            SubmissionHistory = MapSubmissionHistory(requisition.Submissions)
        };
    }
    
    public static RequisitionDetails MapToRequisitionDetails(
        SaveFeRequisitionDto saveFeRequisitionDto, 
        VanDriverLookupDto driverSummary, 
        ShopRequisitionSnapshotDto shop)
    {
        return new RequisitionDetails(saveFeRequisitionDto.RequisitionDate,
            new VanDriverSnapshot(
                driverSummary.Id,
                driverSummary.Code,
                saveFeRequisitionDto.VanDriverName.Trim(),
                driverSummary.TradersName,
                driverSummary.HasVat),
            new ShopSnapshot(
                shop.Id,
                shop.Code,
                shop.Name));
    }
    
    private static FeGeneralTaskDetailDto MapGeneralTaskDetail(FeGeneralTask task)
    {
        return new FeGeneralTaskDetailDto
        {
            Id = task.Id,
            FeTaskTypeId = task.FeTaskTypeId,
            TaskTypeName = task.TaskTypeName,
            TaskTypeCode = task.TaskTypeCode,
            WeekEndingDate = task.WeekEndingDate,
            Week = MapWeekToDto(task.Week),
            TotalNumber = task.TotalNumber,
            RatePerJob = task.RatePerJob,
            TotalValue = task.TotalValue
        };
    }
    
    private static FeMileageDetailDto MapMileageDetail(FeMileage mileage)
    {
        return new FeMileageDetailDto
        {
            Id = mileage.Id,
            WeekEndingDate = mileage.WeekEndingDate,
            Week = MapWeekToDto(mileage.Week),
            TotalMiles = mileage.TotalMiles,
            RatePerMile = mileage.RatePerMile,
            TotalValue = mileage.TotalValue
        };
    }
    
    private static FeTransferDetailDto MapTransferDetail(FeTransfer transfer)
    {
        return new FeTransferDetailDto
        {
            Id = transfer.Id,
            WeekEndingDate = transfer.WeekEndingDate,

            ShopIdFrom = transfer.ShopIdFrom,
            ShopCodeFrom = transfer.ShopCodeFrom,
            ShopNameFrom = transfer.ShopNameFrom,

            ShopIdTo = transfer.ShopIdTo,
            ShopCodeTo = transfer.ShopCodeTo,
            ShopNameTo = transfer.ShopNameTo,

            Week = MapWeekToDto(transfer.Week),
            TotalNumber = transfer.TotalNumber,
            RatePerJob = transfer.RatePerJob,
            TotalValue = transfer.TotalValue
        };
    }
    
    private static WeeklyQuantitiesDto MapWeekToDto(WeeklyQuantities week)
    {
        return new WeeklyQuantitiesDto
        {
            Sunday = week.Sunday,
            Monday = week.Monday,
            Tuesday = week.Tuesday,
            Wednesday = week.Wednesday,
            Thursday = week.Thursday,
            Friday = week.Friday,
            Saturday = week.Saturday
        };
    }
    
    private static List<FeRequisitionSubmissionHistoryDto> MapSubmissionHistory(IEnumerable<FeRequisitionSubmission> submissions)
    {
        return submissions
            .OrderByDescending(x => x.SubmissionNumber)
            .Select(x => new FeRequisitionSubmissionHistoryDto
            {
                Id = x.Id,
                SubmissionNumber = x.SubmissionNumber,
                Status = x.Status.ToString(),
                SubmittedByNameSnapshot = x.SubmittedByNameSnapshot,
                SubmittedAtUtc = x.SubmittedAtUtc,
                PoNumber = x.PoNumber,
                ReviewedByNameSnapshot = x.ReviewedByNameSnapshot,
                ReviewedAtUtc = x.ReviewedAtUtc,
                RejectionNotes = x.RejectionNotes
            })
            .ToList();
    }
}
