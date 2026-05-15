namespace VanDriverRequisitions.Domain.Entities.Common;

public class SubmitWindow : AuditableEntity
{
    public DateTime OpenFrom { get; init; } = DateTime.UtcNow;
    public DateTime OpenTo { get; init; } = DateTime.UtcNow.AddDays(7);
}