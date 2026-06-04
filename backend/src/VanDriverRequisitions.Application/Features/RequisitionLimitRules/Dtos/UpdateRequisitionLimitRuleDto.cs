using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.RequisitionLimitRules.Dtos;

public class UpdateRequisitionLimitRuleDto
{
    public RequisitionRowCategory Category { get; init; }
    public Guid? FeTaskTypeId { get; init; }
    public Fascia Fascia { get; init; }
    public int MaxQuantity { get; init; }
    public decimal MaxRate { get; init; }
}