using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Domain.Entities.STD.Models;

public sealed record StdCollectionChargeBanksAndBinsUpdateModel(
    Guid? Id,
    DateOnly Date,

    Guid CollectionTypeId,
    string CollectionTypeName,
    string CollectionTypeCode,

    Guid LocationId,
    Guid LocationShopId,
    Guid LocationCollectionTypeId,
    string LocationName,
    string LocationPostCode,

    int? NumberOfBags,

    StdChargeType ChargeType,
    int? Miles,
    decimal? RatePerMile,
    decimal? FlatCharge);