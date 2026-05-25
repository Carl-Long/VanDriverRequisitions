using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.RequisitionLimitRules.Dtos;

public class RequisitionLimitRuleSummaryDto
{
    public Guid Id { get; init; }
    public RequisitionRowCategory Category { get; init; }
    public Guid? FeTaskTypeId { get; init; }
    public string? FeTaskTypeName { get; init; }
    public Fascia Fascia { get; init; }
    public int MaxQuantity { get; init; }
    public decimal MaxRate { get; init; }
    public DateTime CreatedAtUtc { get; init; }
    public string CreatedByNameSnapshot { get; init; } = string.Empty;
    public DateTime? UpdatedAtUtc { get; init; }
    public string? UpdatedByNameSnapshot { get; init; }
}