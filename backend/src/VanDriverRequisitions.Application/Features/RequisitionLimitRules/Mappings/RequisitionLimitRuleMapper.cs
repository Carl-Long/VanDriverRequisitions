using VanDriverRequisitions.Application.Features.RequisitionLimitRules.Dtos;
using VanDriverRequisitions.Domain.Entities.Common;

namespace VanDriverRequisitions.Application.Features.RequisitionLimitRules.Mappings;

public static class RequisitionLimitRuleMapper
{
    public static RequisitionLimitRuleSummaryDto ToSummaryDto(RequisitionLimitRule entity)
    {
        return new RequisitionLimitRuleSummaryDto()
        {
            Id = entity.Id,
            Category = entity.Category,
            FeTaskTypeId = entity.FeTaskTypeId,
            FeTaskTypeName = entity.FeTaskType?.Name,
            Fascia = entity.Fascia,
            MaxQuantity = entity.MaxQuantity,
            MaxRate = entity.MaxRate,
            CreatedAtUtc = entity.CreatedAtUtc,
            CreatedByNameSnapshot = entity.CreatedByNameSnapshot,
            UpdatedAtUtc = entity.UpdatedAtUtc,
            UpdatedByNameSnapshot = entity.UpdatedByNameSnapshot,
        };
    }
}