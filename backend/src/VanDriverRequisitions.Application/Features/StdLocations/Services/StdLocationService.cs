using FluentValidation;
using FluentValidation.Results;
using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.StdLocations.Dtos;
using VanDriverRequisitions.Application.Features.StdLocations.Mappings;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.STD;

namespace VanDriverRequisitions.Application.Features.StdLocations.Services;

public sealed class StdLocationService(IApplicationDbContext context, IValidatorService validator) : IStdLocationService
{
    public async Task<PagedResult<StdLocationSummaryDto>> GetAllAsync(StdLocationAdminQueryDto query, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(query, cancellationToken);

        var filteredQuery = BuildAdminQuery(query);

        var totalCount = await filteredQuery.CountAsync(cancellationToken);

        var items = await filteredQuery
            .OrderBy(x => x.Shop.Code)
            .ThenBy(x => x.CollectionType.Code)
            .ThenBy(x => x.Location.LocationName)
            .ThenBy(x => x.Location.PostCode)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(x => new StdLocationSummaryDto
            {
                Id = x.Location.Id,

                ShopId = x.Shop.Id,
                ShopCode = x.Shop.Code,
                ShopName = x.Shop.Name,

                CollectionTypeId = x.CollectionType.Id,
                CollectionTypeCode = x.CollectionType.Code,
                CollectionTypeName = x.CollectionType.Name,

                LocationName = x.Location.LocationName,
                PostCode = x.Location.PostCode,

                IsActive = x.Location.IsActive,

                CreatedAtUtc = x.Location.CreatedAtUtc,
                CreatedByNameSnapshot = x.Location.CreatedByNameSnapshot,
                UpdatedAtUtc = x.Location.UpdatedAtUtc,
                UpdatedByNameSnapshot = x.Location.UpdatedByNameSnapshot
            })
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
        var result = await BuildJoinedQuery(includeInactive: true)
            .Where(x => x.Location.Id == id)
            .Select(x => new StdLocationSummaryDto
            {
                Id = x.Location.Id,

                ShopId = x.Shop.Id,
                ShopCode = x.Shop.Code,
                ShopName = x.Shop.Name,

                CollectionTypeId = x.CollectionType.Id,
                CollectionTypeCode = x.CollectionType.Code,
                CollectionTypeName = x.CollectionType.Name,

                LocationName = x.Location.LocationName,
                PostCode = x.Location.PostCode,

                IsActive = x.Location.IsActive,

                CreatedAtUtc = x.Location.CreatedAtUtc,
                CreatedByNameSnapshot = x.Location.CreatedByNameSnapshot,
                UpdatedAtUtc = x.Location.UpdatedAtUtc,
                UpdatedByNameSnapshot = x.Location.UpdatedByNameSnapshot
            })
            .FirstOrDefaultAsync(cancellationToken);

        return result
            ?? throw new NotFoundException($"STD Location with ID '{id}' was not found.");
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

        var location = new StdLocation
        {
            ShopId = createStdLocationDto.ShopId,
            CollectionTypeId = createStdLocationDto.CollectionTypeId,
            LocationName = createStdLocationDto.LocationName.Trim(),
            PostCode = NormalisePostCode(createStdLocationDto.PostCode),
            IsActive = true
        };

        context.StdLocations.Add(location);

        await SaveWithUniqueConstraintHandlingAsync(cancellationToken);

        return await GetByIdAsync(location.Id, cancellationToken);
    }

    public async Task<StdLocationSummaryDto> UpdateAsync(Guid id, UpdateStdLocationDto updateStdLocationDto,
        CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(updateStdLocationDto, cancellationToken);

        await EnsureShopExistsAsync(updateStdLocationDto.ShopId, cancellationToken);
        await EnsureCollectionTypeExistsAsync(updateStdLocationDto.CollectionTypeId, cancellationToken);

        var location = await LoadForUpdateAsync(id, cancellationToken);

        location.ShopId = updateStdLocationDto.ShopId;
        location.CollectionTypeId = updateStdLocationDto.CollectionTypeId;
        location.LocationName = updateStdLocationDto.LocationName.Trim();
        location.PostCode = NormalisePostCode(updateStdLocationDto.PostCode);

        await SaveWithUniqueConstraintHandlingAsync(cancellationToken);

        return await GetByIdAsync(location.Id, cancellationToken);
    }

    public async Task ActivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var location = await LoadForUpdateAsync(id, cancellationToken);
        location.IsActive = true;
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeactivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var location = await LoadForUpdateAsync(id, cancellationToken);
        location.IsActive = false;
        await context.SaveChangesAsync(cancellationToken);
    }

    private IQueryable<JoinedStdLocation> BuildAdminQuery(StdLocationAdminQueryDto query)
    {
        var joinedQuery = BuildJoinedQuery(query.IncludeInactive);

        if (query.ShopId.HasValue)
        {
            joinedQuery = joinedQuery.Where(x => x.Location.ShopId == query.ShopId.Value);
        }

        if (query.CollectionTypeId.HasValue)
        {
            joinedQuery = joinedQuery.Where(x => x.Location.CollectionTypeId == query.CollectionTypeId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim();

            joinedQuery = joinedQuery.Where(x =>
                x.Location.LocationName.Contains(term) ||
                x.Location.PostCode.Contains(term) ||
                x.Shop.Code.Contains(term) ||
                x.Shop.Name.Contains(term) ||
                x.CollectionType.Code.Contains(term) ||
                x.CollectionType.Name.Contains(term));
        }

        return joinedQuery;
    }

    private IQueryable<JoinedStdLocation> BuildJoinedQuery(bool includeInactive)
    {
        var locations = includeInactive
            ? context.StdLocations.IgnoreQueryFilters().AsNoTracking()
            : context.StdLocations.AsNoTracking();

        var shops = context.Shops
            .IgnoreQueryFilters()
            .AsNoTracking();

        var collectionTypes = context.StdCollectionTypes
            .IgnoreQueryFilters()
            .AsNoTracking();

        return
            from location in locations
            join shop in shops on location.ShopId equals shop.Id
            join collectionType in collectionTypes on location.CollectionTypeId equals collectionType.Id
            select new JoinedStdLocation(location, shop, collectionType);
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
                    "LocationName",
                    "A STD location already exists for this shop, collection type, location name and postcode.")
            ]);
        }
    }

    private static string NormalisePostCode(string value)
    {
        return value.Trim().ToUpperInvariant();
    }

    private sealed record JoinedStdLocation(StdLocation Location, Shop Shop, StdCollectionType CollectionType);
}