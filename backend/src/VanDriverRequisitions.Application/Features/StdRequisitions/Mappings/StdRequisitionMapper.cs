using VanDriverRequisitions.Application.Common.Extensions;
using VanDriverRequisitions.Application.Features.Shops.Dtos;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.VanDrivers.Dtos;
using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Entities.STD.Models;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Mappings;

public static class StdRequisitionMapper
{
    public static StdRequisitionDetailDto MapRequisitionToDetailDto(
        StdRequisition requisition,
        VanDriverLookupDto vanDriverSummary,
        bool isShopActive,
        IReadOnlyDictionary<Guid, bool> additionalCostReasonActiveMap,
        IReadOnlyDictionary<Guid, bool> collectionTypeActiveMap,
        IReadOnlyDictionary<Guid, StdLocation> locationMap,
        IReadOnlyDictionary<Guid, bool> transferShopActiveMap)
    {
        return new StdRequisitionDetailDto
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

            CollectionChargesBanksAndBins = requisition.CollectionChargesBanksAndBins
                .OrderBy(x => x.Date)
                .ThenBy(x => x.CollectionTypeNameSnapshot)
                .ThenBy(x => x.LocationNameSnapshot)
                .ThenBy(x => x.CreatedAtUtc)
                .ThenBy(x => x.Id)
                .Select(x =>
                {
                    var locationStatus = GetLocationRelationshipStatus(requisition, x, locationMap);

                    return StdCollectionChargeBanksAndBinsMapper.ToDetailDto(
                        x,
                        IsLookupActive(collectionTypeActiveMap, x.CollectionTypeId),
                        locationStatus.IsActive,
                        locationStatus.IsLinkedToRequisitionShop,
                        locationStatus.IsLinkedToCollectionType);
                })
                .ToList(),

            CollectionVanPacks = requisition.CollectionVanPacks
                .OrderBy(x => x.DeliveryDate)
                .ThenBy(x => x.PostCodeZone)
                .Select(StdCollectionVanPackMapper.ToDetailDto)
                .ToList(),

            Pickups = requisition.Pickups
                .OrderBy(x => x.Date)
                .ThenBy(x => x.ChargeType)
                .Select(StdPickupMapper.ToDetailDto)
                .ToList(),

            Transfers = requisition.Transfers
                .OrderBy(x => x.Date)
                .ThenBy(x => x.ShopNameFrom)
                .ThenBy(x => x.ShopNameTo)
                .Select(x => StdTransferMapper.ToDetailDto(
                    x,
                    IsLookupActive(transferShopActiveMap, x.ShopIdFrom),
                    IsLookupActive(transferShopActiveMap, x.ShopIdTo)))
                .ToList(),

            AdditionalCosts = requisition.AdditionalCosts
                .OrderBy(x => x.Date)
                .ThenBy(x => x.ReasonTextSnapshot)
                .ThenBy(x => x.ChargeType)
                .Select(x => StdAdditionalCostMapper.ToDetailDto(
                    x,
                    IsLookupActive(additionalCostReasonActiveMap, x.ReasonId)))
                .ToList(),

            SubmissionHistory = MapSubmissionHistory(requisition.Submissions)
        };
    }

    public static StdRequisitionDetails MapToRequisitionDetails(
        SaveStdRequisitionDto saveStdRequisitionDto,
        VanDriverLookupDto driverSummary,
        ShopRequisitionSnapshotDto shop)
    {
        return new StdRequisitionDetails(
            saveStdRequisitionDto.RequisitionDate,
            new VanDriverSnapshot(
                driverSummary.Id,
                driverSummary.Code,
                saveStdRequisitionDto.VanDriverName.Trim(),
                driverSummary.TradersName,
                driverSummary.HasVat),
            new ShopSnapshot(
                shop.Id,
                shop.Code,
                shop.Name));
    }

    private static List<StdRequisitionSubmissionHistoryDto> MapSubmissionHistory(IEnumerable<StdRequisitionSubmission> submissions)
    {
        return submissions
            .OrderByDescending(x => x.SubmissionNumber)
            .Select(x => new StdRequisitionSubmissionHistoryDto
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


    private readonly record struct StdLocationRelationshipStatus(bool IsActive, bool IsLinkedToRequisitionShop, bool IsLinkedToCollectionType);

    private static StdLocationRelationshipStatus GetLocationRelationshipStatus(StdRequisition requisition, StdCollectionChargeBanksAndBins collectionCharge, IReadOnlyDictionary<Guid, StdLocation> locationMap)
    {
        if (!locationMap.TryGetValue(collectionCharge.LocationId, out var location))
        {
            return new StdLocationRelationshipStatus(IsActive: false, IsLinkedToRequisitionShop: false, IsLinkedToCollectionType: false);
        }

        return new StdLocationRelationshipStatus(
            IsActive: location.IsActive,
            IsLinkedToRequisitionShop: location.ShopId == requisition.ShopId,
            IsLinkedToCollectionType: location.CollectionTypeId == collectionCharge.CollectionTypeId);
    }

    private static bool IsLookupActive(IReadOnlyDictionary<Guid, bool> activeMap, Guid id)
    {
        return activeMap.TryGetValue(id, out var isActive) && isActive;
    }
}