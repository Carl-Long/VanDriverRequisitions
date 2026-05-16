namespace VanDriverRequisitions.Domain.Entities.Common;

public class VanDriver : BaseEntity
{
    public required string Code { get; init; }
    public required string TradersName { get; init; }
    public required string Address1 { get; init; }
    public string? Address2 { get; init; }
    public string? Town { get; init; } 
    public string? County { get; init; } 
    public required string Postcode { get; init; }
    public string? Phone { get; init; }
    public bool IsActive { get; init; }
    public string? VatNumber { get; init; }
    public bool HasVat => !string.IsNullOrEmpty(VatNumber);
}