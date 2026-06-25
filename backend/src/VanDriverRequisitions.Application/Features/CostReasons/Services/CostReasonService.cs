using System.Linq.Expressions;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Extensions;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.CostReasons.Dtos;
using VanDriverRequisitions.Application.Features.CostReasons.Mappings;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.CostReasons.Services;

public class CostReasonService(IApplicationDbContext context, IValidatorService validator) : ICostReasonService
{
    public async Task<List<CostReasonSummaryDto>> GetAllAsync(bool includeInactive, CancellationToken cancellationToken = default)
    {
        IQueryable<CostReason> query = context.CostReasons;

        if (includeInactive)
        {
            query = query.IgnoreQueryFilters();
        }

        return await query
            .AsNoTracking()
            .OrderBy(x => x.Code)
            .ThenBy(x => x.Reason)
            .Select(CostReasonProjections.AsSummaryDto)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<CostReasonLookupDto>> GetActiveLookupsAsync(Fascia fascia, CancellationToken cancellationToken = default)
    {
        return await context.CostReasons
            .AsNoTracking()
            .Where(x => x.IsActive)
            .Where(BuildScopePredicate(fascia))
            .OrderBy(x => x.Code)
            .ThenBy(x => x.Reason)
            .Select(CostReasonProjections.AsLookupDto)
            .ToListAsync(cancellationToken);
    }

    public async Task<CostReasonSummaryDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var costReason = await context.CostReasons
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Where(x => x.Id == id)
            .Select(CostReasonProjections.AsSummaryDto)
            .FirstOrDefaultAsync(cancellationToken);

        return costReason
            ?? throw new NotFoundException($"Cost Reason with ID '{id}' was not found.");
    }

    public async Task<CostReasonSummaryDto> CreateAsync(CreateCostReasonDto createCostReasonDto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(createCostReasonDto, cancellationToken);

        var newReason = new CostReason
        {
            Code = createCostReasonDto.Code.Trim(),
            Reason = createCostReasonDto.Reason.Trim(),
            Scope = createCostReasonDto.Scope,
            IsActive = true
        };

        context.CostReasons.Add(newReason);

        await context.SaveChangesWithUniqueConstraintValidationAsync("Code", $"This code '{createCostReasonDto.Code}' already exists.", cancellationToken);

        return CostReasonMapper.ToSummaryDto(newReason);
    }

    public async Task<CostReasonSummaryDto> UpdateAsync(Guid id, UpdateCostReasonDto updateCostReasonDto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(updateCostReasonDto, cancellationToken);

        var existingReason = await LoadForUpdateAsync(id, cancellationToken);

        existingReason.Code = updateCostReasonDto.Code.Trim();
        existingReason.Reason = updateCostReasonDto.Reason.Trim();
        existingReason.Scope = updateCostReasonDto.Scope;

        await context.SaveChangesWithUniqueConstraintValidationAsync("Code", $"This code '{updateCostReasonDto.Code}' already exists.", cancellationToken);

        return CostReasonMapper.ToSummaryDto(existingReason);
    }

    public async Task ActivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var existingReason = await LoadForUpdateAsync(id, cancellationToken);

        existingReason.IsActive = true;

        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeactivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var existingReason = await LoadForUpdateAsync(id, cancellationToken);

        existingReason.IsActive = false;

        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task<CostReason> LoadForUpdateAsync(Guid id, CancellationToken cancellationToken)
    {
        return await context.CostReasons
                   .IgnoreQueryFilters()
                   .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
               ?? throw new NotFoundException($"Cost Reason with ID '{id}' was not found.");
    }
    
    private static Expression<Func<CostReason, bool>> BuildScopePredicate(Fascia fascia)
    {
        return fascia switch
        {
            Fascia.Fe => x => x.IsActive && (x.Scope == CostReasonScope.Fe || x.Scope == CostReasonScope.Shared),
            Fascia.Std => x => x.IsActive && (x.Scope == CostReasonScope.Std || x.Scope == CostReasonScope.Shared),

            _ => throw new ValidationException(
            [
                new ValidationFailure(
                    nameof(Fascia),
                    $"Fascia '{fascia}' is not supported for cost reason lookups.")
            ])
        };
    }
}