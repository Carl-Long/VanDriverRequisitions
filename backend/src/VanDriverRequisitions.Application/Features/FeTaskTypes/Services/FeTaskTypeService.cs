using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.FeTaskTypes.Dtos;
using VanDriverRequisitions.Application.Features.FeTaskTypes.Mappings;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Application.Features.FeTaskTypes.Services;

public class FeTaskTypeService(
    IApplicationDbContext context,
    IValidatorService validator) : IFeTaskTypeService
{
    public async Task<List<FeTaskTypeDto>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await context.FeTaskTypes
            .Select(FeTaskTypeProjections.AsDto)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<FeTaskTypeDto>> GetAllIncludingInactiveAsync(
        CancellationToken cancellationToken = default)
    {
        return await context.FeTaskTypes
            .IgnoreQueryFilters()
            .Select(FeTaskTypeProjections.AsDto)
            .ToListAsync(cancellationToken);
    }

    public async Task<FeTaskTypeDto> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var dto = await context.FeTaskTypes
            .Where(x => x.Id == id)
            .Select(FeTaskTypeProjections.AsDto)
            .FirstOrDefaultAsync(cancellationToken);

        return dto ?? throw new NotFoundException(
            $"FE Task Type with ID '{id}' was not found.");
    }

    public async Task<FeTaskTypeDto> CreateAsync(
        CreateFeTaskTypeDto dto,
        CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(dto, cancellationToken);

        var entity = new FeTaskType
        {
            Name = dto.Name,
            Code = dto.Code
        };

        context.FeTaskTypes.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return FeTaskTypeMapper.ToDto(entity);
    }

    public async Task<FeTaskTypeDto> UpdateAsync(
        Guid id,
        UpdateFeTaskTypeDto dto,
        CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(dto, cancellationToken);

        var entity = await context.FeTaskTypes
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(
                $"FE Task Type with ID '{id}' was not found.");
        }

        entity.Name = dto.Name;
        entity.Code = dto.Code;

        await context.SaveChangesAsync(cancellationToken);

        return FeTaskTypeMapper.ToDto(entity);
    }

    public async Task ActivateAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.FeTaskTypes
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(
                $"FE Task Type with ID '{id}' was not found.");
        }

        entity.IsActive = true;
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeactivateAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.FeTaskTypes
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(
                $"FE Task Type with ID '{id}' was not found.");
        }

        entity.IsActive = false;
        await context.SaveChangesAsync(cancellationToken);
    }
}