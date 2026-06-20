namespace VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;

public sealed record StdCollectionVanPackSnapshotDto
{
    public DateOnly DeliveryDate { get; init; }
    public required string PostCodeZone { get; init; }
    public int VanPacksOut { get; init; }
    public int FilledBags { get; init; }
    public int UnusedVanPacks { get; init; }
    public decimal PercentReturned { get; init; }
    public decimal RatePerVanPack { get; init; }
    public decimal TotalValue { get; init; }
}