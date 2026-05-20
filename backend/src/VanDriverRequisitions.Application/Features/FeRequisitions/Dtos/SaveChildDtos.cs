using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

public class SaveFeGeneralTaskDto
{
    public Guid? Id { get; init; }
    public Guid FeTaskTypeId { get; init; }
    public DateOnly WeekEndingDate { get; init; }
    public WeeklyQuantitiesDto Week { get; init; } = new();
    public decimal? RatePerJob { get; init; }
}

public class SaveFeMileageDto
{
    public Guid? Id { get; init; }
    public DateOnly WeekEndingDate { get; init; }
    public WeeklyQuantitiesDto Week { get; init; } = new();
    public decimal? RatePerMile { get; init; }
}

public class SaveFeTransferDto
{
    public Guid? Id { get; init; }
    public DateOnly WeekEndingDate { get; init; }
    public Guid ShopIdFrom { get; init; }
    public Guid ShopIdTo { get; init; }
    public WeeklyQuantitiesDto Week { get; init; } = new();
    public decimal? RatePerJob { get; init; }
}

public class SaveFeAdditionalCostDto
{
    public Guid? Id { get; init; }
    public DateOnly WeekEndingDate { get; init; }
    public Guid ReasonId { get; init; }
    public ChargingOption ChargingOption { get; init; }
    public int? TotalNumber { get; init; }
    public decimal? RatePerJob { get; init; }
    public int? Miles { get; init; }
    public decimal? RatePerMile { get; init; }
}
