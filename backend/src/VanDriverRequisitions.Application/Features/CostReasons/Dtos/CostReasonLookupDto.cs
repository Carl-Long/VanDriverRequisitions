namespace VanDriverRequisitions.Application.Features.CostReasons.Dtos;

public class CostReasonLookupDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Reason { get; init; } = string.Empty;
    
    public string DisplayName => $"{Code} - {Reason}";
}