using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Domain.Entities.FE;

public sealed class FeRequisition : AuditableEntity
{
    public required string RequisitionNumber { get; init; }
    public DateOnly RequisitionDate { get; init; }
    public Guid VanDriverId { get; init; }
    public required string VanDriverName { get; init; }
    public required string TradersName { get; init; }
    public required string VanDriverCode { get; init; }
    public Guid ShopId { get; init; }
    public required string ShopCode { get; init; }
    public required string ShopName { get; init; }
    public RequisitionStatus Status { get; init; }
    public Guid? SubmittedById { get; init; }
    public DateTime? SubmittedAtUtc { get; init; }
    public Guid? ProcessedById { get; init; }
    public DateTime? ProcessedAtUtc { get; init; }
    public Guid? RejectedById { get; init; }
    public DateTime? RejectedAtUtc { get; init; }
    public string? RejectionNotes { get; init; }
    public string? PoNumber { get; init; }
    public bool IsVatApplicable { get; init; }
    // Calculated and persisted for reporting/performance
    public decimal Subtotal { get; init; }
    
    public ICollection<FeGeneralTask> FeGeneralTasks { get; init; } = [];
    public ICollection<FeMileage> FeMileages { get; init; } = [];
    public ICollection<FeTransfer> FeTransfers { get; init; } = [];
    public ICollection<FeAdditionalCost> FeAdditionalCosts { get; init; } = [];
    
    public decimal CalculateSubtotal()
    {
        var generalTasksTotal = FeGeneralTasks.Sum(x => x.TotalValue ?? 0);
        var mileageTotal = FeMileages.Sum(x => x.TotalValue ?? 0);
        var transfersTotal = FeTransfers.Sum(x => x.TotalValue ?? 0);
        var additionalCostsTotal = FeAdditionalCosts.Sum(x => x.TotalValue ?? 0);
        
        return generalTasksTotal + mileageTotal + transfersTotal + additionalCostsTotal;
    }
}