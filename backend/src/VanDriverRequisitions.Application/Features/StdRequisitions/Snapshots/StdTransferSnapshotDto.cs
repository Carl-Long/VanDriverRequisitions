
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Snapshots;

public sealed record StdTransferSnapshotDto
{
    public DateOnly Date { get; init; }

    public Guid ShopIdFrom { get; init; }
    public required string ShopCodeFrom { get; init; }
    public required string ShopNameFrom { get; init; }

    public Guid ShopIdTo { get; init; }
    public required string ShopCodeTo { get; init; }
    public required string ShopNameTo { get; init; }

    public int? NumberOfBags { get; init; }
    public int? NumberOfBoxes { get; init; }
    
    public StdChargeType ChargeType { get; init; }

    public int? Miles { get; init; }
    public decimal? RatePerMile { get; init; }
    public decimal? FlatCharge { get; init; }

    public decimal TotalValue { get; init; }
}