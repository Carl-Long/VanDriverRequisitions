namespace VanDriverRequisitions.Domain.Entities.Common;

public class VanDriver : BaseEntity
{
    public required string Code { get; set; }
    public required string TradersName { get; set; }
    public required string Address1 { get; set; }
    public string? Address2 { get; set; }
    public string? Town { get; set; } 
    public string? County { get; set; } 
    public required string Postcode { get; set; }
    public string? Phone { get; set; }
    public bool IsActive { get; set; }
    public string? VatNumber { get; set; }
    public bool HasVat => !string.IsNullOrEmpty(VatNumber);
}