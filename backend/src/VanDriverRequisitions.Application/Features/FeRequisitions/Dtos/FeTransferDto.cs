namespace VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

public class FeTransferDto
{
    public Guid? Id { get; init; }
    public DateOnly WeekEndingDate { get; init; }
    public Guid ShopIdFrom { get; init; }
    public string ShopCodeFrom { get; init; } = string.Empty;
    public string ShopNameFrom { get; init; } = string.Empty;
    public Guid ShopIdTo { get; init; }
    public string ShopCodeTo { get; init; } = string.Empty;
    public string ShopNameTo { get; init; } = string.Empty;
    public WeeklyQuantitiesDto Week { get; init; } = new();
    public decimal? RatePerJob { get; init; }
    public int TotalNumber { get; init; }
    public decimal? TotalValue { get; init; }
}
