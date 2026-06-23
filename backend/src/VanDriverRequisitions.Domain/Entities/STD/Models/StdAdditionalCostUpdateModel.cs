using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Domain.Entities.STD.Models;

public sealed record StdAdditionalCostUpdateModel(
    Guid? Id,
    DateOnly Date,
    Guid ReasonId,
    string ReasonCodeSnapshot,
    string ReasonTextSnapshot,
    int NumberOfBags,
    StdChargeType ChargeType,
    int? Miles,
    decimal? RatePerMile,
    decimal? FlatCharge);