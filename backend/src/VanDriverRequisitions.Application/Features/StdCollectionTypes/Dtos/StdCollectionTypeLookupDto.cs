namespace VanDriverRequisitions.Application.Features.StdCollectionTypes.Dtos;

public sealed class StdCollectionTypeLookupDto
{
    public Guid Id { get; init; }
    public required string Code { get; init; }
    public required string Name { get; init; }
}