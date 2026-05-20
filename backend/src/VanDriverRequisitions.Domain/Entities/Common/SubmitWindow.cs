using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Interfaces;

namespace VanDriverRequisitions.Domain.Entities.Common;

public class SubmitWindow : AuditableEntity, ISoftDeletable
{
    public DateTime OpenFrom { get; set; } = DateTime.UtcNow;
    public DateTime OpenTo { get; set; } = DateTime.UtcNow.AddDays(7);
    public DateTime? DeletedAtUtc { get; set; }
    public Guid? DeletedById { get; set; }
    public string? DeletedByNameSnapshot { get; set; }
}