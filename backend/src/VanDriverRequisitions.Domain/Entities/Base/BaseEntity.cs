using System.ComponentModel.DataAnnotations;

namespace VanDriverRequisitions.Domain.Entities.Base;

public abstract class BaseEntity
{
    [Key] public Guid Id { get; init; } = Guid.CreateVersion7();
}