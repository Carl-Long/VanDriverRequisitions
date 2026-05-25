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
    public async Task<List<RequisitionLimitRuleSummaryDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await context.RequisitionLimitRules
            .AsNoTracking()
            .OrderBy(x => x.Category)
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

    public async Task<RequisitionLimitRuleSummaryDto> CreateAsync(
        CreateRequisitionLimitRuleDto createRequisitionLimitRuleDto,
        CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(createRequisitionLimitRuleDto, cancellationToken);

        EnforceBusinessRules(createRequisitionLimitRuleDto.Category, createRequisitionLimitRuleDto.FeTaskTypeId);

        var entity = new RequisitionLimitRule
        {
            Category = createRequisitionLimitRuleDto.Category,
            FeTaskTypeId = createRequisitionLimitRuleDto.FeTaskTypeId,
            Fascia = createRequisitionLimitRuleDto.Fascia,
            MaxQuantity = createRequisitionLimitRuleDto.MaxQuantity,
            MaxRate = createRequisitionLimitRuleDto.MaxRate
        };

        context.RequisitionLimitRules.Add(entity);

        await context.SaveChangesAsync(cancellationToken);

        return RequisitionLimitRuleMapper.ToSummaryDto(entity);
    }

    public async Task<RequisitionLimitRuleSummaryDto> UpdateAsync(
        Guid id,
        UpdateRequisitionLimitRuleDto updateRequisitionLimitRuleDto,
        CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(updateRequisitionLimitRuleDto, cancellationToken);

        var entity = await context.RequisitionLimitRules
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException($"Requisition Limit Rule with ID '{id}' was not found.");

        EnforceBusinessRules(updateRequisitionLimitRuleDto.Category, updateRequisitionLimitRuleDto.FeTaskTypeId);

        entity.Category = updateRequisitionLimitRuleDto.Category;
        entity.FeTaskTypeId = updateRequisitionLimitRuleDto.FeTaskTypeId;
        entity.Fascia = updateRequisitionLimitRuleDto.Fascia;
        entity.MaxQuantity = updateRequisitionLimitRuleDto.MaxQuantity;
        entity.MaxRate = updateRequisitionLimitRuleDto.MaxRate;

        await context.SaveChangesAsync(cancellationToken);

        return RequisitionLimitRuleMapper.ToSummaryDto(entity);
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