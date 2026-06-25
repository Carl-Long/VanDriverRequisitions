using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Extensions;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.StdLocations.Dtos;
using VanDriverRequisitions.Application.Features.StdLocations.Extensions;
using VanDriverRequisitions.Application.Features.StdLocations.Mappings;

using VanDriverRequisitions.Domain.Entities.STD;

namespace VanDriverRequisitions.Application.Features.StdLocations.Services;

public sealed class StdLocationService(IApplicationDbContext context, IValidatorService validator) : IStdLocationService 
{
    public async Task<PagedResult<StdLocationSummaryDto>> GetAllAsync(StdLocationAdminQueryDto query, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(query, cancellationToken);

        var locations = context.StdLocations
            .IgnoreQueryFilters()
            .AsNoTracking()
            .ApplyAdminFilters(query);

        var totalCount = await locations.CountAsync(cancellationToken);

        var items = await locations
            .ApplyAdminOrdering()
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(StdLocationProjections.AsSummaryDto)
            .ToListAsync(cancellationToken);

        return new PagedResult<StdLocationSummaryDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    public async Task<StdLocationSummaryDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var location = await context.StdLocations
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(StdLocationProjections.AsSummaryDto)
            .FirstOrDefaultAsync(cancellationToken);

        return location ?? throw new NotFoundException($"STD Location with ID '{id}' was not found.");
    }

    public async Task<List<StdLocationLookupDto>> GetActiveLookupsAsync(StdLocationLookupQueryDto query, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(query, cancellationToken);

        return await context.StdLocations
            .AsNoTracking()
            .Where(x => x.IsActive)
            .Where(x => x.ShopId == query.ShopId)
            .Where(x => x.CollectionTypeId == query.CollectionTypeId)
            .OrderBy(x => x.LocationName)
            .ThenBy(x => x.PostCode)
            .Select(StdLocationProjections.AsLookupDto)
            .ToListAsync(cancellationToken);
    }

    public async Task<StdLocationSummaryDto> CreateAsync(CreateStdLocationDto createStdLocationDto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(createStdLocationDto, cancellationToken);

        await EnsureShopExistsAsync(createStdLocationDto.ShopId, cancellationToken);
        await EnsureCollectionTypeExistsAsync(createStdLocationDto.CollectionTypeId, cancellationToken);

        var location = StdLocation.Create(createStdLocationDto.ShopId, createStdLocationDto.CollectionTypeId, createStdLocationDto.LocationName, createStdLocationDto.PostCode);

        context.StdLocations.Add(location);

        await context.SaveChangesWithUniqueConstraintValidationAsync("LocationName", "A STD location already exists for this shop, collection type, location name and postcode.", cancellationToken);

        return await GetByIdAsync(location.Id, cancellationToken);
    }

    public async Task<StdLocationSummaryDto> UpdateAsync(Guid id, UpdateStdLocationDto updateStdLocationDto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(updateStdLocationDto, cancellationToken);

        await EnsureShopExistsAsync(updateStdLocationDto.ShopId, cancellationToken);
        await EnsureCollectionTypeExistsAsync(updateStdLocationDto.CollectionTypeId, cancellationToken);

        var location = await LoadForUpdateAsync(id, cancellationToken);

        location.UpdateDetails(updateStdLocationDto.ShopId, updateStdLocationDto.CollectionTypeId, updateStdLocationDto.LocationName, updateStdLocationDto.PostCode);

        await context.SaveChangesWithUniqueConstraintValidationAsync("LocationName", "A STD location already exists for this shop, collection type, location name and postcode.", cancellationToken);

        return await GetByIdAsync(location.Id, cancellationToken);
    }

    public async Task ActivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var location = await LoadForUpdateAsync(id, cancellationToken);
        location.Activate();
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeactivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var location = await LoadForUpdateAsync(id, cancellationToken);
        location.Deactivate();
        await context.SaveChangesAsync(cancellationToken);
    }
    
    private async Task<StdLocation> LoadForUpdateAsync(Guid id, CancellationToken cancellationToken)
    {
        return await context.StdLocations
                   .IgnoreQueryFilters()
                   .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
               ?? throw new NotFoundException($"STD Location with ID '{id}' was not found.");
    }

    private async Task EnsureShopExistsAsync(Guid shopId, CancellationToken cancellationToken)
    {
        var exists = await context.Shops
            .IgnoreQueryFilters()
            .AnyAsync(x => x.Id == shopId, cancellationToken);

        if (!exists)
        {
            throw new NotFoundException($"Shop with ID '{shopId}' was not found.");
        }
    }

    private async Task EnsureCollectionTypeExistsAsync(Guid collectionTypeId, CancellationToken cancellationToken)
    {
        var exists = await context.StdCollectionTypes
            .IgnoreQueryFilters()
            .AnyAsync(x => x.Id == collectionTypeId, cancellationToken);

        if (!exists)
        {
            throw new NotFoundException($"STD Collection Type with ID '{collectionTypeId}' was not found.");
        }
    }
}