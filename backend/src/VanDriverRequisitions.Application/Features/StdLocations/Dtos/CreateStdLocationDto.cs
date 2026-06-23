namespace VanDriverRequisitions.Application.Features.StdLocations.Dtos;

public sealed class CreateStdLocationDto
{
    public Guid ShopId { get; init; }
    public Guid CollectionTypeId { get; init; }
    public string LocationName { get; init; } = string.Empty;
    public string PostCode { get; init; } = string.Empty;
}