using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Domain.Entities.STD.Models;

public sealed record StdTransferUpdateModel(
    Guid? Id,
    DateOnly Date,
    ShopSnapshot FromShop,
    ShopSnapshot ToShop,
    int? NumberOfBags,
    int? NumberOfBoxes,
    StdChargeType ChargeType,
    int? NumberOfMiles,
    decimal? RatePerMile,
    decimal? FlatCharge);