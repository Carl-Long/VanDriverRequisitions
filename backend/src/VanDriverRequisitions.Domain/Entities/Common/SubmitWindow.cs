namespace VanDriverRequisitions.Domain.Entities.Common;

public class SubmitWindow : AuditableEntity
{
    public DateTimeOffset OpenFrom { get; set; } = DateTimeOffset.Now;
    public DateTimeOffset OpenTo { get; set; } = DateTimeOffset.Now.AddDays(7);
}