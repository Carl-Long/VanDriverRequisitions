using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Domain.Entities.FE.Models;

public sealed record FeGeneralTaskUpdateModel(
    Guid? Id,
    Guid FeTaskTypeId,
    string TaskTypeName,
    string TaskTypeCode,
    DateOnly WeekEndingDate,
    WeeklyQuantities Week,
    decimal? RatePerJob);