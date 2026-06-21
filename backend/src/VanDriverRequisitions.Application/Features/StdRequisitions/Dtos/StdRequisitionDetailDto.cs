using VanDriverRequisitions.Application.Features.VanDrivers.Dtos;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;

public sealed class StdRequisitionDetailDto
{
    public Guid Id { get; init; }
    public byte[] RowVersion { get; init; } = [];
    public required string RequisitionNumber { get; init; }
    public DateOnly RequisitionDate { get; init; }

    public required VanDriverLookupDto VanDriverSummary { get; init; }
    public Guid VanDriverId { get; init; }
    public string VanDriverName { get; init; } = string.Empty;

    public Guid ShopId { get; init; }
    public required string ShopCode { get; init; }
    public required string ShopName { get; init; }
    public bool IsShopActive { get; init; }

    public string Status { get; init; } = string.Empty;
    public decimal Subtotal { get; init; }

    public required List<StdCollectionChargeBanksAndBinsDetailDto> CollectionChargesBanksAndBins { get; init; }
    public required List<StdCollectionVanPackDetailDto> CollectionVanPacks { get; init; }
    public required List<StdPickupDetailDto> Pickups { get; init; }
    public required List<StdTransferDetailDto> Transfers { get; init; }
    public required List<StdAdditionalCostDetailDto> AdditionalCosts { get; init; }

    public bool IsEditable { get; init; }

    public DateTime? SubmittedAtUtc { get; init; }
    public string? SubmittedByNameSnapshot { get; init; }

    public DateTime? ApprovedAtUtc { get; init; }
    public string? ApprovedByNameSnapshot { get; init; }
    public string? PoNumber { get; init; }

    public DateTime? RejectedAtUtc { get; init; }
    public string? RejectedByNameSnapshot { get; init; }
    public string? RejectionNotes { get; init; }

    public List<StdRequisitionSubmissionHistoryDto> SubmissionHistory { get; init; } = [];
}