namespace VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

public class FeRequisitionDetailDto
{
    public Guid Id { get; init; }
    public string RequisitionNumber { get; init; } = string.Empty;
    public DateOnly RequisitionDate { get; init; }
    public Guid VanDriverId { get; init; }
    public string VanDriverCode { get; init; } = string.Empty;
    public string VanDriverName { get; init; } = string.Empty;
    public string TradersName { get; init; } = string.Empty;
    public Guid ShopId { get; init; }
    public string ShopCode { get; init; } = string.Empty;
    public string ShopName { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public bool IsVatApplicable { get; init; }
    public string? PoNumber { get; init; }
    public string? RejectionNotes { get; init; }
    public decimal Subtotal { get; init; }
    public bool IsEditable { get; init; }

    public IReadOnlyList<FeGeneralTaskDto> FeGeneralTasks { get; init; } = [];
    public IReadOnlyList<FeMileageDto> FeMileages { get; init; } = [];
    public IReadOnlyList<FeTransferDto> FeTransfers { get; init; } = [];
    public IReadOnlyList<FeAdditionalCostDto> FeAdditionalCosts { get; init; } = [];
}
