using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.VanDrivers.Dtos;
using VanDriverRequisitions.Application.Features.VanDrivers.Mappings;

namespace VanDriverRequisitions.Application.Features.VanDrivers.Services;

public class VanDriverService(IApplicationDbContext context, IValidatorService validator) : IVanDriverService
{
    public async Task<PagedResult<VanDriverLookupDto>> SearchAsync(VanDriverSearchQueryDto queryDto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(queryDto, cancellationToken);

        var query = context.VanDrivers
            .AsNoTracking()
            .Where(x => x.IsActive);

        if (!string.IsNullOrWhiteSpace(queryDto.Search))
        {
            var term = queryDto.Search.Trim();

            query = query.Where(x =>
                x.Code.Contains(term) ||
                x.TradersName.Contains(term));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(x => x.Code)
            .Skip((queryDto.Page - 1) * queryDto.PageSize)
            .Take(queryDto.PageSize)
            .Select(VanDriverProjections.AsLookupDto)
            .ToListAsync(cancellationToken);

        return new PagedResult<VanDriverLookupDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = queryDto.Page,
            PageSize = queryDto.PageSize,
        };
    }

    public async Task<VanDriverLookupDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var driver = await context.VanDrivers
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(VanDriverProjections.AsLookupDto)
            .FirstOrDefaultAsync(cancellationToken);

        return driver ?? throw new NotFoundException($"Van driver with ID '{id}' was not found.");
    }
}
