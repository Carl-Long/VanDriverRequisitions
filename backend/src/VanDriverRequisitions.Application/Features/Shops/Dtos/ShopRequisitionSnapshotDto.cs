namespace VanDriverRequisitions.Application.Features.Shops.Dtos;

public sealed class ShopRequisitionSnapshotDto
{
    public Guid Id { get; init; }
    public required string Code { get; init; }
    public required string Name { get; init; }
    public bool IsActive { get; init; }
}