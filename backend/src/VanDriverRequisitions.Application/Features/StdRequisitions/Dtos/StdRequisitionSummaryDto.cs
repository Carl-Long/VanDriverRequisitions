namespace VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;

public sealed class StdRequisitionSummaryDto
{
    public Guid Id { get; init; }
    public string RequisitionNumber { get; init; } = string.Empty;
    public DateOnly RequisitionDate { get; init; }
    public string VanDriverCode { get; init; } = string.Empty;
    public string VanDriverName { get; init; } = string.Empty;
    public string TradersName { get; init; } = string.Empty;
    public string ShopCode { get; init; } = string.Empty;
    public string ShopName { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public decimal Subtotal { get; init; }
    public DateTime CreatedAtUtc { get; init; }
    public Guid CreatedById { get; init; }
    public string CreatedByNameSnapshot { get; init; } = string.Empty;
    public DateTime? UpdatedAtUtc { get; init; }
    public string? UpdatedByNameSnapshot { get; init; }
}