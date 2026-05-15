namespace VanDriverRequisitions.Domain.Entities;

public abstract class AuditableEntity : BaseEntity
{
    // Created
    public Guid CreatedById { get; set; }
    public required string CreatedByNameSnapshot { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    
    // Updated
    public Guid? UpdatedById { get; set; }
    public string? UpdatedByNameSnapshot { get; set; }
    public DateTimeOffset? UpdatedAtUtc { get; set; }
    
    // Concurrency
    public byte[] RowVersion { get; set; } = [];
}