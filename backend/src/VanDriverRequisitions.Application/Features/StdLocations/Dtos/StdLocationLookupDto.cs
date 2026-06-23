namespace VanDriverRequisitions.Application.Features.StdLocations.Dtos;

public sealed class StdLocationLookupDto
{
    public Guid Id { get; init; }
    public Guid ShopId { get; init; }
    public Guid CollectionTypeId { get; init; }
    public required string LocationName { get; init; }
    public required string PostCode { get; init; }
}