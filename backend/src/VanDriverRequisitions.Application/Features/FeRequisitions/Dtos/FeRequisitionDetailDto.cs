using VanDriverRequisitions.Application.Features.VanDrivers.Dtos;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

public sealed class FeRequisitionDetailDto
{
    public Guid Id { get; init; }
    public byte[] RowVersion { get; init; } = [];
    public required string RequisitionNumber { get; init; }
    public DateOnly RequisitionDate { get; init; }
    public required VanDriverLookupDto VanDriverSummary { get; init; }
    public Guid VanDriverId { get; init; }
    public string VanDriverName { get; init; } = string.Empty;
    public Guid ShopId { get; init; }
    public required string ShopCode { get; init; }
    public required string ShopName { get; init; }
    public string Status { get; init; } = string.Empty;
    public string? PoNumber { get; init; }
    public decimal Subtotal { get; init; }
    public required List<FeGeneralTaskDetailDto> FeGeneralTasks { get; init; }

    public bool IsEditable { get; init; }
}