using FluentValidation;
using FluentValidation.Results;
using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.StdCollectionTypes.Dtos;
using VanDriverRequisitions.Application.Features.StdCollectionTypes.Mappings;
using VanDriverRequisitions.Domain.Entities.STD;

namespace VanDriverRequisitions.Application.Features.StdCollectionTypes.Services;

public sealed class StdCollectionTypeService(IApplicationDbContext context, IValidatorService validator) : IStdCollectionTypeService
{
    public async Task<List<StdCollectionTypeSummaryDto>> GetAllAsync(bool includeInactive, CancellationToken cancellationToken = default)
    {
        IQueryable<StdCollectionType> query = context.StdCollectionTypes;

        if (includeInactive)
        {
            query = query.IgnoreQueryFilters();
        }

        return await query
            .AsNoTracking()
            .OrderBy(x => x.Code)
            .ThenBy(x => x.Name)
            .Select(StdCollectionTypeProjections.AsSummaryDto)
            .ToListAsync(cancellationToken);
    }

    public async Task<StdCollectionTypeSummaryDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var collectionType = await context.StdCollectionTypes
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(StdCollectionTypeProjections.AsSummaryDto)
            .FirstOrDefaultAsync(cancellationToken);

        return collectionType
            ?? throw new NotFoundException($"STD Collection Type with ID '{id}' was not found.");
    }

    public async Task<List<StdCollectionTypeLookupDto>> GetActiveLookupsAsync(CancellationToken cancellationToken = default)
    {
        return await context.StdCollectionTypes
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.Code)
            .ThenBy(x => x.Name)
            .Select(StdCollectionTypeProjections.AsLookupDto)
            .ToListAsync(cancellationToken);
    }

    public async Task<StdCollectionTypeSummaryDto> CreateAsync(CreateStdCollectionTypeDto createStdCollectionTypeDto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(createStdCollectionTypeDto, cancellationToken);

        var collectionType = new StdCollectionType
        {
            Code = createStdCollectionTypeDto.Code.Trim(),
            Name = createStdCollectionTypeDto.Name.Trim(),
            IsActive = true
        };

        context.StdCollectionTypes.Add(collectionType);

        await SaveWithUniqueConstraintHandlingAsync(createStdCollectionTypeDto.Code, cancellationToken);

        return StdCollectionTypeMapper.ToSummaryDto(collectionType);
    }

    public async Task<StdCollectionTypeSummaryDto> UpdateAsync(Guid id, UpdateStdCollectionTypeDto updateStdCollectionTypeDto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(updateStdCollectionTypeDto, cancellationToken);

        var collectionType = await LoadForUpdateAsync(id, cancellationToken);

        collectionType.Code = updateStdCollectionTypeDto.Code.Trim();
        collectionType.Name = updateStdCollectionTypeDto.Name.Trim();

        await SaveWithUniqueConstraintHandlingAsync(updateStdCollectionTypeDto.Code, cancellationToken);

        return StdCollectionTypeMapper.ToSummaryDto(collectionType);
    }

    public async Task ActivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var collectionType = await LoadForUpdateAsync(id, cancellationToken);

        collectionType.IsActive = true;

        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeactivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var collectionType = await LoadForUpdateAsync(id, cancellationToken);

        collectionType.IsActive = false;

        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task<StdCollectionType> LoadForUpdateAsync(Guid id, CancellationToken cancellationToken)
    {
        return await context.StdCollectionTypes
                   .IgnoreQueryFilters()
                   .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
               ?? throw new NotFoundException($"STD Collection Type with ID '{id}' was not found.");
    }

    private async Task SaveWithUniqueConstraintHandlingAsync(string code, CancellationToken cancellationToken)
    {
        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (DbExceptionHelper.IsUniqueConstraintViolation(ex))
        {
            throw new ValidationException(
            [
                new ValidationFailure("Code", $"This code '{code}' already exists.")
            ]);
        }
    }
}