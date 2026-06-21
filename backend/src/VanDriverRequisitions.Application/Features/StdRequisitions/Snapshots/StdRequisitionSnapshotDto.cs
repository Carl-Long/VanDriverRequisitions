namespace VanDriverRequisitions.Application.Features.StdRequisitions.Snapshots;

public sealed class StdRequisitionSnapshotDto
{
    public string RequisitionNumber { get; init; } = string.Empty;
    public DateOnly RequisitionDate { get; init; }

    public string VanDriverCode { get; init; } = string.Empty;
    public string VanDriverName { get; init; } = string.Empty;
    public string TradersName { get; init; } = string.Empty;

    public string ShopCode { get; init; } = string.Empty;
    public string ShopName { get; init; } = string.Empty;

    public bool IsVatApplicable { get; init; }

    public decimal Subtotal { get; init; }

    public List<StdCollectionChargeBanksAndBinsSnapshotDto> CollectionChargesBanksAndBins { get; init; } = [];
    public List<StdCollectionVanPackSnapshotDto> CollectionVanPacks { get; init; } = [];
    public List<StdPickupSnapshotDto> Pickups { get; init; } = [];
    public List<StdTransferSnapshotDto> Transfers { get; init; } = [];
}