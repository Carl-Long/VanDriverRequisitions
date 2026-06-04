using VanDriverRequisitions.Domain.Interfaces;

namespace VanDriverRequisitions.Domain.Entities.Base;

public abstract class LookupEntity : AuditableEntity, IActivatable
{
    public bool IsActive { get; set; } = true;
}