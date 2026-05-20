using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Domain.Entities.FE;

public sealed class FeRequisition : AuditableEntity
{
    public required string RequisitionNumber { get; init; }
    public DateOnly RequisitionDate { get; set; }
    public Guid VanDriverId { get; set; }
    public required string VanDriverName { get; set; }
    public required string TradersName { get; set; }
    public required string VanDriverCode { get; set; }
    public Guid ShopId { get; set; }
    public required string ShopCode { get; set; }
    public required string ShopName { get; set; }
    public RequisitionStatus Status { get; set; }
    public Guid? SubmittedById { get; set; }
    public DateTime? SubmittedAtUtc { get; set; }
    public Guid? ProcessedById { get; set; }
    public DateTime? ProcessedAtUtc { get; set; }
    public Guid? RejectedById { get; set; }
    public DateTime? RejectedAtUtc { get; set; }
    public string? RejectionNotes { get; set; }
    public string? PoNumber { get; set; }
    public bool IsVatApplicable { get; set; }
    // Calculated and persisted for reporting/performance
    public decimal Subtotal { get; set; }

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