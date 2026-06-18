using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Domain.Entities.STD.Models;

public sealed record StdPickupUpdateModel(
    Guid? Id,
    DateOnly Date,
    int NumberOfBags,
    int NumberOfHouseholds,
    StdChargeType ChargeType,
    int? Miles,
    decimal? RatePerMile,
    decimal? FlatCharge);