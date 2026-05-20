using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Mappings;

public static class FeRequisitionMapper
{
    public static FeRequisitionDetailDto ToDetailDto(
        FeRequisition requisition,
        IReadOnlyDictionary<Guid, (string Code, string Name)> shopLookup,
        bool isVanDriverActive = true,
        bool isShopActive = true)
    {
        return new FeRequisitionDetailDto
        {
            Id = requisition.Id,
            RequisitionNumber = requisition.RequisitionNumber,
            RequisitionDate = requisition.RequisitionDate,
            VanDriverId = requisition.VanDriverId,
            VanDriverCode = requisition.VanDriverCode,
            VanDriverName = requisition.VanDriverName,
            TradersName = requisition.TradersName,
            ShopId = requisition.ShopId,
            ShopCode = requisition.ShopCode,
            ShopName = requisition.ShopName,
            Status = requisition.Status.ToString(),
            IsVatApplicable = requisition.IsVatApplicable,
            PoNumber = requisition.PoNumber,
            RejectionNotes = requisition.RejectionNotes,
            Subtotal = requisition.Subtotal,
            IsEditable = IsEditable(requisition.Status),
            IsVanDriverActive = isVanDriverActive,
            IsShopActive = isShopActive,
            FeGeneralTasks = requisition.FeGeneralTasks
                .OrderBy(x => x.WeekEndingDate)
                .Select(ToDto)
                .ToList(),
            FeMileages = requisition.FeMileages
                .OrderBy(x => x.WeekEndingDate)
                .Select(ToDto)
                .ToList(),
            FeTransfers = requisition.FeTransfers
                .OrderBy(x => x.WeekEndingDate)
                .Select(x => ToDto(x, shopLookup))
                .ToList(),
            FeAdditionalCosts = requisition.FeAdditionalCosts
                .OrderBy(x => x.WeekEndingDate)
                .Select(ToDto)
                .ToList(),
        };
    }

    public static bool IsEditable(RequisitionStatus status) =>
        status is RequisitionStatus.Draft or RequisitionStatus.Rejected or RequisitionStatus.Resubmitted;

    private static FeGeneralTaskDto ToDto(FeGeneralTask x) => new()
    {
        Id = x.Id,
        FeTaskTypeId = x.FeTaskTypeId,
        TaskTypeName = x.TaskTypeName,
        TaskTypeCode = x.TaskTypeCode,
        WeekEndingDate = x.WeekEndingDate,
        Week = ToDto(x.Week),
        RatePerJob = x.RatePerJob,
        TotalNumber = x.TotalNumber,
        TotalValue = x.TotalValue,
    };

    private static FeMileageDto ToDto(FeMileage x) => new()
    {
        Id = x.Id,
        WeekEndingDate = x.WeekEndingDate,
        Week = ToDto(x.Week),
        RatePerMile = x.RatePerMile,
        TotalMiles = x.TotalMiles,
        TotalValue = x.TotalValue,
    };

    private static FeTransferDto ToDto(
        FeTransfer x,
        IReadOnlyDictionary<Guid, (string Code, string Name)> shopLookup)
    {
        var fromShop = shopLookup.TryGetValue(x.ShopIdFrom, out var f) ? f : (Code: string.Empty, Name: string.Empty);
        var toShop = shopLookup.TryGetValue(x.ShopIdTo, out var t) ? t : (Code: string.Empty, Name: string.Empty);

        return new FeTransferDto
        {
            Id = x.Id,
            WeekEndingDate = x.WeekEndingDate,
            ShopIdFrom = x.ShopIdFrom,
            ShopCodeFrom = fromShop.Code,
            ShopNameFrom = fromShop.Name,
            ShopIdTo = x.ShopIdTo,
            ShopCodeTo = toShop.Code,
            ShopNameTo = toShop.Name,
            Week = ToDto(x.Week),
            RatePerJob = x.RatePerJob,
            TotalNumber = x.TotalNumber,
            TotalValue = x.TotalValue,
        };
    }

    private static FeAdditionalCostDto ToDto(FeAdditionalCost x) => new()
    {
        Id = x.Id,
        WeekEndingDate = x.WeekEndingDate,
        ReasonId = x.ReasonId,
        ReasonText = x.ReasonText,
        ChargingOption = x.ChargingOption,
        TotalNumber = x.TotalNumber,
        RatePerJob = x.RatePerJob,
        Miles = x.Miles,
        RatePerMile = x.RatePerMile,
        TotalValue = x.TotalValue,
    };

    public static WeeklyQuantitiesDto ToDto(WeeklyQuantities w) => new()
    {
        Sunday = w.Sunday,
        Monday = w.Monday,
        Tuesday = w.Tuesday,
        Wednesday = w.Wednesday,
        Thursday = w.Thursday,
        Friday = w.Friday,
        Saturday = w.Saturday,
    };

    public static WeeklyQuantities ToDomain(WeeklyQuantitiesDto w) =>
        new(w.Sunday, w.Monday, w.Tuesday, w.Wednesday, w.Thursday, w.Friday, w.Saturday);
}
