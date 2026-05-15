using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Domain.Entities.FE;

public class FeAdditionalCost : AuditableEntity
{
    public Guid FeRequisitionId { get; set; }
    public DateOnly JobDate { get; set; } = DateOnly.FromDateTime(DateTime.Now);
    public int? Miles { get; set; }
    public decimal? RatePerMile { get; set; }
    public decimal? RatePerJob { get; set; }
    public int TotalNumber { get; set; }
    public decimal? TotalValue { get; set; }
    public Guid ReasonId { get; set; }
    public required FeReason FeReason { get; set; }
    public ChargingOption ChargingOption { get; set; }
}