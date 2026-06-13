namespace VanDriverRequisitions.Domain.Entities.FE.Models;

public sealed class FeTransferSnapshot
{
    public DateOnly WeekEndingDate { get; init; }

    public Guid ShopIdFrom { get; init; }
    public string ShopCodeFrom { get; init; } = string.Empty;
    public string ShopNameFrom { get; init; } = string.Empty;

    public Guid ShopIdTo { get; init; }
    public string ShopCodeTo { get; init; } = string.Empty;
    public string ShopNameTo { get; init; } = string.Empty;

    public WeeklyQuantitiesSnapshot Week { get; init; } = null!;
    public int TotalNumber { get; init; }
    public decimal RatePerJob { get; init; }
    public decimal TotalValue { get; init; }
}