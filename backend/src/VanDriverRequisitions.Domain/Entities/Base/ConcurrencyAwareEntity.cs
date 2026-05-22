namespace VanDriverRequisitions.Domain.Entities.Base;

public abstract class ConcurrencyAwareEntity : AuditableEntity
{
    public byte[] RowVersion { get; set; } = [];
}