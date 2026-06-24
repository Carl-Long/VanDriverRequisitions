using System.Linq.Expressions;
using VanDriverRequisitions.Application.Common.Extensions;
using VanDriverRequisitions.Application.Features.RequisitionLimitRules.Dtos;
using VanDriverRequisitions.Domain.Entities.Common;

namespace VanDriverRequisitions.Application.Features.RequisitionLimitRules.Mappings;

public static class RequisitionLimitRuleProjections
{
    public static Expression<Func<RequisitionLimitRule, RequisitionLimitRuleSummaryDto>> AsSummaryDto =>
        x => new RequisitionLimitRuleSummaryDto
        {
            Id = x.Id,
            Category = x.Category,
            CategoryName = x.Category.GetDisplayName(),
            FeTaskTypeId = x.FeTaskTypeId,
            FeTaskTypeName = x.FeTaskType != null ? x.FeTaskType.Name : null,
            IsFeTaskTypeActive = x.FeTaskType != null ? x.FeTaskType.IsActive : null,
            Fascia = x.Fascia,
            FasciaName = x.Fascia.GetDisplayName(),
            MaxQuantity = x.MaxQuantity,
            MaxRate = x.MaxRate,
            CreatedAtUtc = x.CreatedAtUtc,
            CreatedByNameSnapshot = x.CreatedByNameSnapshot,
            UpdatedAtUtc = x.UpdatedAtUtc,
            UpdatedByNameSnapshot = x.UpdatedByNameSnapshot
        };
}