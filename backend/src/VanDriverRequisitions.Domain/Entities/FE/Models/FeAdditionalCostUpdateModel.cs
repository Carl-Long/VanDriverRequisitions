using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Domain.Entities.FE.Models;

public sealed record FeAdditionalCostUpdateModel(
    Guid? Id,
    DateOnly WeekEndingDate,
    Guid ReasonId,
    string ReasonCodeSnapshot,
    string ReasonTextSnapshot,
    ChargingOption ChargingOption,
    int? TotalNumber,
    decimal? RatePerJob,
    int? Miles,
    decimal? RatePerMile);