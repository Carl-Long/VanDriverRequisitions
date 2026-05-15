namespace VanDriverRequisitions.Domain.Entities.Common;

public class Shop : BaseEntity
{
    public required string Code {get; set; } 
    public required string Name { get; set; } 
    public required string Address { get; set; }
    public string? Address2 { get; set; }
    public string? Town { get; set; } 
    public string? County { get; set; } 
    public required string Postcode { get; set; }
    public string? Phone { get; set; }
    public bool IsActive { get; set; }
}