namespace VanDriverRequisitions.Application.Features.StdLocations.Dtos;

public sealed class StdLocationLookupQueryDto
{
    public Guid ShopId { get; init; }
    public Guid CollectionTypeId { get; init; }
}