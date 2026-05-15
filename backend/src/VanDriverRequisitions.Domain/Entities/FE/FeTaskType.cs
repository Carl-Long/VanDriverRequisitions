namespace VanDriverRequisitions.Domain.Entities.FE;

public class FeTaskType : AuditableEntity
{
    public required string Name { get; init; }
    public required string Code { get; init; }
}