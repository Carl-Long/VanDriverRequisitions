namespace VanDriverRequisitions.Domain.Entities.FE;

public class FeReason : AuditableEntity
{
    public required string Reason { get; init; }
}