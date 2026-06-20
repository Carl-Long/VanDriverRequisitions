namespace VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;

public sealed record SaveStdCollectionVanPackDto
{
    public Guid? Id { get; init; }
    public DateOnly DeliveryDate { get; init; }
    public required string PostCodeZone { get; init; }
    public int VanPacksOut { get; init; }
    public int FilledBags { get; init; }
}