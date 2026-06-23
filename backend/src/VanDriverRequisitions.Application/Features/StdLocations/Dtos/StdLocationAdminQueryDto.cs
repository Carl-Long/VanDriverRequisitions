namespace VanDriverRequisitions.Application.Features.StdLocations.Dtos;

public sealed class StdLocationAdminQueryDto
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string? Search { get; init; }
    public Guid? ShopId { get; init; }
    public Guid? CollectionTypeId { get; init; }
    public bool IncludeInactive { get; init; }
}