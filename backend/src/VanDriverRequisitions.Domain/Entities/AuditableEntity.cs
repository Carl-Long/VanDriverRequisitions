namespace VanDriverRequisitions.Domain.Entities;

public abstract class AuditableEntity : BaseEntity
{
    public Guid CreatedById { get; set; }
    public required string CreatedByNameSnapshot { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public Guid? UpdatedById { get; set; }
    public string? UpdatedByNameSnapshot { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
    public byte[] RowVersion { get; set; } = [];
}