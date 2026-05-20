using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.FeTaskTypes.Dtos;
using VanDriverRequisitions.Application.Features.FeTaskTypes.Mappings;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Application.Features.FeTaskTypes.Services;

public class FeTaskTypeService(IApplicationDbContext context, IValidatorService validator) : IFeTaskTypeService
{
    public async Task<List<FeTaskTypeDto>> GetAllAsync(bool includeInactive, CancellationToken cancellationToken = default)
    {
        IQueryable<FeTaskType> query = context.FeTaskTypes;

        if (includeInactive)
        {
            query = query.IgnoreQueryFilters();
        }

        return await query
            .Select(FeTaskTypeProjections.AsSummaryDto)
            .ToListAsync(cancellationToken);
    }

    public async Task<FeTaskTypeDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var feTaskType = await context.FeTaskTypes
            .Where(x => x.Id == id)
            .Select(FeTaskTypeProjections.AsSummaryDto)
            .FirstOrDefaultAsync(cancellationToken);

        return feTaskType ?? throw new NotFoundException(
            $"FE Task Type with ID '{id}' was not found.");
    }

    public async Task<FeTaskTypeDto> CreateAsync(CreateFeTaskTypeDto createFeTaskTypeDto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(createFeTaskTypeDto, cancellationToken);

        var codeExists = await context.FeTaskTypes
            .IgnoreQueryFilters()
            .AnyAsync(x => x.Code == createFeTaskTypeDto.Code.Trim(), cancellationToken);

        if (codeExists)
            throw new ConflictException($"A task type with code '{createFeTaskTypeDto.Code.Trim()}' already exists.");

        var newTaskType = new FeTaskType
        {
            Name = createFeTaskTypeDto.Name.Trim(),
            Code = createFeTaskTypeDto.Code.Trim(),
            DailyQuantityLimitId = createFeTaskTypeDto.DailyQuantityLimitId,
            RateLimitId = createFeTaskTypeDto.RateLimitId,
        };

        context.FeTaskTypes.Add(newTaskType);
        await context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(newTaskType.Id, cancellationToken);
    }

    public async Task<FeTaskTypeDto> UpdateAsync(Guid id, UpdateFeTaskTypeDto updateFeTaskTypeDto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(updateFeTaskTypeDto, cancellationToken);

        var existingTaskType = await context.FeTaskTypes
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (existingTaskType is null)
        {
            throw new NotFoundException(
                $"FE Task Type with ID '{id}' was not found.");
        }

        var codeExists = await context.FeTaskTypes
            .IgnoreQueryFilters()
            .AnyAsync(x => x.Code == updateFeTaskTypeDto.Code.Trim() && x.Id != id, cancellationToken);

        if (codeExists)
            throw new ConflictException($"A task type with code '{updateFeTaskTypeDto.Code.Trim()}' already exists.");

        existingTaskType.Name = updateFeTaskTypeDto.Name.Trim();
        existingTaskType.Code = updateFeTaskTypeDto.Code.Trim();
        existingTaskType.DailyQuantityLimitId = updateFeTaskTypeDto.DailyQuantityLimitId;
        existingTaskType.RateLimitId = updateFeTaskTypeDto.RateLimitId;

        await context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task ActivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var existingTaskType = await context.FeTaskTypes
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (existingTaskType is null)
        {
            throw new NotFoundException(
                $"FE Task Type with ID '{id}' was not found.");
        }

        existingTaskType.IsActive = true;
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeactivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var existingTaskType = await context.FeTaskTypes
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (existingTaskType is null)
        {
            throw new NotFoundException(
                $"FE Task Type with ID '{id}' was not found.");
        }

        existingTaskType.IsActive = false;
        await context.SaveChangesAsync(cancellationToken);
    }
}