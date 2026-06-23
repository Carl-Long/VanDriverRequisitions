using VanDriverRequisitions.Application.Common.Extensions;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.Shops.Dtos;
using VanDriverRequisitions.Application.Features.VanDrivers.Dtos;
using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.FE.Models;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Mappings;

public static class FeRequisitionMapper
{
    public static FeRequisitionDetailDto MapRequisitionToDetailDto(
        FeRequisition requisition,
        VanDriverLookupDto vanDriverSummary,
        bool isShopActive,
        IReadOnlyDictionary<Guid, bool> reasonActiveMap)
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
            IsEditable = requisition.CanEdit,
            ApprovedAtUtc = requisition.ApprovedAtUtc,
            ApprovedByNameSnapshot = requisition.ApprovedByNameSnapshot,
            RejectedAtUtc = requisition.RejectedAtUtc,
            RejectedByNameSnapshot = requisition.RejectedByNameSnapshot,
            SubmittedAtUtc = requisition.SubmittedAtUtc,
            SubmittedByNameSnapshot = requisition.SubmittedByNameSnapshot,

            FeGeneralTasks = requisition.FeGeneralTasks
                .OrderBy(x => x.WeekEndingDate)
                .ThenBy(x => x.CreatedAtUtc)
                .ThenBy(x => x.Id)
                .Select(FeGeneralTaskMapper.ToDetailDto)
                .ToList(),

            FeMileages = requisition.FeMileages
                .OrderBy(x => x.WeekEndingDate)
                .ThenBy(x => x.CreatedAtUtc)
                .ThenBy(x => x.Id)
                .Select(FeMileageMapper.ToDetailDto)
                .ToList(),

            FeTransfers = requisition.FeTransfers
                .OrderBy(x => x.WeekEndingDate)
                .ThenBy(x => x.ShopNameFrom)
                .ThenBy(x => x.ShopNameTo)
                .ThenBy(x => x.CreatedAtUtc)
                .ThenBy(x => x.Id)
                .Select(FeTransferMapper.ToDetailDto)
                .ToList(),

            FeAdditionalCosts = requisition.FeAdditionalCosts
                .OrderBy(x => x.WeekEndingDate)
                .ThenBy(x => x.ReasonTextSnapshot)
                .ThenBy(x => x.CreatedAtUtc)
                .ThenBy(x => x.Id)
                .Select(x => FeAdditionalCostMapper.ToDetailDto(
                    x,
                    IsLookupActive(reasonActiveMap, x.ReasonId)))
                .ToList(),

            SubmissionHistory = MapSubmissionHistory(requisition.Submissions)
        };
    }

    public static RequisitionDetails MapToRequisitionDetails(
        SaveFeRequisitionDto saveFeRequisitionDto,
        VanDriverLookupDto driverSummary,
        ShopRequisitionSnapshotDto shop)
    {
        return new RequisitionDetails(
            saveFeRequisitionDto.RequisitionDate,
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
    
    private static bool IsLookupActive(IReadOnlyDictionary<Guid, bool> activeMap, Guid id)
    {
        return activeMap.TryGetValue(id, out var isActive) && isActive;
    }
}