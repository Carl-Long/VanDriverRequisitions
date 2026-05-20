namespace VanDriverRequisitions.Application.Features.FeTaskTypes.Dtos;

public class CreateFeTaskTypeDto
{
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public Guid? DailyQuantityLimitId { get; init; }
    public Guid? RateLimitId { get; init; }
}