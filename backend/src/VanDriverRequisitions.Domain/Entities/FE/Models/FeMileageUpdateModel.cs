using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Domain.Entities.FE.Models;

public sealed record FeMileageUpdateModel(
    Guid? Id,
    DateOnly WeekEndingDate,
    WeeklyQuantities Week,
    decimal? RatePerMile);