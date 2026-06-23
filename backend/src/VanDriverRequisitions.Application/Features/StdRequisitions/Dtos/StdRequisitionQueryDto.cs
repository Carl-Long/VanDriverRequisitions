using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;

public sealed class StdRequisitionQueryDto
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? RequisitionNumber { get; init; }
    public RequisitionStatus? Status { get; init; }
    public Guid? ShopId { get; init; }
    public Guid? CreatedByUserId { get; init; }
}