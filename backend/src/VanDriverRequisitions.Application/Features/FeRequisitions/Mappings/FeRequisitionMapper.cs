using VanDriverRequisitions.Application.Common.Extensions;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.VanDrivers.Dtos;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Mappings;

public static class FeRequisitionMapper
{
    // =========================
    // DETAIL DTO
    // =========================

    public static FeRequisitionDetailDto MapRequisitionToDetailDto(FeRequisition requisition, VanDriverLookupDto vanDriverSummary)
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
            Status = EnumExtensions.GetDisplayName(requisition.Status),
            PoNumber = requisition.PoNumber,
            RejectionNotes = requisition.RejectionNotes,
            Subtotal = requisition.Subtotal,
            IsEditable = requisition.Status == RequisitionStatus.Draft || requisition.Status == RequisitionStatus.Rejected,
            ApprovedAtUtc = requisition.ApprovedAtUtc,
            ApprovedByNameSnapshot = requisition.ApprovedByNameSnapshot,
            RejectedAtUtc = requisition.RejectedAtUtc,
            RejectedByNameSnapshot = requisition.RejectedByNameSnapshot,
            SubmittedAtUtc = requisition.SubmittedAtUtc,
            SubmittedByNameSnapshot =requisition.SubmittedByNameSnapshot,
            
            FeGeneralTasks = requisition.FeGeneralTasks
                    .Select(MapGeneralTaskDetail)
                    .ToList(),
            
            SubmissionHistory = MapSubmissionHistory(requisition.Submissions)
        };
    }
    
    // =========================
    // GENERAL TASK DETAIL
    // =========================

    private static FeGeneralTaskDetailDto MapGeneralTaskDetail(
        FeGeneralTask task)
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
    
    // =========================
    // VALUE OBJECT -> DTO
    // =========================

    private static WeeklyQuantitiesDto MapWeekToDto(
        WeeklyQuantities week)
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
                ReviewedByNameSnapshot = x.ReviewedByNameSnapshot,
                ReviewedAtUtc = x.ReviewedAtUtc,
                RejectionNotes = x.RejectionNotes
            })
            .ToList();
    }
}
