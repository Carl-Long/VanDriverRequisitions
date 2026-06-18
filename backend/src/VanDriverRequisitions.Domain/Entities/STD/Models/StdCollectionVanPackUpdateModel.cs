namespace VanDriverRequisitions.Domain.Entities.STD.Models;

public sealed record StdCollectionVanPackUpdateModel(
    Guid? Id,
    DateOnly DeliveryDate,
    string PostCodeZone,
    int VanPacksOut,
    int FilledBags,
    decimal RatePerVanPack);