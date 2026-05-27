namespace VanDriverRequisitions.Application.Features.Users.Dtos;

public class RequisitionUserLookupDto
{
    public Guid Id { get; set; } 
    public string Name { get; init; } = string.Empty;
}