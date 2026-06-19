using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Features.StdLocations.Dtos;
using VanDriverRequisitions.Application.Features.StdLocations.Mappings;

namespace VanDriverRequisitions.Application.Features.StdLocations.Services;

public sealed class StdLocationService(IApplicationDbContext context, IValidatorService validator) : IStdLocationService
{
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
}