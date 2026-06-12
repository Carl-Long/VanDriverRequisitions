namespace VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

public sealed class FeRequisitionSnapshotDto
{
    public string RequisitionNumber { get; init; } = string.Empty;
    public DateOnly RequisitionDate { get; init; }
    public string VanDriverCode { get; init; } = string.Empty;
    public string VanDriverName { get; init; } = string.Empty;
    public string TradersName { get; init; } = string.Empty;
    public string ShopCode { get; init; } = string.Empty;
    public string ShopName { get; init; } = string.Empty;
    public bool IsVatApplicable { get; init; }
    public decimal Subtotal { get; init; }
    public List<FeGeneralTaskSnapshotDto> GeneralTasks { get; init; } = [];
    public List<FeMileageSnapshotDto> Mileages { get; init; } = [];
    public List<FeTransferSnapshotDto> Transfers { get; init; } = [];
    public List<FeAdditionalCostSnapshotDto> AdditionalCosts { get; init; } = [];
}