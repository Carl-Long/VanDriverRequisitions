namespace VanDriverRequisitions.Application.Features.VanDrivers.Dtos;

public class VanDriverLookupDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string TradersName { get; init; } = string.Empty;
    public string Address1 { get; init; } = string.Empty;
    public string? Address2 { get; init; }
    public string? Town { get; init; }
    public string? County { get; init; }
    public string Postcode { get; init; } = string.Empty;
    public string? Phone { get; init; }
    public string? VatNumber { get; init; }
    public bool HasVat { get; init; }
    public bool IsActive { get; init; }
}
