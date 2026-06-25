namespace VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;

public sealed class SaveStdRequisitionDto
{
    public DateOnly RequisitionDate { get; init; }
    public byte[]? RowVersion { get; init; }
    public Guid VanDriverId { get; init; }
    public required string VanDriverName { get; init; }
    public Guid ShopId { get; init; }
    public IReadOnlyCollection<SaveStdCollectionChargeBanksAndBinsDto> CollectionChargesBanksAndBins { get; init; } = [];
    public IReadOnlyCollection<SaveStdCollectionVanPackDto> CollectionVanPacks { get; init; } = [];
    public IReadOnlyCollection<SaveStdPickupDto> Pickups { get; init; } = [];
    public IReadOnlyCollection<SaveStdTransferDto> Transfers { get; init; } = [];
    public IReadOnlyCollection<SaveStdAdditionalCostDto> AdditionalCosts { get; init; } = [];
}