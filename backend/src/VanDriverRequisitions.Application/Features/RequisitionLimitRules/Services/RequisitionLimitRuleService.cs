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
            .IgnoreQueryFilters()
            .AsNoTracking()
            .OrderBy(x => x.Category)
            .ThenBy(x => x.Fascia)
            .Select(RequisitionLimitRuleProjections.AsSummaryDto)
            .ToListAsync(cancellationToken);
    }

    public async Task<RequisitionLimitRuleSummaryDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var rule = await context.RequisitionLimitRules
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(RequisitionLimitRuleProjections.AsSummaryDto)
            .FirstOrDefaultAsync(cancellationToken);

        return rule ?? throw new NotFoundException($"Requisition Limit Rule with ID '{id}' was not found.");
    }

    public async Task<RequisitionLimitRuleSummaryDto> CreateAsync(CreateRequisitionLimitRuleDto createRequisitionLimitRuleDtodto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(createRequisitionLimitRuleDtodto, cancellationToken);
        await EnsureFeTaskTypeCanBeUsedAsync(createRequisitionLimitRuleDtodto.FeTaskTypeId, existingRule: null, cancellationToken);

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

        await EnsureFeTaskTypeCanBeUsedAsync(updateRequisitionLimitRuleDtodto.FeTaskTypeId, rule, cancellationToken);
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

    private async Task EnsureFeTaskTypeCanBeUsedAsync(Guid? feTaskTypeId, RequisitionLimitRule? existingRule, CancellationToken cancellationToken)
    {
        if (feTaskTypeId is null)
        {
            return;
        }

        var taskType = await context.FeTaskTypes
            .IgnoreQueryFilters()
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == feTaskTypeId.Value, cancellationToken);

        if (taskType is null)
        {
            throw new NotFoundException($"FE Task Type with ID '{feTaskTypeId}' was not found.");
        }

        var keepingExistingInactiveTaskType = existingRule?.FeTaskTypeId == feTaskTypeId;

        if (!taskType.IsActive && !keepingExistingInactiveTaskType)
        {
            throw new BadRequestException($"FE Task Type '{taskType.Code} - {taskType.Name}' is inactive and cannot be used for a new limit rule.");
        }
    }
}