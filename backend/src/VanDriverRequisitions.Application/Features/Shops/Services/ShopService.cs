using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Features.Shops.Dtos;
using VanDriverRequisitions.Application.Features.Shops.Mappings;
using VanDriverRequisitions.Domain.Entities.Common;

namespace VanDriverRequisitions.Application.Features.Shops.Services;

public class ShopService(IApplicationDbContext context) : IShopService
{
    public async Task<List<ShopLookupDto>> GetActiveLookupsAsync(CancellationToken cancellationToken = default)
    {
        return await context.Shops
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.Code)
            .Select(ShopProjections.AsLookupDto)
            .ToListAsync(cancellationToken);
    }
}
