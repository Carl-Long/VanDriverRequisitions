using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Features.StdCollectionTypes.Dtos;
using VanDriverRequisitions.Application.Features.StdCollectionTypes.Mappings;

namespace VanDriverRequisitions.Application.Features.StdCollectionTypes.Services;

public sealed class StdCollectionTypeService(IApplicationDbContext context) : IStdCollectionTypeService
{
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
}