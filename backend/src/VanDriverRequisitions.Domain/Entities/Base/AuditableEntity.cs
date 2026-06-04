namespace VanDriverRequisitions.Domain.Entities.Base;

public abstract class AuditableEntity : BaseEntity
{
    public Guid CreatedById { get; set; }
    public string CreatedByNameSnapshot { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public Guid? UpdatedById { get; set; }
    public string? UpdatedByNameSnapshot { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
}