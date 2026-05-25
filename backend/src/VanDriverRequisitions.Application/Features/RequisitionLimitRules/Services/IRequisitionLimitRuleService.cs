using VanDriverRequisitions.Application.Features.RequisitionLimitRules.Dtos;

namespace VanDriverRequisitions.Application.Features.RequisitionLimitRules.Services;

public interface IRequisitionLimitRuleService
{
    Task<List<RequisitionLimitRuleSummaryDto>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<RequisitionLimitRuleSummaryDto> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<RequisitionLimitRuleSummaryDto> CreateAsync(
        CreateRequisitionLimitRuleDto createRequisitionLimitRuleDto,
        CancellationToken cancellationToken = default);

    Task<RequisitionLimitRuleSummaryDto> UpdateAsync(Guid id,
        UpdateRequisitionLimitRuleDto updateRequisitionLimitRuleDto,
        CancellationToken cancellationToken = default);
}