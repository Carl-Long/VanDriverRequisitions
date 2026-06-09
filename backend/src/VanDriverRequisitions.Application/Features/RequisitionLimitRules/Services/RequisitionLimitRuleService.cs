using FluentValidation;
using FluentValidation.Results;
using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.RequisitionLimitRules.Dtos;
using VanDriverRequisitions.Application.Features.RequisitionLimitRules.Mappings;
using VanDriverRequisitions.Domain.Entities.Common;

namespace VanDriverRequisitions.Application.Features.RequisitionLimitRules.Services;

public class RequisitionLimitRuleService(IApplicationDbContext context, IValidatorService validator) : IRequisitionLimitRuleService
{
    public async Task<List<RequisitionLimitRuleSummaryDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await context.RequisitionLimitRules
            .AsNoTracking()
            .OrderBy(x => x.Category)
            .ThenBy(x => x.Fascia)
            .Select(RequisitionLimitRuleProjections.AsSummaryDto)
            .ToListAsync(cancellationToken);
    }

    public async Task<RequisitionLimitRuleSummaryDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var rule = await context.RequisitionLimitRules
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(RequisitionLimitRuleProjections.AsSummaryDto)
            .FirstOrDefaultAsync(cancellationToken);

        return rule ?? throw new NotFoundException($"Requisition Limit Rule with ID '{id}' was not found.");
    }

    public async Task<RequisitionLimitRuleSummaryDto> CreateAsync(CreateRequisitionLimitRuleDto createRequisitionLimitRuleDtodto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(createRequisitionLimitRuleDtodto, cancellationToken);

        var details = RequisitionLimitRuleMapper.MapCreateDtoToDetails(createRequisitionLimitRuleDtodto);
        var rule = RequisitionLimitRule.Create(details);

        context.RequisitionLimitRules.Add(rule);

        await SaveWithUniqueConstraintHandlingAsync(cancellationToken);

        return await GetByIdAsync(rule.Id, cancellationToken);
    }

    public async Task<RequisitionLimitRuleSummaryDto> UpdateAsync(Guid id, UpdateRequisitionLimitRuleDto updateRequisitionLimitRuleDtodto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(updateRequisitionLimitRuleDtodto, cancellationToken);

        var rule = await LoadForUpdateAsync(id, cancellationToken);
        var details = RequisitionLimitRuleMapper.MapUpdateDtoToDetails(updateRequisitionLimitRuleDtodto);

        rule.Update(details);

        await SaveWithUniqueConstraintHandlingAsync(cancellationToken);

        return await GetByIdAsync(rule.Id, cancellationToken);
    }
    
    private async Task<RequisitionLimitRule> LoadForUpdateAsync(Guid id, CancellationToken cancellationToken)
    {
        return await context.RequisitionLimitRules.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
               ?? throw new NotFoundException($"Requisition Limit Rule with ID '{id}' was not found.");
    }
    
    private async Task SaveWithUniqueConstraintHandlingAsync(CancellationToken cancellationToken)
    {
        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (DbExceptionHelper.IsUniqueConstraintViolation(ex))
        {
            throw new ValidationException(
            [
                new ValidationFailure(
                    "Form",
                    "A limit rule already exists for this category, task type, and fascia combination.")
            ]);
        }
    }
}