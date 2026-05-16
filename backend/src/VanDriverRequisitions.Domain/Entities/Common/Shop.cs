namespace VanDriverRequisitions.Domain.Entities.Common;

public class Shop : BaseEntity
{
    public required string Code {get; init; } 
    public required string Name { get; init; } 
    public required string Address { get; init; }
    public string? Address2 { get; init; }
    public string? Town { get; init; } 
    public string? County { get; init; } 
    public required string Postcode { get; init; }
    public string? Phone { get; init; }
    public bool IsActive { get; init; }
}