namespace VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;

public sealed class SaveStdRequisitionDto
{
    public DateOnly RequisitionDate { get; init; }
    public byte[]? RowVersion { get; init; }
    public Guid VanDriverId { get; init; }
    public required string VanDriverName { get; init; }
    public Guid ShopId { get; init; }
    public required IReadOnlyCollection<SaveStdCollectionChargeBanksAndBinsDto> CollectionChargesBanksAndBins { get; init; }
    public required IReadOnlyCollection<SaveStdCollectionVanPackDto> CollectionVanPacks { get; init; }
    public required IReadOnlyCollection<SaveStdPickupDto> Pickups { get; init; }
    public required IReadOnlyCollection<SaveStdTransferDto> Transfers { get; init; }
    public required IReadOnlyCollection<SaveStdAdditionalCostDto> AdditionalCosts { get; init; }
}