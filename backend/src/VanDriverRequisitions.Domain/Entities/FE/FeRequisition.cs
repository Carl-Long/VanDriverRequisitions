using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Domain.Entities.FE;

public class FeRequisition : AuditableEntity
{
    public required string RequisitionNumber { get; set; }
    public DateOnly RequisitionDate { get; set; }
    public Guid VanDriverId { get; set; }
    public virtual required VanDriver VanDriver { get; set; }
    public required string VanDriverName { get; set; }
    public Guid ShopId { get; set; }
    public required Shop Shop { get; set; } 
    public RequisitionStatus Status { get; set; }
    public Guid? SubmittedById { get; set; }
    public DateTimeOffset? SubmittedAtUtc { get; set; }
    public Guid? ProcessedById { get; set; }
    public DateTimeOffset? ProcessedAtUtc { get; set; }
    public Guid? RejectedById { get; set; }
    public DateTimeOffset? RejectedAtUtc { get; set; }
    public decimal Subtotal { get; set; }
    public string? RejectionNotes { get; set; }
    public string? PoNumber { get; set; }
    public bool IsVatApplicable { get; set; }
    
    public virtual ICollection<FeGeneralTask> FeGeneralTasks { get; set; } = [];
    public virtual ICollection<FeMileage> FeMileages { get; set; } = [];
    public virtual ICollection<FeTransfer> FeTransfers { get; set; } = [];
    public virtual ICollection<FeAdditionalCost> FeAdditionalCosts { get; set; } = [];
}