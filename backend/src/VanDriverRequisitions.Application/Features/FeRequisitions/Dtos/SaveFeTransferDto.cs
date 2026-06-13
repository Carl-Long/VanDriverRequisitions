namespace VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

public sealed class SaveFeTransferDto
{
    public Guid? Id { get; set; }
    public DateOnly WeekEndingDate { get; init; }

    public Guid ShopIdFrom { get; init; }
    public Guid ShopIdTo { get; init; }

    public required WeeklyQuantitiesDto Week { get; init; }
    public decimal? RatePerJob { get; init; }
}