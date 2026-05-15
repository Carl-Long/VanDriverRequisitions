using System.ComponentModel.DataAnnotations;

namespace VanDriverRequisitions.Domain.Entities;

public abstract class BaseEntity
{
    [Key] public Guid Id { get; init; } = Guid.CreateVersion7();
}