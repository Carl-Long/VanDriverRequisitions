namespace VanDriverRequisitions.Application.Features.StdLocations.Dtos;

public sealed class StdLocationSummaryDto
{
    public Guid Id { get; init; }

    public Guid ShopId { get; init; }
    public string ShopCode { get; init; } = string.Empty;
    public string ShopName { get; init; } = string.Empty;

    public Guid CollectionTypeId { get; init; }
    public string CollectionTypeCode { get; init; } = string.Empty;
    public string CollectionTypeName { get; init; } = string.Empty;

    public string LocationName { get; init; } = string.Empty;
    public string PostCode { get; init; } = string.Empty;

    public bool IsActive { get; init; }

    public DateTime CreatedAtUtc { get; init; }
    public string CreatedByNameSnapshot { get; init; } = string.Empty;
    public DateTime? UpdatedAtUtc { get; init; }
    public string? UpdatedByNameSnapshot { get; init; }
}