namespace VanDriverRequisitions.Domain.Entities.Common.Models;

public sealed record ShopSnapshot(
    Guid Id,
    string Code,
    string Name)
;