using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Domain.Entities.FE.Models;

public sealed record FeTransferUpdateModel(
    Guid? Id,
    ShopSnapshot FromShop,
    ShopSnapshot ToShop,
    DateOnly WeekEndingDate,
    WeeklyQuantities Week,
    decimal? RatePerJob);