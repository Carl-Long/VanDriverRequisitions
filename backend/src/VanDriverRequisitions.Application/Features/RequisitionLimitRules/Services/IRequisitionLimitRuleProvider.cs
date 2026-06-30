using VanDriverRequisitions.Domain.Entities.Common;

namespace VanDriverRequisitions.Application.Features.RequisitionLimitRules.Services;

public interface IRequisitionLimitRuleProvider
{
    Task<IReadOnlyList<RequisitionLimitRule>> GetFeLimitRulesAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<RequisitionLimitRule>> GetStdLimitRulesAsync(CancellationToken cancellationToken);
}