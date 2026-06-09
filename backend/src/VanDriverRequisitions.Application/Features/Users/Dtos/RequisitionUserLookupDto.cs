namespace VanDriverRequisitions.Application.Features.Users.Dtos;

public sealed class RequisitionUserLookupDto
{
    public Guid Id { get; init; } 
    public string Name { get; init; } = string.Empty;
}