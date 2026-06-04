using VanDriverRequisitions.Application.Common.Extensions;
using VanDriverRequisitions.Application.Features.RequisitionLimitRules.Dtos;
using VanDriverRequisitions.Domain.Entities.Common;

namespace VanDriverRequisitions.Application.Features.RequisitionLimitRules.Mappings;

public static class RequisitionLimitRuleMapper
{
    public static RequisitionLimitRuleSummaryDto ToSummaryDto(RequisitionLimitRule entity)
    {
        return new RequisitionLimitRuleSummaryDto
        {
            Id = entity.Id,
            CategoryId = (int)entity.Category,
            CategoryName = entity.Category.GetDisplayName(),
            FeTaskTypeId = entity.FeTaskTypeId,
            FeTaskTypeName = entity.FeTaskType?.Name,
            FasciaId = (int)entity.Fascia,
            FasciaName = entity.Fascia.GetDisplayName(),
            MaxQuantity = entity.MaxQuantity,
            MaxRate = entity.MaxRate,
            CreatedAtUtc = entity.CreatedAtUtc,
            CreatedByNameSnapshot = entity.CreatedByNameSnapshot,
            UpdatedAtUtc = entity.UpdatedAtUtc,
            UpdatedByNameSnapshot = entity.UpdatedByNameSnapshot,
        };
    }
}