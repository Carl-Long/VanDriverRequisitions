namespace VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

public class FeRequisitionQueryDto
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? RequisitionNumber { get; init; }
    public string? Status { get; init; }
    public Guid? ShopId { get; init; }
    public bool CreatedByMe { get; init; }
}
