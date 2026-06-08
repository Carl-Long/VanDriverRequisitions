using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.VanDrivers.Dtos;
using VanDriverRequisitions.Application.Features.VanDrivers.Mappings;
using VanDriverRequisitions.Domain.Entities.Common;

namespace VanDriverRequisitions.Application.Features.VanDrivers.Services;

public class VanDriverService(IApplicationDbContext context) : IVanDriverService
{
    public async Task<PagedResult<VanDriverLookupDto>> SearchAsync(
        string? search,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = context.VanDrivers.Where(x => x.IsActive);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(x => x.Code.Contains(term) || x.TradersName.Contains(term));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(x => x.Code)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(VanDriverProjections.AsLookupDto)
            .ToListAsync(cancellationToken);

        return new PagedResult<VanDriverLookupDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
        };
    }

    public async Task<VanDriverLookupDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var driver = await context.VanDrivers
            .Where(x => x.Id == id)
            .Select(VanDriverProjections.AsLookupDto)
            .FirstOrDefaultAsync(cancellationToken);

        return driver ?? throw new NotFoundException($"Van driver with ID '{id}' was not found.");
    }
}
