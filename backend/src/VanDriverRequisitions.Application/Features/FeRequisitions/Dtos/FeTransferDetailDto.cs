namespace VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

public sealed class FeTransferDetailDto
{
    public Guid Id { get; init; }
    public DateOnly WeekEndingDate { get; init; }

    public Guid ShopIdFrom { get; init; }
    public string ShopCodeFrom { get; init; } = string.Empty;
    public string ShopNameFrom { get; init; } = string.Empty;
    public bool IsShopFromActive { get; init; }

    public Guid ShopIdTo { get; init; }
    public string ShopCodeTo { get; init; } = string.Empty;
    public string ShopNameTo { get; init; } = string.Empty;
    public bool IsShopToActive { get; init; }

    public required WeeklyQuantitiesDto Week { get; init; }
    public int TotalNumber { get; init; }
    public decimal? RatePerJob { get; init; }
    public decimal? TotalValue { get; init; }
}