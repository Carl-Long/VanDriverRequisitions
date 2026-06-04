namespace VanDriverRequisitions.Domain.Entities.FE.Models;

public sealed class FeRequisitionSnapshot
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

    public List<FeGeneralTaskSnapshot> GeneralTasks { get; init; } = [];
    public List<FeMileageSnapshot> Mileages { get; init; } = [];
    public List<FeTransferSnapshot> Transfers { get; init; } = [];
    public List<FeAdditionalCostSnapshot> AdditionalCosts { get; init; } = [];
}