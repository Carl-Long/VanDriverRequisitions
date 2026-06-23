using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.Users.Dtos;

public class RequisitionUserSearchQueryDto
{
    public string? Search { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public Fascia Fascia { get; set; } = Fascia.Fe;
}