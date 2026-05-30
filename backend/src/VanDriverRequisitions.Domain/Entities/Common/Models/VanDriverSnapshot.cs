namespace VanDriverRequisitions.Domain.Entities.Common.Models;

public sealed record VanDriverSnapshot(
    Guid Id,
    string Code,
    string Name,
    string TradersName,
    bool HasVat
);