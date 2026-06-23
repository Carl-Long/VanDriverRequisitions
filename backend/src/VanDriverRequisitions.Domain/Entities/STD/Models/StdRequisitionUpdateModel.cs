namespace VanDriverRequisitions.Domain.Entities.STD.Models;

public sealed record StdRequisitionUpdateModel(
    StdRequisitionDetails Details,
    IReadOnlyCollection<StdPickupUpdateModel> Pickups,
    IReadOnlyCollection<StdTransferUpdateModel> Transfers,
    IReadOnlyCollection<StdCollectionChargeBanksAndBinsUpdateModel> CollectionChargesBanksAndBins,
    IReadOnlyCollection<StdCollectionVanPackUpdateModel> CollectionVanPacks,
    IReadOnlyCollection<StdAdditionalCostUpdateModel> AdditionalCosts);