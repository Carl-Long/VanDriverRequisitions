using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.CostReasons.Dtos;

public class CreateCostReasonDto
{
    public string Code { get; init; } = string.Empty;
    public string Reason { get; init; } = string.Empty;
    public CostReasonScope Scope { get; init; }
}