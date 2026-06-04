using FluentValidation;
using FluentValidation.Results;
using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.RequisitionLimitRules.Dtos;
using VanDriverRequisitions.Application.Features.RequisitionLimitRules.Mappings;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.RequisitionLimitRules.Services;

public class RequisitionLimitRuleService(
    IApplicationDbContext context,
    IValidatorService validator) : IRequisitionLimitRuleService
{
    public async Task<List<RequisitionLimitRuleSummaryDto>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var requisitionLimitRules = await context.RequisitionLimitRules
            .AsNoTracking()
            .Include(x => x.FeTaskType)
            .OrderBy(x => x.Category)
            .ToListAsync(cancellationToken);

        return requisitionLimitRules
            .Select(RequisitionLimitRuleMapper.ToSummaryDto)
            .ToList();
    }

    public async Task<RequisitionLimitRuleSummaryDto> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var requisitionLimitRule = await context.RequisitionLimitRules
            .AsNoTracking()
            .Include(x => x.FeTaskType)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (requisitionLimitRule is null)
            throw new NotFoundException(
                $"Requisition Limit Rule with ID '{id}' was not found.");

        return RequisitionLimitRuleMapper.ToSummaryDto(requisitionLimitRule);
    }

    public async Task<RequisitionLimitRuleSummaryDto> CreateAsync(
        CreateRequisitionLimitRuleDto createRequisitionLimitRuleDto,
        CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(createRequisitionLimitRuleDto, cancellationToken);

        EnforceBusinessRules(createRequisitionLimitRuleDto.Category, createRequisitionLimitRuleDto.FeTaskTypeId);

        var newRequisitionLimitRule = new RequisitionLimitRule
        {
            Category = createRequisitionLimitRuleDto.Category,
            FeTaskTypeId = createRequisitionLimitRuleDto.FeTaskTypeId,
            Fascia = createRequisitionLimitRuleDto.Fascia,
            MaxQuantity = createRequisitionLimitRuleDto.MaxQuantity,
            MaxRate = createRequisitionLimitRuleDto.MaxRate
        };

        context.RequisitionLimitRules.Add(newRequisitionLimitRule);

        await context.SaveChangesAsync(cancellationToken);

        return RequisitionLimitRuleMapper.ToSummaryDto(newRequisitionLimitRule);
    }

    public async Task<RequisitionLimitRuleSummaryDto> UpdateAsync(
        Guid id,
        UpdateRequisitionLimitRuleDto updateRequisitionLimitRuleDto,
        CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(updateRequisitionLimitRuleDto, cancellationToken);

        var existingRequisitionLimitRule = await context.RequisitionLimitRules
            .IgnoreQueryFilters()
            .Include(x => x.FeTaskType)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (existingRequisitionLimitRule is null)
            throw new NotFoundException($"Requisition Limit Rule with ID '{id}' was not found.");

        EnforceBusinessRules(updateRequisitionLimitRuleDto.Category, updateRequisitionLimitRuleDto.FeTaskTypeId);

        existingRequisitionLimitRule.Category = updateRequisitionLimitRuleDto.Category;
        existingRequisitionLimitRule.FeTaskTypeId = updateRequisitionLimitRuleDto.FeTaskTypeId;
        existingRequisitionLimitRule.Fascia = updateRequisitionLimitRuleDto.Fascia;
        existingRequisitionLimitRule.MaxQuantity = updateRequisitionLimitRuleDto.MaxQuantity;
        existingRequisitionLimitRule.MaxRate = updateRequisitionLimitRuleDto.MaxRate;

        await context.SaveChangesAsync(cancellationToken);

        return RequisitionLimitRuleMapper.ToSummaryDto(existingRequisitionLimitRule);
    }

    private static void EnforceBusinessRules(
        RequisitionRowCategory category,
        Guid? feTaskTypeId)
    {
        if (category == RequisitionRowCategory.GeneralTask && feTaskTypeId is null)
        {
            throw new ValidationException([
                new ValidationFailure(
                    nameof(feTaskTypeId),
                    "FeTaskTypeId is required when Category is GeneralTask.")
            ]);
        }

        if (category != RequisitionRowCategory.GeneralTask && feTaskTypeId is not null)
        {
            throw new ValidationException([
                new ValidationFailure(
                    nameof(feTaskTypeId),
                    "FeTaskTypeId must be null unless Category is GeneralTask.")
            ]);
        }
    }
}