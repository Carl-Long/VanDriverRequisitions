using FluentValidation;
using FluentValidation.Results;
using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.FeTaskTypes.Dtos;
using VanDriverRequisitions.Application.Features.FeTaskTypes.Mappings;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Application.Features.FeTaskTypes.Services;

public class FeTaskTypeService(IApplicationDbContext context, IValidatorService validator) : IFeTaskTypeService
{
    public async Task<List<FeTaskTypeSummaryDto>> GetAllAsync(bool includeInactive, CancellationToken cancellationToken = default)
    {
        IQueryable<FeTaskType> query = context.FeTaskTypes;

        if (includeInactive)
        {
            query = query.IgnoreQueryFilters();
        }

        return await query
            .AsNoTracking()
            .Select(FeTaskTypeProjections.AsSummaryDto)
            .ToListAsync(cancellationToken);
    }

    public async Task<FeTaskTypeSummaryDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var feTaskType = await context.FeTaskTypes
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(FeTaskTypeProjections.AsSummaryDto)
            .FirstOrDefaultAsync(cancellationToken);

        return feTaskType ?? throw new NotFoundException($"FE Task Type with ID '{id}' was not found.");
    }

    public async Task<FeTaskTypeSummaryDto> CreateAsync(CreateFeTaskTypeDto createFeTaskTypeDto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(createFeTaskTypeDto, cancellationToken);

        var newTaskType = new FeTaskType
        {
            Name = createFeTaskTypeDto.Name.Trim(),
            Code = createFeTaskTypeDto.Code.Trim()
        };

        context.FeTaskTypes.Add(newTaskType);

        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (DbExceptionHelper.IsUniqueConstraintViolation(ex))
        {
            throw new ValidationException([new ValidationFailure("Code", $"This code '{createFeTaskTypeDto.Code}' already exists.")]);
        }
        
        return FeTaskTypeMapper.ToSummaryDto(newTaskType);
    }

    public async Task<FeTaskTypeSummaryDto> UpdateAsync(Guid id, UpdateFeTaskTypeDto updateFeTaskTypeDto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(updateFeTaskTypeDto, cancellationToken);

        var existingTaskType = await context.FeTaskTypes
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (existingTaskType is null)
            throw new NotFoundException($"FE Task Type with ID '{id}' was not found.");

        existingTaskType.Name = updateFeTaskTypeDto.Name.Trim();
        existingTaskType.Code = updateFeTaskTypeDto.Code.Trim();

        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (DbExceptionHelper.IsUniqueConstraintViolation(ex))
        {
            throw new ValidationException([new("Code", $"This code '{updateFeTaskTypeDto.Code}' already exists.")]);
        }

        return FeTaskTypeMapper.ToSummaryDto(existingTaskType);
    }

    public async Task ActivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var existingTaskType = await context.FeTaskTypes
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (existingTaskType is null)
            throw new NotFoundException($"FE Task Type with ID '{id}' was not found.");

        existingTaskType.IsActive = true;
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeactivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var existingTaskType = await context.FeTaskTypes
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (existingTaskType is null)
            throw new NotFoundException($"FE Task Type with ID '{id}' was not found.");

        existingTaskType.IsActive = false;
        await context.SaveChangesAsync(cancellationToken);
    }
}